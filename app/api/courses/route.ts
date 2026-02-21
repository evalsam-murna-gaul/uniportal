import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { createCourseSchema } from '@/lib/validations';
import { apiError, apiSuccess, getPagination, zodMessage} from '@/lib/utils';
import { audit } from '@/lib/audit';

// GET /api/courses — list all active courses with enrollment status for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError('Unauthorized', 401);

    await connectDB();

    const { searchParams } = req.nextUrl;
    const { limit, skip } = getPagination(searchParams);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const semester = searchParams.get('semester') || '';

    const query: Record<string, unknown> = { isActive: true };
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('faculty', 'name email')
        .sort({ code: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
    ]);

    // For students: attach enrollment status per course
    let enriched = courses;
    if (session.user.role === 'student') {
      const enrollments = await Enrollment.find({
        student: session.user.id,
        course: { $in: courses.map(c => c._id) },
      }).lean();

      const enrollMap = new Map(enrollments.map(e => [e.course.toString(), e.status]));

      // Count approved enrollments per course
      const enrollCounts = await Enrollment.aggregate([
        { $match: { course: { $in: courses.map(c => c._id) }, status: 'approved' } },
        { $group: { _id: '$course', count: { $sum: 1 } } },
      ]);
      const countMap = new Map(enrollCounts.map(e => [e._id.toString(), e.count]));

      enriched = courses.map(c => ({
        ...c,
        isEnrolled: enrollMap.has(c._id.toString()),
        enrollmentStatus: enrollMap.get(c._id.toString()) ?? null,
        enrolledCount: countMap.get(c._id.toString()) ?? 0,
      }));
    }

    return apiSuccess({ courses: enriched, total, page: skip / limit + 1 });
  } catch (err) {
    console.error('[GET /api/courses]', err);
    return apiError('Failed to fetch courses', 500);
  }
}

// POST /api/courses — Admin only: create a new course
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    const body = await req.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) return apiError(zodMessage(parsed.error), 400);

    await connectDB();

    const existing = await Course.findOne({ code: parsed.data.code });
    if (existing) return apiError(`Course code ${parsed.data.code} already exists`, 409);

    const course = await Course.create(parsed.data);
    await course.populate('faculty', 'name email');

    audit({ actorId: session.user.id, action: 'CREATE_COURSE', resource: 'Course', resourceId: course._id.toString(), metadata: { code: course.code } });

    return apiSuccess(course, 'Course created successfully', 201);
  } catch (err) {
    console.error('[POST /api/courses]', err);
    return apiError('Failed to create course', 500);
  }
}