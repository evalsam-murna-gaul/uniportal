import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Announcement from '@/models/Announcements';
import { createAnnouncementSchema } from '@/lib/validations';
import { apiError, apiSuccess, getPagination } from '@/lib/utils';
import { audit } from '@/lib/audit';

// GET /api/announcements — All authenticated users: get announcements targeted to their role
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError('Unauthorized', 401);

    await connectDB();

    const { searchParams } = req.nextUrl;
    const { limit, skip } = getPagination(searchParams);

    const targetFilter = { $in: ['all', session.user.role] };

    const [announcements, total] = await Promise.all([
      Announcement.find({
        targetRole: targetFilter,
        $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
      })
        .populate('author', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Announcement.countDocuments({ targetRole: targetFilter }),
    ]);

    return apiSuccess({ announcements, total });
  } catch (err) {
    console.error('[GET /api/announcements]', err);
    return apiError('Failed to fetch announcements', 500);
  }
}

// POST /api/announcements — Admin only: create announcement
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    const body = await req.json();
    const parsed = createAnnouncementSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

    await connectDB();

    const announcement = await Announcement.create({
      ...parsed.data,
      author: session.user.id,
    });

    await announcement.populate('author', 'name role');

    audit({ actorId: session.user.id, action: 'CREATE_ANNOUNCEMENT', resource: 'Announcement', resourceId: announcement._id.toString() });

    return apiSuccess(announcement, 'Announcement posted successfully', 201);
  } catch (err) {
    console.error('[POST /api/announcements]', err);
    return apiError('Failed to post announcement', 500);
  }
}