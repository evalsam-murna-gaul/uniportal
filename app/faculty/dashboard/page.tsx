import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';

async function getFacultyDashboard(userId: string) {
  const base = process.env.NEXTAUTH_URL;
  const res = await fetch(`${base}/api/dashboard/faculty?userId=${userId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function FacultyDashboard() {
  const session = await getServerSession(authOptions);
  const data = await getFacultyDashboard(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session?.user.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your teaching overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Courses" value={data?.courseCount ?? 0} icon="📚" color="blue" />
        <StatCard label="Total Students" value={data?.studentCount ?? 0} icon="👥" color="green" />
        <StatCard label="Grades Submitted" value={data?.gradeCount ?? 0} icon="📝" color="purple" />
        <StatCard label="Attendance Records" value={data?.attendanceCount ?? 0} icon="✅" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold text-gray-800">Your Courses This Semester</h2>
          {data?.courses?.length ? (
            data.courses.map((c: { _id: string; code: string; title: string; credits: number; department: string; studentCount: number }) => (
              <Link
                key={c._id}
                href={`/faculty/courses/${c._id}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                  {c.code.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.code} • {c.department} • {c.credits} credits</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{c.studentCount}</p>
                  <p className="text-xs text-gray-400">students</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">No courses assigned yet.</p>
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-800">Announcements</h2>
          {data?.announcements?.length ? (
            data.announcements.map((a: { _id: string; title: string; body: string; createdAt: string }) => (
              <AnnouncementBanner key={a._id} title={a.title} body={a.body} date={a.createdAt} />
            ))
          ) : (
            <p className="text-sm text-gray-400">No announcements right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}