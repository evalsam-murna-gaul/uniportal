'use client';

import { useEffect, useState } from 'react';

interface AttendanceRecord {
  _id: string;
  student: { name: string; studentId?: string };
  course: { code: string; title: string };
  date: string;
  status: 'present' | 'absent' | 'late';
  note?: string;
}

const statusStyles = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
};

export default function FacultyAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [courseFilter, dateFilter]);

  async function fetchRecords() {
    setLoading(true);
    const params = new URLSearchParams();
    if (courseFilter) params.set('course', courseFilter);
    if (dateFilter) params.set('date', dateFilter);
    const res = await fetch(`/api/attendance?${params}`);
    const data = await res.json();
    setRecords(data.data?.records ?? []);
    setLoading(false);
  }

  const courses = [...new Map(records.map(r => [r.course.code, r.course])).values()];

  // Summary stats
  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-gray-500 text-sm mt-1">View attendance history across all your courses</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, color: 'bg-gray-50 text-gray-700' },
          { label: 'Present', value: present, color: 'bg-green-50 text-green-700' },
          { label: 'Absent', value: absent, color: 'bg-red-50 text-red-700' },
          { label: 'Late', value: late, color: 'bg-yellow-50 text-yellow-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-gray-200 p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.code} value={c.code}>{c.code} — {c.title}</option>)}
        </select>
        <input
          type="date" value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(courseFilter || dateFilter) && (
          <button
            onClick={() => { setCourseFilter(''); setDateFilter(''); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-3"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm">No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {['Student', 'Course', 'Date', 'Status', 'Note'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r._id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">{r.student.name}</p>
                      {r.student.studentId && <p className="text-xs text-gray-400">{r.student.studentId}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-blue-600 font-medium">{r.course.code}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(r.date).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">{r.note ?? '—'}</td>
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