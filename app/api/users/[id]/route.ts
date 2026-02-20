import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { updateUserSchema } from '@/lib/validations';
import { apiError, apiSuccess, zodMessage } from '@/lib/utils';
import { audit } from '@/lib/audit';

// GET /api/users/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError('Unauthorized', 401);

    // Users can only view their own profile unless they are admin
    if (session.user.role !== 'admin' && session.user.id !== id) {
      return apiError('Forbidden', 403);
    }

    await connectDB();
    const user = await User.findById(id).select('-passwordHash').lean();
    if (!user) return apiError('User not found', 404);

    return apiSuccess(user);
  } catch (err) {
    console.error('[GET /api/users/[id]]', err);
    return apiError('Failed to fetch user', 500);
  }
}

// PUT /api/users/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError('Unauthorized', 401);

    if (session.user.role !== 'admin' && session.user.id !== id) {
      return apiError('Forbidden', 403);
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return apiError(zodMessage(parsed.error), 400);

    // Non-admins cannot change isActive
    if (session.user.role !== 'admin') delete parsed.data.isActive;

    await connectDB();
    const user = await User.findByIdAndUpdate(id, parsed.data, { new: true }).select('-passwordHash');
    if (!user) return apiError('User not found', 404);

    audit({ actorId: session.user.id, action: 'UPDATE_USER', resource: 'User', resourceId: id });

    return apiSuccess(user, 'Profile updated successfully');
  } catch (err) {
    console.error('[PUT /api/users/[id]]', err);
    return apiError('Failed to update user', 500);
  }
}

// DELETE /api/users/[id] — Admin only (deactivate)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    await connectDB();
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-passwordHash');
    if (!user) return apiError('User not found', 404);

    audit({ actorId: session.user.id, action: 'DEACTIVATE_USER', resource: 'User', resourceId: id });

    return apiSuccess(null, 'User deactivated successfully');
  } catch (err) {
    console.error('[DELETE /api/users/[id]]', err);
    return apiError('Failed to deactivate user', 500);
  }
}