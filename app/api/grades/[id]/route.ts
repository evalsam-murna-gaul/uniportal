import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Grade from '@/models/Grade';
import Course from '@/models/Course';
import { updateGradeSchema } from '@/lib/validations';
import { apiError, apiSuccess, zodMessage } from '@/lib/utils';
import { audit } from '@/lib/audit';

// PUT /api/grades/[id] — Faculty: update a grade they submitted
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['faculty', 'admin'].includes(session.user.role)) {
      return apiError('Forbidden', 403);
    }

    const body = await req.json();
    const parsed = updateGradeSchema.safeParse(body);
    if (!parsed.success) return apiError(zodMessage(parsed.error), 400);

    await connectDB();

    const grade = await Grade.findById(id).populate('course');
    if (!grade) return apiError('Grade not found', 404);

    // Faculty can only edit grades for their own courses
    if (session.user.role === 'faculty') {
      const course = await Course.findById(grade.course);
      if (!course || course.faculty.toString() !== session.user.id) {
        return apiError('Forbidden — this grade is not in your course', 403);
      }
    }

    if (parsed.data.score !== undefined && parsed.data.maxScore !== undefined) {
      if (parsed.data.score > parsed.data.maxScore) {
        return apiError('Score cannot exceed max score', 400);
      }
    }

    if (parsed.data.score !== undefined && !parsed.data.maxScore) {
      if (parsed.data.score > grade.maxScore) {
        return apiError(`Score cannot exceed max score of ${grade.maxScore}`, 400);
      }
    }

    Object.assign(grade, parsed.data);
    grade.gradedBy = session.user.id as unknown as typeof grade.gradedBy;
    await grade.save();

    audit({ actorId: session.user.id, action: 'UPDATE_GRADE', resource: 'Grade', resourceId: id, metadata: { score: parsed.data.score } });

    return apiSuccess(grade, 'Grade updated successfully');
  } catch (err) {
    console.error('[PUT /api/grades/[id]]', err);
    return apiError('Failed to update grade', 500);
  }
}

// DELETE /api/grades/[id] — Admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    await connectDB();
    const grade = await Grade.findByIdAndDelete(id);
    if (!grade) return apiError('Grade not found', 404);

    audit({ actorId: session.user.id, action: 'DELETE_GRADE', resource: 'Grade', resourceId: id });
    return apiSuccess(null, 'Grade deleted successfully');
  } catch (err) {
    console.error('[DELETE /api/grades/[id]]', err);
    return apiError('Failed to delete grade', 500);
  }
}