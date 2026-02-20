'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StudentList from '@/components/faculty/StudentList';
import GradeUploader from '@/components/faculty/GradeUploader';
import AttendanceSheet from '@/components/faculty/AttendanceSheet';

interface Course {
  _id: string;
  code: string;
  title: string;
  description: string;
  department: string;
  credits: number;
  maxCapacity: number;
  semester: string;
}

type Tab = 'students' | 'grades' | 'attendance';

export default function FacultyCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('students');

  useEffect(() => {
    async function fetchData() {
      const [courseRes, studentsRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/courses/${id}/students`),
      ]);
      const courseData = await courseRes.json();
      const studentsData = await studentsRes.json();
      setCourse(courseData.data);
      setStudents(studentsData.data?.students ?? []);
      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'students', label: 'Students', icon: '👥' },
    { key: 'grades', label: 'Grade Upload', icon: '📝' },
    { key: 'attendance', label: 'Attendance', icon: '✅' },
  ];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-xl w-1/3" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!course) return <p className="text-gray-500">Course not found.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold font-mono">
                {course.code}
              </span>
              <span className="text-xs text-gray-400">{course.credits} credits</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{course.department} • {course.semester}</p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              <p className="text-xs text-gray-400">Students</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{course.maxCapacity}</p>
              <p className="text-xs text-gray-400">Capacity</p>
            </div>
          </div>
        </div>
        {course.description && (
          <p className="mt-3 text-sm text-gray-500 border-t border-gray-100 pt-3">{course.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'students' && <StudentList students={students} courseId={id} />}
        {activeTab === 'grades' && <GradeUploader courseId={id} students={students} />}
        {activeTab === 'attendance' && <AttendanceSheet courseId={id} students={students} />}
      </div>
    </div>
  );
}