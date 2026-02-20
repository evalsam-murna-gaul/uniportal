import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { apiError, apiSuccess, zodMessage } from '@/lib/utils';
import { audit } from '@/lib/audit';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['approved', 'dropped']),
});

// PUT /api/enrollments/[id] — Admin: approve or reject an enrollment
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return apiError(zodMessage(parsed.error), 400);

    await connectDB();

    const enrollment = await Enrollment.findByIdAndUpdate(
      params.id,
      { status: parsed.data.status },
      { new: true }
    )
      .populate('student', 'name email')
      .populate('course', 'code title');

    if (!enrollment) return apiError('Enrollment not found', 404);

    audit({
      actorId: session.user.id,
      action: parsed.data.status === 'approved' ? 'APPROVE_ENROLLMENT' : 'REJECT_ENROLLMENT',
      resource: 'Enrollment',
      resourceId: params.id,
      metadata: {
        student: (enrollment.student as { name: string }).name,
        course: (enrollment.course as { code: string }).code,
      },
    });

    return apiSuccess(
      enrollment,
      `Enrollment ${parsed.data.status === 'approved' ? 'approved' : 'rejected'} successfully`
    );
  } catch (err) {
    console.error('[PUT /api/enrollments/[id]]', err);
    return apiError('Failed to update enrollment', 500);
  }
}