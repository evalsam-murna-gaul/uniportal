'use client';

import { useState } from 'react';

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
  department?: string;
  enrollmentStatus: string;
}

export default function StudentList({ students, courseId }: { students: Student[]; courseId: string }) {
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.studentId ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-800">Enrolled Students</h2>
          <p className="text-xs text-gray-400 mt-0.5">{students.length} student{students.length !== 1 ? 's' : ''}</p>
        </div>
        <input
          type="text"
          placeholder="Search students…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-56"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm">{students.length === 0 ? 'No students enrolled yet.' : 'No students match your search.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['#', 'Name', 'Student ID', 'Email', 'Department', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s._id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                  <td className="py-3 px-4 text-gray-400 text-xs">{i + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{s.studentId ?? '—'}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{s.email}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{s.department ?? '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      s.enrollmentStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {s.enrollmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}