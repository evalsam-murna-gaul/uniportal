import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import { updateCourseSchema } from '@/lib/validations';
import { apiError, apiSuccess } from '@/lib/utils';
import { audit } from '@/lib/audit';

// GET /api/courses/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError('Unauthorized', 401);

    await connectDB();
    const course = await Course.findById(params.id).populate('faculty', 'name email').lean();
    if (!course) return apiError('Course not found', 404);

    return apiSuccess(course);
  } catch (err) {
    console.error('[GET /api/courses/[id]]', err);
    return apiError('Failed to fetch course', 500);
  }
}

// PUT /api/courses/[id] — Admin only
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    const body = await req.json();
    const parsed = updateCourseSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

    await connectDB();
    const course = await Course.findByIdAndUpdate(params.id, parsed.data, { new: true }).populate('faculty', 'name email');
    if (!course) return apiError('Course not found', 404);

    audit({ actorId: session.user.id, action: 'UPDATE_COURSE', resource: 'Course', resourceId: params.id });
    return apiSuccess(course, 'Course updated successfully');
  } catch (err) {
    console.error('[PUT /api/courses/[id]]', err);
    return apiError('Failed to update course', 500);
  }
}

// DELETE /api/courses/[id] — Admin only (soft delete)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    await connectDB();
    const course = await Course.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!course) return apiError('Course not found', 404);

    audit({ actorId: session.user.id, action: 'DELETE_COURSE', resource: 'Course', resourceId: params.id });
    return apiSuccess(null, 'Course deactivated successfully');
  } catch (err) {
    console.error('[DELETE /api/courses/[id]]', err);
    return apiError('Failed to deactivate course', 500);
  }
}