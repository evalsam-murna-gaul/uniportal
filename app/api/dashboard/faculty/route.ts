import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Grade from '@/models/Grade';
import Attendance from '@/models/Attendance';
import Announcement from '@/models/Announcements';
import { apiError, apiSuccess } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'faculty') return apiError('Forbidden', 403);

    await connectDB();

    const facultyId = session.user.id;

    // Get faculty's courses
    const courses = await Course.find({ faculty: facultyId, isActive: true }).lean();
    const courseIds = courses.map(c => c._id);

    // Parallel fetch all stats
    const [enrollCounts, gradeCount, attendanceCount, announcements] = await Promise.all([
      Enrollment.aggregate([
        { $match: { course: { $in: courseIds }, status: 'approved' } },
        { $group: { _id: '$course', count: { $sum: 1 } } },
      ]),
      Grade.countDocuments({ course: { $in: courseIds } }),
      Attendance.countDocuments({ course: { $in: courseIds } }),
      Announcement.find({
        targetRole: { $in: ['all', 'faculty'] },
        $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
      }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const countMap = new Map(enrollCounts.map((e: { _id: string; count: number }) => [e._id.toString(), e.count]));
    const totalStudents = enrollCounts.reduce((sum: number, e: { count: number }) => sum + e.count, 0);

    const coursesWithCounts = courses.map(c => ({
      ...c,
      studentCount: countMap.get(c._id.toString()) ?? 0,
    }));

    return apiSuccess({
      courseCount: courses.length,
      studentCount: totalStudents,
      gradeCount,
      attendanceCount,
      courses: coursesWithCounts,
      announcements,
    });
  } catch (err) {
    console.error('[GET /api/dashboard/faculty]', err);
    return apiError('Failed to load dashboard', 500);
  }
}