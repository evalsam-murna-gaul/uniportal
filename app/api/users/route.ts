import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { apiError, apiSuccess, getPagination } from '@/lib/utils';

// GET /api/users — Admin: list all users with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    await connectDB();

    const { searchParams } = req.nextUrl;
    const { limit, skip } = getPagination(searchParams);
    const role = searchParams.get('role') || '';
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (isActive !== null && isActive !== '') query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return apiSuccess({ users, total });
  } catch (err) {
    console.error('[GET /api/users]', err);
    return apiError('Failed to fetch users', 500);
  }
}