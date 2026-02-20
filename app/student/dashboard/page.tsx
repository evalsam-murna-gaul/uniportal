import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import GPASummary from '@/components/student/GPASummary';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';

async function getDashboardData(userId: string) {
  const base = process.env.NEXTAUTH_URL;
  const res = await fetch(`${base}/api/dashboard/student?userId=${userId}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your academic overview</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Current GPA" value={data?.gpa ?? '—'} icon="🎓" color="blue" />
        <StatCard label="Enrolled Courses" value={data?.enrolledCount ?? 0} icon="📚" color="green" />
        <StatCard label="Total Credits" value={data?.totalCredits ?? 0} icon="⭐" color="purple" />
        <StatCard label="Announcements" value={data?.announcementCount ?? 0} icon="📢" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA breakdown */}
        <div className="lg:col-span-2">
          <GPASummary gpa={data?.gpa ?? 0} courseGrades={data?.courseGrades ?? []} />
        </div>

        {/* Announcements */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-gray-800">Recent Announcements</h2>
          {data?.announcements?.length ? (
            data.announcements.map((a: { _id: string; title: string; body: string; createdAt: string }) => (
              <AnnouncementBanner key={a._id} title={a.title} body={a.body} date={a.createdAt} />
            ))
          ) : (
            <p className="text-sm text-gray-400">No announcements right now.</p>
          )}
        </div>
      </div>

      {/* Enrolled courses list */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Your Courses This Semester</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.enrolledCourses?.map((c: { _id: string; code: string; title: string; faculty: { name: string }; credits: number }) => (
            <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                {c.code.slice(0, 3)}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.code} • {c.faculty?.name} • {c.credits} credits</p>
              </div>
            </div>
          ))}
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