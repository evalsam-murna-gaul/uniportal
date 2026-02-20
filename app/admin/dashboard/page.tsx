import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

async function getAdminDashboard() {
  const base = process.env.NEXTAUTH_URL;
  const res = await fetch(`${base}/api/dashboard/admin`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const data = await getAdminDashboard();

  const quickLinks = [
    { label: 'Manage Users', href: '/admin/users', icon: '👥', desc: 'Create, edit, deactivate accounts' },
    { label: 'Manage Courses', href: '/admin/courses', icon: '📚', desc: 'Create courses, assign faculty' },
    { label: 'Announcements', href: '/admin/announcements', icon: '📢', desc: 'Post system-wide notices' },
    { label: 'Reports', href: '/admin/reports', icon: '📈', desc: 'Analytics and audit logs' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard 🛡️
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {session?.user.name}. Here&apos;s a system-wide overview.
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: data?.studentCount ?? 0, icon: '🎓', color: 'blue' },
          { label: 'Total Faculty', value: data?.facultyCount ?? 0, icon: '👨‍🏫', color: 'green' },
          { label: 'Active Courses', value: data?.courseCount ?? 0, icon: '📚', color: 'purple' },
          { label: 'Pending Enrollments', value: data?.pendingEnrollments ?? 0, icon: '⏳', color: 'orange', href: '/admin/users' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
              ${s.color === 'blue' ? 'bg-blue-50' : s.color === 'green' ? 'bg-green-50' : s.color === 'purple' ? 'bg-purple-50' : 'bg-orange-50'}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick links */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map(ql => (
            <Link
              key={ql.href} href={ql.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all flex items-start gap-4"
            >
              <span className="text-3xl">{ql.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{ql.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{ql.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Registrations</h2>
          <div className="space-y-3">
            {data?.recentUsers?.length ? (
              data.recentUsers.map((u: { _id: string; name: string; role: string; email: string; createdAt: string }) => (
                <div key={u._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{u.role}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No recent registrations.</p>
            )}
          </div>
        </div>
      </div>

      {/* Department breakdown */}
      {data?.departmentStats?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Students by Department</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.departmentStats.map((d: { department: string; count: number }) => (
              <div key={d.department} className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
                <p className="text-xl font-bold text-gray-900">{d.count}</p>
                <p className="text-xs text-gray-500 truncate">{d.department || 'Unassigned'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}