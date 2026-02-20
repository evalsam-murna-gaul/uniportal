'use client';

import { useEffect, useState } from 'react';
import GradeTable from '@/components/student/GradeTable';
import GPASummary from '@/components/student/GPASummary';

interface GradeEntry {
  _id: string;
  course: { _id: string; title: string; code: string; credits: number };
  assignment: string;
  score: number;
  maxScore: number;
  type: string;
  comment?: string;
  gradedAt: string;
}

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [gpa, setGpa] = useState(0);

  useEffect(() => {
    async function fetchGrades() {
      const res = await fetch('/api/grades');
      const data = await res.json();
      setGrades(data.data?.grades ?? []);
      setGpa(data.data?.gpa ?? 0);
      setLoading(false);
    }
    fetchGrades();
  }, []);

  const courses = [...new Map(grades.map(g => [g.course._id, g.course])).values()];
  const filtered = selectedCourse ? grades.filter(g => g.course._id === selectedCourse) : grades;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
        <p className="text-gray-500 text-sm mt-1">View your academic performance and transcript</p>
      </div>

      <GPASummary gpa={gpa} courseGrades={[]} />

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-gray-800">Grade Record</h2>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <GradeTable grades={filtered} />
        )}
      </div>
    </div>
  );
}