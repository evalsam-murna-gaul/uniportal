import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { apiError, apiSuccess } from '@/lib/utils';
import { audit } from '@/lib/audit';

// POST /api/courses/[id]/enroll — Student enroll in a course
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') return apiError('Forbidden', 403);

    await connectDB();

    const course = await Course.findById(params.id);
    if (!course || !course.isActive) return apiError('Course not found', 404);

    // Check if already enrolled
    const existing = await Enrollment.findOne({ student: session.user.id, course: params.id });
    if (existing) {
      if (existing.status === 'dropped') {
        // Re-enroll
        existing.status = 'pending';
        await existing.save();
        return apiSuccess(existing, 'Re-enrollment request submitted');
      }
      return apiError('You are already enrolled in this course', 409);
    }

    // Check capacity
    const approvedCount = await Enrollment.countDocuments({ course: params.id, status: 'approved' });
    if (approvedCount >= course.maxCapacity) return apiError('Course is at full capacity', 400);

    const enrollment = await Enrollment.create({
      student: session.user.id,
      course: params.id,
      status: 'pending',
    });

    audit({ actorId: session.user.id, action: 'ENROLL_COURSE', resource: 'Enrollment', resourceId: enrollment._id.toString(), metadata: { courseId: params.id, courseCode: course.code } });

    return apiSuccess(enrollment, 'Enrollment request submitted. Awaiting approval.', 201);
  } catch (err) {
    console.error('[POST /api/courses/[id]/enroll]', err);
    return apiError('Failed to enroll', 500);
  }
}

// DELETE /api/courses/[id]/enroll — Student drop a course
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') return apiError('Forbidden', 403);

    await connectDB();

    const enrollment = await Enrollment.findOneAndUpdate(
      { student: session.user.id, course: params.id, status: { $ne: 'dropped' } },
      { status: 'dropped' },
      { new: true }
    );

    if (!enrollment) return apiError('Enrollment not found', 404);

    audit({ actorId: session.user.id, action: 'DROP_COURSE', resource: 'Enrollment', resourceId: enrollment._id.toString(), metadata: { courseId: params.id } });

    return apiSuccess(null, 'Course dropped successfully');
  } catch (err) {
    console.error('[DELETE /api/courses/[id]/enroll]', err);
    return apiError('Failed to drop course', 500);
  }
}