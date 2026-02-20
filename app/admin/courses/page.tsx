'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import CourseFormModal from '@/components/admin/CourseForm';
import EnrollmentApprovals from '@/components/admin/EnrollmentApprovals';

interface Course {
  _id: string;
  code: string;
  title: string;
  description: string;
  department: string;
  faculty: { _id: string; name: string };
  credits: number;
  maxCapacity: number;
  semester: string;
  isActive: boolean;
  enrolledCount?: number;
}

type TabType = 'courses' | 'enrollments';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabType>('courses');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('limit', '50');
    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();
    setCourses(data.data?.courses ?? []);
    setTotal(data.data?.total ?? 0);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  async function handleDeactivate(id: string) {
    if (!confirm('Deactivate this course?')) return;
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      toast.success('Course deactivated successfully');
    } else {
      toast.error(data.error || 'Failed to deactivate course');
    }
    fetchCourses();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500 text-sm mt-1">{total} courses registered</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> New Course
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['courses', 'enrollments'] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'courses' ? '📚 Courses' : '⏳ Enrollment Approvals'}
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <>
          <input
            type="text" placeholder="Search courses…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-80 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-2">
                {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : courses.length === 0 ? (
              <div className="p-16 text-center text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm">No courses found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Code', 'Title', 'Faculty', 'Department', 'Credits', 'Capacity', 'Semester', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c, i) => (
                      <tr key={c._id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs text-blue-600 font-bold">{c.code}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800 max-w-[180px] truncate">{c.title}</td>
                        <td className="py-3 px-4 text-gray-600 text-xs">{c.faculty?.name ?? '—'}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{c.department}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{c.credits}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{c.enrolledCount ?? 0}/{c.maxCapacity}</td>
                        <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{c.semester}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => { setEditing(c); setShowModal(true); }}
                              className="text-xs text-blue-600 hover:underline font-medium"
                            >Edit</button>
                            {c.isActive && (
                              <button
                                onClick={() => handleDeactivate(c._id)}
                                className="text-xs text-red-500 hover:underline font-medium"
                              >Deactivate</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'enrollments' && <EnrollmentApprovals />}

      {showModal && (
        <CourseFormModal
          course={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchCourses(); }}
        />
      )}
    </div>
  );
}