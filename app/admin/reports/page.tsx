'use client';

import { useEffect, useState } from 'react';

interface ReportData {
  enrollmentsByStatus: { status: string; count: number }[];
  gradeDistribution: { letter: string; count: number }[];
  attendanceSummary: { status: string; count: number }[];
  topCourses: { code: string; title: string; enrolledCount: number }[];
  auditLogs: { _id: string; actor: { name: string }; action: string; resource: string; timestamp: string }[];
}

const gradeColors: Record<string, string> = {
  A: 'bg-green-500', B: 'bg-blue-500', C: 'bg-yellow-500', D: 'bg-orange-400', F: 'bg-red-500',
};

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      const res = await fetch('/api/dashboard/admin?reports=true');
      const json = await res.json();
      setData(json.data?.reports ?? null);
      setLoading(false);
    }
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-white rounded-xl border border-gray-200" />)}
      </div>
    );
  }

  const totalGrades = data?.gradeDistribution?.reduce((s, g) => s + g.count, 0) ?? 1;
  const totalAttendance = data?.attendanceSummary?.reduce((s, a) => s + a.count, 0) ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">System-wide performance overview and audit trail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Grade Distribution</h2>
          {data?.gradeDistribution?.length ? (
            <div className="space-y-3">
              {data.gradeDistribution.map(g => (
                <div key={g.letter} className="flex items-center gap-3">
                  <span className="w-6 text-sm font-bold text-gray-700">{g.letter}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${gradeColors[g.letter] ?? 'bg-gray-400'}`}
                      style={{ width: `${Math.round((g.count / totalGrades) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{g.count}</span>
                  <span className="text-xs text-gray-400 w-10">
                    {Math.round((g.count / totalGrades) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No grade data yet.</p>}
        </div>

        {/* Attendance summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Attendance Summary</h2>
          {data?.attendanceSummary?.length ? (
            <div className="space-y-3">
              {data.attendanceSummary.map(a => {
                const pct = Math.round((a.count / totalAttendance) * 100);
                const color = a.status === 'present' ? 'bg-green-500' : a.status === 'late' ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <div key={a.status} className="flex items-center gap-3">
                    <span className="w-14 text-xs font-medium text-gray-700 capitalize">{a.status}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{a.count}</span>
                    <span className="text-xs text-gray-400 w-10">{pct}%</span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-gray-400">No attendance data yet.</p>}
        </div>

        {/* Top courses by enrollment */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Top Courses by Enrollment</h2>
          {data?.topCourses?.length ? (
            <div className="space-y-2">
              {data.topCourses.map((c, i) => (
                <div key={c.code} className="flex items-center gap-3">
                  <span className="w-5 text-xs text-gray-400 font-medium">{i + 1}</span>
                  <span className="font-mono text-xs text-blue-600 font-bold w-16">{c.code}</span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{c.title}</span>
                  <span className="text-sm font-semibold text-gray-900">{c.enrolledCount}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No enrollment data yet.</p>}
        </div>

        {/* Enrollment by status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Enrollments by Status</h2>
          {data?.enrollmentsByStatus?.length ? (
            <div className="grid grid-cols-3 gap-3">
              {data.enrollmentsByStatus.map(e => {
                const color = e.status === 'approved' ? 'bg-green-50 border-green-200 text-green-700'
                  : e.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                  : 'bg-red-50 border-red-200 text-red-700';
                return (
                  <div key={e.status} className={`rounded-xl border p-4 text-center ${color}`}>
                    <p className="text-2xl font-bold">{e.count}</p>
                    <p className="text-xs capitalize mt-0.5 opacity-80">{e.status}</p>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-gray-400">No enrollment data yet.</p>}
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Recent Audit Log</h2>
          <p className="text-xs text-gray-400 mt-0.5">Last 50 system actions</p>
        </div>
        {data?.auditLogs?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Actor', 'Action', 'Resource', 'Timestamp'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.auditLogs.map((log, i) => (
                  <tr key={log._id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="py-3 px-4 font-medium text-gray-700">{log.actor?.name ?? '—'}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{log.action}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{log.resource}</td>
                    <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">No audit logs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}