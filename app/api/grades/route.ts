import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Grade from '@/models/Grade';
import { createGradeSchema } from '@/lib/validations';
import { apiError, apiSuccess, calculateGPA } from '@/lib/utils';
import { audit } from '@/lib/audit';

// GET /api/grades — Student: own grades. Faculty/Admin: filter by course/student
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return apiError('Unauthorized', 401);

    await connectDB();

    const { searchParams } = req.nextUrl;
    const query: Record<string, unknown> = {};

    if (session.user.role === 'student') {
      query.student = session.user.id;
    } else {
      // Faculty/Admin can filter by course or student
      if (searchParams.get('student')) query.student = searchParams.get('student');
      if (searchParams.get('course')) query.course = searchParams.get('course');
    }

    const grades = await Grade.find(query)
      .populate('course', 'title code credits')
      .populate('gradedBy', 'name')
      .sort({ gradedAt: -1 })
      .lean();

    // Calculate GPA for students
    let gpa = 0;
    if (session.user.role === 'student') {
      // Group by course to get per-course weighted average
      const courseMap = new Map<string, { score: number; maxScore: number; credits: number }[]>();
      for (const g of grades) {
        const courseId = (g.course as { _id: string; credits: number })._id.toString();
        const credits = (g.course as { credits: number }).credits;
        if (!courseMap.has(courseId)) courseMap.set(courseId, []);
        courseMap.get(courseId)!.push({ score: g.score, maxScore: g.maxScore, credits });
      }

      const gradeInputs = [...courseMap.values()].map(entries => {
        const avgScore = entries.reduce((s, e) => s + (e.score / e.maxScore), 0) / entries.length;
        return { score: avgScore, maxScore: 1, credits: entries[0].credits };
      });

      gpa = calculateGPA(gradeInputs);
    }

    return apiSuccess({ grades, gpa });
  } catch (err) {
    console.error('[GET /api/grades]', err);
    return apiError('Failed to fetch grades', 500);
  }
}

// POST /api/grades — Faculty/Admin: create a grade entry
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['faculty', 'admin'].includes(session.user.role)) {
      return apiError('Forbidden', 403);
    }

    const body = await req.json();
    const parsed = createGradeSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message, 400);

    if (parsed.data.score > parsed.data.maxScore) {
      return apiError('Score cannot exceed max score', 400);
    }

    await connectDB();

    const grade = await Grade.create({
      ...parsed.data,
      gradedBy: session.user.id,
    });

    await grade.populate('course', 'title code');
    await grade.populate('student', 'name email');

    audit({ actorId: session.user.id, action: 'CREATE_GRADE', resource: 'Grade', resourceId: grade._id.toString(), metadata: { studentId: grade.student, courseId: grade.course } });

    return apiSuccess(grade, 'Grade submitted successfully', 201);
  } catch (err) {
    console.error('[POST /api/grades]', err);
    return apiError('Failed to submit grade', 500);
  }
}