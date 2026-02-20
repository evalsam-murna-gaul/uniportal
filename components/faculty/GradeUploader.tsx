'use client';

import { useState } from 'react';
import { GRADE_TYPE } from '@/constants/roles';

interface Student {
  _id: string;
  name: string;
  studentId?: string;
}

interface GradeRow {
  studentId: string;
  score: string;
}

export default function GradeUploader({ courseId, students }: { courseId: string; students: Student[] }) {
  const [assignment, setAssignment] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [type, setType] = useState(GRADE_TYPE.ASSIGNMENT);
  const [rows, setRows] = useState<GradeRow[]>(students.map(s => ({ studentId: s._id, score: '' })));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState('');

  function updateScore(studentId: string, score: string) {
    setRows(prev => prev.map(r => r.studentId === studentId ? { ...r, score } : r));
  }

  function fillAll(score: string) {
    setRows(prev => prev.map(r => ({ ...r, score })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignment.trim()) { setError('Assignment name is required'); return; }
    if (!maxScore || Number(maxScore) < 1) { setError('Max score must be at least 1'); return; }

    const filledRows = rows.filter(r => r.score !== '');
    if (filledRows.length === 0) { setError('Please enter at least one score'); return; }

    setError('');
    setSubmitting(true);

    // Submit grades one by one (could be batched in a real API)
    let success = 0;
    let failed = 0;

    await Promise.all(
      filledRows.map(async row => {
        const score = Number(row.score);
        if (isNaN(score) || score < 0 || score > Number(maxScore)) { failed++; return; }

        const res = await fetch('/api/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student: row.studentId,
            course: courseId,
            assignment,
            score,
            maxScore: Number(maxScore),
            type,
          }),
        });

        if (res.ok) success++; else failed++;
      })
    );

    setSubmitting(false);
    setResult({ success, failed });
    // Reset scores after submit
    setRows(students.map(s => ({ studentId: s._id, score: '' })));
    setAssignment('');
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        <p className="text-3xl mb-2">📝</p>
        <p className="text-sm">No students enrolled to grade.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-5 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Upload Grades</h2>
        <p className="text-xs text-gray-400 mt-0.5">Enter scores for each student for a specific assignment</p>
      </div>

      {result && (
        <div className={`mx-5 mt-4 rounded-lg px-4 py-3 text-sm ${result.failed === 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
          {result.success} grade{result.success !== 1 ? 's' : ''} submitted successfully
          {result.failed > 0 && ` • ${result.failed} failed`}
        </div>
      )}

      {error && (
        <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Assignment meta */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Assignment Name</label>
            <input
              type="text" required value={assignment}
              onChange={e => setAssignment(e.target.value)}
              placeholder="e.g. Midterm Exam"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Score</label>
            <input
              type="number" min="1" required value={maxScore}
              onChange={e => setMaxScore(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(GRADE_TYPE).map(t => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk fill shortcut */}
        <div className="px-5 py-3 flex items-center gap-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs text-gray-500">Quick fill all:</span>
          {['100', '80', '60', '0'].map(v => (
            <button key={v} type="button" onClick={() => fillAll(v)}
              className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-white transition-colors text-gray-600">
              {v}
            </button>
          ))}
        </div>

        {/* Student score rows */}
        <div className="max-h-96 overflow-y-auto">
          {students.map((s, i) => {
            const row = rows.find(r => r.studentId === s._id);
            const score = row?.score ?? '';
            const scoreNum = Number(score);
            const isValid = score === '' || (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= Number(maxScore));
            return (
              <div key={s._id} className={`flex items-center gap-4 px-5 py-3 border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                  {s.studentId && <p className="text-xs text-gray-400">{s.studentId}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="number" min="0" max={maxScore}
                    value={score}
                    onChange={e => updateScore(s._id, e.target.value)}
                    placeholder="—"
                    className={`w-20 text-center rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isValid ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  />
                  <span className="text-xs text-gray-400 w-14">/ {maxScore}</span>
                  {score !== '' && (
                    <span className={`text-xs font-medium w-8 ${
                      scoreNum / Number(maxScore) >= 0.7 ? 'text-green-600' :
                      scoreNum / Number(maxScore) >= 0.5 ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                      {Math.round((scoreNum / Number(maxScore)) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 flex items-center justify-between border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {rows.filter(r => r.score !== '').length} of {students.length} scores entered
          </p>
          <button
            type="submit" disabled={submitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit Grades'}
          </button>
        </div>
      </form>
    </div>
  );
}