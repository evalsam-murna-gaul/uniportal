import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Attendance from '@/models/Attendance';
import Course from '@/models/Course';
import { markAttendanceSchema } from '@/lib/validations';
import { apiError, apiSuccess, zodMessage, getPagination } from '@/lib/utils';
import { audit } from '@/lib/audit';

// GET /api/attendance — Faculty: own courses. Admin: all.
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['faculty', 'admin'].includes(session.user.role)) {
      return apiError('Forbidden', 403);
    }

    await connectDB();

    const { searchParams } = req.nextUrl;
    const { limit, skip } = getPagination(searchParams);
    const courseFilter = searchParams.get('course');
    const dateFilter = searchParams.get('date');
    const studentFilter = searchParams.get('student');

    const query: Record<string, unknown> = {};
    if (studentFilter) query.student = studentFilter;
    if (dateFilter) {
      const start = new Date(dateFilter);
      const end = new Date(dateFilter);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }

    // Faculty: restrict to their own courses
    if (session.user.role === 'faculty') {
      const myCourses = await Course.find({ faculty: session.user.id }).select('_id code title').lean();
      const courseIds = myCourses.map(c => c._id);

      if (courseFilter) {
        const match = myCourses.find(c => c.code === courseFilter);
        query.course = match ? match._id : null;
      } else {
        query.course = { $in: courseIds };
      }
    } else if (courseFilter) {
      const course = await Course.findOne({ code: courseFilter }).select('_id').lean();
      query.course = course ? course._id : null;
    }

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('student', 'name studentId')
        .populate('course', 'code title')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attendance.countDocuments(query),
    ]);

    return apiSuccess({ records, total });
  } catch (err) {
    console.error('[GET /api/attendance]', err);
    return apiError('Failed to fetch attendance', 500);
  }
}

// POST /api/attendance — Faculty/Admin: mark attendance for a course date
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['faculty', 'admin'].includes(session.user.role)) {
      return apiError('Forbidden', 403);
    }

    const body = await req.json();
    const parsed = markAttendanceSchema.safeParse(body);
    if (!parsed.success) return apiError(zodMessage(parsed.error), 400);

    const { course: courseId, date, records } = parsed.data;

    await connectDB();

    // Verify course ownership for faculty
    if (session.user.role === 'faculty') {
      const course = await Course.findById(courseId);
      if (!course || course.faculty.toString() !== session.user.id) {
        return apiError('Forbidden — this course is not assigned to you', 403);
      }
    }

    const attendanceDate = new Date(date);

    // Upsert each record (allow re-marking same day)
    const ops = records.map(r =>
      Attendance.findOneAndUpdate(
        { student: r.student, course: courseId, date: attendanceDate },
        { status: r.status, markedBy: session.user.id, note: r.note },
        { upsert: true, new: true }
      )
    );

    const saved = await Promise.all(ops);

    audit({
      actorId: session.user.id,
      action: 'MARK_ATTENDANCE',
      resource: 'Attendance',
      metadata: { courseId, date, recordCount: records.length },
    });

    return apiSuccess({ saved: saved.length }, `Attendance marked for ${saved.length} students`, 201);
  } catch (err) {
    console.error('[POST /api/attendance]', err);
    return apiError('Failed to mark attendance', 500);
  }
}