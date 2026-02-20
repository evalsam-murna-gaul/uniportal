import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Grade from '@/models/Grade';
import Announcement from '@/models/Announcements';
import { apiError, apiSuccess, calculateGPA } from '@/lib/utils';

// GET /api/dashboard/student — aggregated data for student dashboard
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'student') return apiError('Forbidden', 403);

    await connectDB();

    const studentId = session.user.id;

    // Parallel fetch for performance
    const [enrollments, grades, announcements] = await Promise.all([
      Enrollment.find({ student: studentId, status: 'approved' })
        .populate({ path: 'course', populate: { path: 'faculty', select: 'name' } })
        .lean(),
      Grade.find({ student: studentId }).populate('course', 'title code credits').lean(),
      Announcement.find({
        targetRole: { $in: ['all', 'student'] },
        $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate GPA
    const courseMap = new Map<string, { score: number; maxScore: number; credits: number }[]>();
    for (const g of grades) {
      const courseId = (g.course as { _id: string; credits: number; title: string; code: string })._id.toString();
      const credits = (g.course as { credits: number }).credits;
      if (!courseMap.has(courseId)) courseMap.set(courseId, []);
      courseMap.get(courseId)!.push({ score: g.score, maxScore: g.maxScore, credits });
    }

    const gradeInputs = [...courseMap.values()].map(entries => {
      const avgScore = entries.reduce((s, e) => s + (e.score / e.maxScore), 0) / entries.length;
      return { score: avgScore, maxScore: 1, credits: entries[0].credits };
    });

    const gpa = calculateGPA(gradeInputs);
    const totalCredits = enrollments.reduce((sum, e) => {
      const course = e.course as { credits?: number };
      return sum + (course?.credits ?? 0);
    }, 0);

    return apiSuccess({
      gpa,
      enrolledCount: enrollments.length,
      totalCredits,
      announcementCount: announcements.length,
      enrolledCourses: enrollments.map(e => e.course),
      announcements,
      courseGrades: [], // can be extended with per-course GPA breakdown
    });
  } catch (err) {
    console.error('[GET /api/dashboard/student]', err);
    return apiError('Failed to load dashboard', 500);
  }
}