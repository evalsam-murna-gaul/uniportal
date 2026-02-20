import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

export default async function FacultyCoursesPage() {
  const session = await getServerSession(authOptions);
  await connectDB();

  const courses = await Course.find({ faculty: session!.user.id, isActive: true })
    .sort({ code: 1 })
    .lean();

  // Get enrolled student count per course
  const counts = await Enrollment.aggregate([
    { $match: { course: { $in: courses.map(c => c._id) }, status: 'approved' } },
    { $group: { _id: '$course', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map(c => [c._id.toString(), c.count]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your assigned courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No courses assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(c => {
            const enrolled = countMap.get(c._id.toString()) ?? 0;
            const capacity = Math.round((enrolled / c.maxCapacity) * 100);
            return (
              <Link
                key={c._id.toString()}
                href={`/faculty/courses/${c._id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold font-mono">
                    {c.code}
                  </span>
                  <span className="text-xs text-gray-400">{c.credits} cr</span>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">{c.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{c.department} • {c.semester}</p>
                </div>

                {/* Capacity bar */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{enrolled} / {c.maxCapacity} students</span>
                    <span>{capacity}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${capacity >= 90 ? 'bg-red-400' : capacity >= 70 ? 'bg-yellow-400' : 'bg-green-400'}`}
                      style={{ width: `${Math.min(capacity, 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-blue-600 font-medium">View Course →</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}