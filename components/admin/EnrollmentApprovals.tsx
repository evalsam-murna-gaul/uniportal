'use client';

import { useEffect, useState } from 'react';

interface Enrollment {
  _id: string;
  student: { name: string; email: string; studentId?: string };
  course: { code: string; title: string; maxCapacity: number };
  status: string;
  enrolledAt: string;
}

export default function EnrollmentApprovals() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => { fetchEnrollments(); }, [statusFilter]);

  async function fetchEnrollments() {
    setLoading(true);
    const params = new URLSearchParams({ status: statusFilter, limit: '50' });
    const res = await fetch(`/api/enrollments?${params}`);
    const data = await res.json();
    setEnrollments(data.data?.enrollments ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'approved' | 'dropped') {
    setProcessing(id);
    await fetch(`/api/enrollments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setProcessing(null);
    fetchEnrollments();
  }

  async function bulkApprove() {
    const pending = enrollments.filter(e => e.status === 'pending');
    if (!confirm(`Approve all ${pending.length} pending enrollments?`)) return;
    await Promise.all(pending.map(e => updateStatus(e._id, 'approved')));
  }

  const pending = enrollments.filter(e => e.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {['pending', 'approved', 'dropped'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s === 'pending' ? '⏳' : s === 'approved' ? '✅' : '❌'} {s}
            </button>
          ))}
        </div>

        {statusFilter === 'pending' && pending.length > 0 && (
          <button
            onClick={bulkApprove}
            className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
          >
            ✅ Approve All ({pending.length})
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">⏳</p>
            <p className="text-sm">No {statusFilter} enrollments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Student', 'Student ID', 'Course', 'Requested', 'Status', ...(statusFilter === 'pending' ? ['Actions'] : [])].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e, i) => (
                  <tr key={e._id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">{e.student.name}</p>
                      <p className="text-xs text-gray-400">{e.student.email}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{e.student.studentId ?? '—'}</td>
                    <td className="py-3 px-4">
                      <p className="font-mono text-xs text-blue-600 font-bold">{e.course.code}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[160px]">{e.course.title}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(e.enrolledAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        e.status === 'approved' ? 'bg-green-100 text-green-700' :
                        e.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    {statusFilter === 'pending' && (
                      <td className="py-3 px-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => updateStatus(e._id, 'approved')}
                            disabled={processing === e._id}
                            className="text-xs text-green-600 font-medium hover:underline disabled:opacity-50"
                          >
                            {processing === e._id ? '…' : 'Approve'}
                          </button>
                          <button
                            onClick={() => updateStatus(e._id, 'dropped')}
                            disabled={processing === e._id}
                            className="text-xs text-red-500 font-medium hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}