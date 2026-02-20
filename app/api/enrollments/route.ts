import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { apiError, apiSuccess, getPagination } from '@/lib/utils';

// GET /api/enrollments — Admin: list all enrollments with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    await connectDB();

    const { searchParams } = req.nextUrl;
    const { limit, skip } = getPagination(searchParams);
    const status = searchParams.get('status') || '';
    const course = searchParams.get('course') || '';
    const student = searchParams.get('student') || '';

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (course) query.course = course;
    if (student) query.student = student;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate('student', 'name email studentId')
        .populate('course', 'code title maxCapacity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enrollment.countDocuments(query),
    ]);

    // Rename createdAt to enrolledAt for clarity
    const result = enrollments.map(e => ({ ...e, enrolledAt: e.createdAt }));

    return apiSuccess({ enrollments: result, total });
  } catch (err) {
    console.error('[GET /api/enrollments]', err);
    return apiError('Failed to fetch enrollments', 500);
  }
}