import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Grade from '@/models/Grade';
import Attendance from '@/models/Attendance';
import AuditLog from '@/models/AuditLog';
import { apiError, apiSuccess } from '@/lib/utils';

function getLetterGrade(pct: number): string {
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 45) return 'D';
  return 'F';
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') return apiError('Forbidden', 403);

    await connectDB();

    const includeReports = req.nextUrl.searchParams.get('reports') === 'true';

    const [studentCount, facultyCount, courseCount, pendingEnrollments, recentUsers, departmentStats] =
      await Promise.all([
        User.countDocuments({ role: 'student', isActive: true }),
        User.countDocuments({ role: 'faculty', isActive: true }),
        Course.countDocuments({ isActive: true }),
        Enrollment.countDocuments({ status: 'pending' }),
        User.find({ isActive: true }).sort({ createdAt: -1 }).limit(8).select('name email role createdAt').lean(),
        User.aggregate([
          { $match: { role: 'student', isActive: true } },
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { department: '$_id', count: 1, _id: 0 } },
        ]),
      ]);

    let reports = null;

    if (includeReports) {
      const [enrollmentsByStatus, allGrades, attendanceSummaryRaw, topCoursesRaw, auditLogs] =
        await Promise.all([
          Enrollment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } },
          ]),
          Grade.find().lean(),
          Attendance.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } },
          ]),
          Enrollment.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$course', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'courses',
                localField: '_id',
                foreignField: '_id',
                as: 'course',
              },
            },
            { $unwind: '$course' },
            { $project: { code: '$course.code', title: '$course.title', enrolledCount: '$count', _id: 0 } },
          ]),
          AuditLog.find()
            .populate('actor', 'name')
            .sort({ timestamp: -1 })
            .limit(50)
            .lean(),
        ]);

      // Grade distribution
      const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
      for (const g of allGrades) {
        const pct = (g.score / g.maxScore) * 100;
        gradeCounts[getLetterGrade(pct)]++;
      }
      const gradeDistribution = Object.entries(gradeCounts).map(([letter, count]) => ({ letter, count }));

      reports = {
        enrollmentsByStatus,
        gradeDistribution,
        attendanceSummary: attendanceSummaryRaw,
        topCourses: topCoursesRaw,
        auditLogs,
      };
    }

    return apiSuccess({
      studentCount,
      facultyCount,
      courseCount,
      pendingEnrollments,
      recentUsers,
      departmentStats,
      reports,
    });
  } catch (err) {
    console.error('[GET /api/dashboard/admin]', err);
    return apiError('Failed to load admin dashboard', 500);
  }
}