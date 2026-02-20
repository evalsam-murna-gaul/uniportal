import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Announcement from '@/models/Announcements';
import { apiError, apiSuccess } from '@/lib/utils';
import { audit } from '@/lib/audit';

// PUT /api/announcements/[id] — Admin: edit announcement
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    const body = await req.json();
    await connectDB();

    const announcement = await Announcement.findByIdAndUpdate(params.id, body, { new: true });
    if (!announcement) return apiError('Announcement not found', 404);

    audit({ actorId: session.user.id, action: 'UPDATE_ANNOUNCEMENT', resource: 'Announcement', resourceId: params.id });
    return apiSuccess(announcement, 'Announcement updated successfully');
  } catch (err) {
    console.error('[PUT /api/announcements/[id]]', err);
    return apiError('Failed to update announcement', 500);
  }
}

// DELETE /api/announcements/[id] — Admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    await connectDB();
    const announcement = await Announcement.findByIdAndDelete(params.id);
    if (!announcement) return apiError('Announcement not found', 404);

    audit({ actorId: session.user.id, action: 'DELETE_ANNOUNCEMENT', resource: 'Announcement', resourceId: params.id });
    return apiSuccess(null, 'Announcement deleted successfully');
  } catch (err) {
    console.error('[DELETE /api/announcements/[id]]', err);
    return apiError('Failed to delete announcement', 500);
  }
}