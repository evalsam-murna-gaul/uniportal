'use client';

import { useEffect, useState } from 'react';

interface GradeEntry {
  _id: string;
  student: { name: string; email: string; studentId?: string };
  course: { code: string; title: string };
  assignment: string;
  score: number;
  maxScore: number;
  type: string;
  gradedAt: string;
  comment?: string;
}

export default function FacultyGradesPage() {
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<number>(0);

  useEffect(() => {
    fetchGrades();
  }, [courseFilter]);

  async function fetchGrades() {
    setLoading(true);
    const params = new URLSearchParams();
    if (courseFilter) params.set('course', courseFilter);
    const res = await fetch(`/api/grades?${params}`);
    const data = await res.json();
    setGrades(data.data?.grades ?? []);
    setLoading(false);
  }

  async function handleEditSave(id: string, maxScore: number) {
    if (editScore < 0 || editScore > maxScore) return;
    await fetch(`/api/grades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: editScore }),
    });
    setEditingId(null);
    fetchGrades();
  }

  const courses = [...new Map(grades.map(g => [g.course.code, g.course])).values()];
  const filtered = typeFilter ? grades.filter(g => g.type === typeFilter) : grades;
  const types = [...new Set(grades.map(g => g.type))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
        <p className="text-gray-500 text-sm mt-1">View and edit submitted grades across all your courses</p>
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
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm">No grades found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {['Student', 'Course', 'Assignment', 'Type', 'Score', '%', 'Grade', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => {
                  const pct = Math.round((g.score / g.maxScore) * 100);
                  const letter = pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 45 ? 'D' : 'F';
                  const letterColor = pct >= 70 ? 'text-green-600' : pct >= 60 ? 'text-blue-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';
                  return (
                    <tr key={g._id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800">{g.student.name}</p>
                        <p className="text-xs text-gray-400">{g.student.studentId ?? g.student.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-blue-600 font-medium">{g.course.code}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 max-w-[160px] truncate">{g.assignment}</td>
                      <td className="py-3 px-4 capitalize text-xs text-gray-500">{g.type}</td>
                      <td className="py-3 px-4">
                        {editingId === g._id ? (
                          <input
                            type="number" min={0} max={g.maxScore}
                            value={editScore}
                            onChange={e => setEditScore(Number(e.target.value))}
                            className="w-16 border border-blue-400 rounded px-2 py-1 text-xs"
                            autoFocus
                          />
                        ) : (
                          <span className="text-gray-700">{g.score}/{g.maxScore}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{pct}%</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${letterColor}`}>{letter}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(g.gradedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === g._id ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleEditSave(g._id, g.maxScore)} className="text-xs text-green-600 font-medium hover:underline">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingId(g._id); setEditScore(g.score); }}
                            className="text-xs text-blue-600 font-medium hover:underline"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}