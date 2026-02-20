'use client';

import { useState } from 'react';

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

export default function CourseCard({ course, onUpdate }: { course: Course; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const isFull = course.enrolledCount >= course.maxCapacity;

  async function handleEnroll() {
    setLoading(true);
    const method = course.isEnrolled ? 'DELETE' : 'POST';
    await fetch(`/api/courses/${course._id}/enroll`, { method });
    setLoading(false);
    onUpdate();
  }

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    dropped: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold font-mono">
            {course.code}
          </span>
          {course.enrollmentStatus && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[course.enrollmentStatus] ?? ''}`}>
              {course.enrollmentStatus}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{course.credits} cr</span>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{course.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{course.faculty?.name} • {course.department}</p>
      </div>

      {course.description && (
        <p className="text-xs text-gray-400 line-clamp-2">{course.description}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          <span className={isFull ? 'text-red-500 font-medium' : ''}>
            {course.enrolledCount}/{course.maxCapacity}
          </span>
          {' '}enrolled
        </div>
        <button
          onClick={handleEnroll}
          disabled={loading || (isFull && !course.isEnrolled)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
            course.isEnrolled
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : isFull
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? '…' : course.isEnrolled ? 'Drop Course' : isFull ? 'Full' : 'Enroll'}
        </button>
      </div>
    </div>
  );
}