'use client';

import { useEffect, useState } from 'react';
import CourseCard from '@/components/student/CourseCard';

interface Course {
  _id: string;
  code: string;
  title: string;
  description: string;
  faculty: { name: string };
  department: string;
  credits: number;
  maxCapacity: number;
  semester: string;
  enrolledCount: number;
  isEnrolled: boolean;
  enrollmentStatus?: string;
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');

  async function fetchCourses() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (dept) params.set('department', dept);
    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();
    setCourses(data.data?.courses ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchCourses(); }, [search, dept]);

  const departments = [...new Set(courses.map(c => c.department))].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Registration</h1>
        <p className="text-gray-500 text-sm mt-1">Browse and register for available courses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search courses or codes…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={dept}
          onChange={e => setDept(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-48" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No courses found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard key={course._id} course={course} onUpdate={fetchCourses} />
          ))}
        </div>
      )}
    </div>
  );
}