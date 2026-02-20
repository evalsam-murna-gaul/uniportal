'use client';

import { useEffect, useState } from 'react';

interface Faculty {
  _id: string;
  name: string;
  department?: string;
}

interface Course {
  _id: string;
  code: string;
  title: string;
  description: string;
  faculty: { _id: string; name: string };
  department: string;
  credits: number;
  maxCapacity: number;
  semester: string;
}

interface Props {
  course?: Course | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CourseFormModal({ course, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    code: course?.code ?? '',
    title: course?.title ?? '',
    description: course?.description ?? '',
    faculty: course?.faculty?._id ?? '',
    department: course?.department ?? '',
    credits: String(course?.credits ?? 3),
    maxCapacity: String(course?.maxCapacity ?? 50),
    semester: course?.semester ?? '',
  });
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!course;

  useEffect(() => {
    async function loadFaculty() {
      const res = await fetch('/api/users?role=faculty&limit=100');
      const data = await res.json();
      setFacultyList(data.data?.users ?? []);
    }
    loadFaculty();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...form,
      credits: Number(form.credits),
      maxCapacity: Number(form.maxCapacity),
    };

    const url = isEdit ? `/api/courses/${course!._id}` : '/api/courses';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) { setError(data.error || 'Failed to save course'); return; }
    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Edit Course' : 'Create New Course'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Course Code *</label>
              <input type="text" required value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="CS301"
                disabled={isEdit}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Credits *</label>
              <input type="number" required min="1" max="6" value={form.credits}
                onChange={e => setForm(f => ({ ...f, credits: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Course Title *</label>
              <input type="text" required value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduction to Algorithms"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Course description (optional)"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Assign Faculty *</label>
              <select required value={form.faculty}
                onChange={e => setForm(f => ({ ...f, faculty: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select faculty member…</option>
                {facultyList.map(f => (
                  <option key={f._id} value={f._id}>{f.name}{f.department ? ` (${f.department})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department *</label>
              <input type="text" required value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Capacity *</label>
              <input type="number" required min="1" value={form.maxCapacity}
                onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Semester *</label>
              <input type="text" required value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2024/2025 - First Semester"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}