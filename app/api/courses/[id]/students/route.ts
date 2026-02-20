import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { apiError, apiSuccess } from '@/lib/utils';

// GET /api/courses/[id]/students — Faculty (own course) or Admin
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError('Unauthorized', 401);

    await connectDB();

    const course = await Course.findById(params.id).lean();
    if (!course) return apiError('Course not found', 404);

    // Faculty can only view students for their own courses
    if (session.user.role === 'faculty' && course.faculty.toString() !== session.user.id) {
      return apiError('Forbidden — this course is not assigned to you', 403);
    }

    if (!['faculty', 'admin'].includes(session.user.role)) {
      return apiError('Forbidden', 403);
    }

    const enrollments = await Enrollment.find({
      course: params.id,
      status: { $in: ['approved', 'pending'] },
    })
      .populate('student', 'name email studentId department avatar')
      .sort({ createdAt: 1 })
      .lean();

    const students = enrollments.map(e => ({
      ...(e.student as Record<string, unknown>),
      enrollmentStatus: e.status,
      enrolledAt: e.createdAt,
    }));

    return apiSuccess({ students, total: students.length });
  } catch (err) {
    console.error('[GET /api/courses/[id]/students]', err);
    return apiError('Failed to fetch students', 500);
  }
}