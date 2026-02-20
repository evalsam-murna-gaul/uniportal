'use client';

import { useState } from 'react';
import { ATTENDANCE_STATUS } from '@/constants/roles';

interface Student {
  _id: string;
  name: string;
  studentId?: string;
}

type Status = 'present' | 'absent' | 'late';

interface AttendanceRow {
  studentId: string;
  status: Status;
  note: string;
}

const statusConfig: Record<Status, { label: string; color: string; active: string }> = {
  present: { label: 'Present', color: 'border-gray-300 text-gray-600 hover:border-green-400', active: 'border-green-500 bg-green-50 text-green-700 font-semibold' },
  late:    { label: 'Late',    color: 'border-gray-300 text-gray-600 hover:border-yellow-400', active: 'border-yellow-500 bg-yellow-50 text-yellow-700 font-semibold' },
  absent:  { label: 'Absent',  color: 'border-gray-300 text-gray-600 hover:border-red-400',   active: 'border-red-500 bg-red-50 text-red-700 font-semibold' },
};

export default function AttendanceSheet({ courseId, students }: { courseId: string; students: Student[] }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<AttendanceRow[]>(
    students.map(s => ({ studentId: s._id, status: 'present', note: '' }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function updateStatus(studentId: string, status: Status) {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, status } : r));
  }

  function updateNote(studentId: string, note: string) {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, note } : r));
  }

  function markAll(status: Status) {
    setRows(prev => prev.map(r => ({ ...r, status })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course: courseId,
        date: new Date(date).toISOString(),
        records: rows.map(r => ({
          student: r.studentId,
          status: r.status,
          note: r.note || undefined,
        })),
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!data.success) { setError(data.error || 'Failed to save attendance'); return; }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  // Summary counts
  const summary = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        <p className="text-3xl mb-2">✅</p>
        <p className="text-sm">No students enrolled to mark attendance.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-5 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Mark Attendance</h2>
        <p className="text-xs text-gray-400 mt-0.5">Record attendance for each student</p>
      </div>

      {submitted && (
        <div className="mx-5 mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          ✅ Attendance saved successfully for {date}
        </div>
      )}
      {error && (
        <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Date & Bulk Actions */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-100 bg-gray-50">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date" value={date} max={today}
              onChange={e => setDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:ml-auto">
            <p className="text-xs font-medium text-gray-600 mb-1">Mark all as:</p>
            <div className="flex gap-2">
              {(Object.keys(statusConfig) as Status[]).map(s => (
                <button
                  key={s} type="button" onClick={() => markAll(s)}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${statusConfig[s].color}`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div className="px-5 py-3 flex gap-4 text-xs border-b border-gray-100">
          <span className="text-green-600 font-medium">✅ Present: {summary.present ?? 0}</span>
          <span className="text-yellow-600 font-medium">🕐 Late: {summary.late ?? 0}</span>
          <span className="text-red-600 font-medium">❌ Absent: {summary.absent ?? 0}</span>
        </div>

        {/* Student rows */}
        <div className="max-h-[480px] overflow-y-auto">
          {students.map((s, i) => {
            const row = rows.find(r => r.studentId === s._id)!;
            return (
              <div key={s._id} className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                {/* Student info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                    {s.studentId && <p className="text-xs text-gray-400">{s.studentId}</p>}
                  </div>
                </div>

                {/* Status buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  {(Object.keys(statusConfig) as Status[]).map(s2 => (
                    <button
                      key={s2} type="button"
                      onClick={() => updateStatus(s._id, s2)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        row.status === s2 ? statusConfig[s2].active : statusConfig[s2].color
                      }`}
                    >
                      {statusConfig[s2].label}
                    </button>
                  ))}
                </div>

                {/* Note input for absent/late */}
                {(row.status === 'absent' || row.status === 'late') && (
                  <input
                    type="text" value={row.note} placeholder="Note (optional)"
                    onChange={e => updateNote(s._id, e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-44"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="p-5 flex items-center justify-between border-t border-gray-100">
          <p className="text-xs text-gray-400">{students.length} students • {date}</p>
          <button
            type="submit" disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Saving…' : 'Save Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
}