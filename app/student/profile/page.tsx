'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Profile {
  name: string;
  email: string;
  department: string;
  studentId: string;
  phone: string;
  avatar: string;
}

export default function StudentProfilePage() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState<Profile>({ name: '', email: '', department: '', studentId: '', phone: '', avatar: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;
    async function fetchProfile() {
      const res = await fetch(`/api/users/${session!.user.id}`);
      const data = await res.json();
      if (data.data) {
        setForm({
          name: data.data.name ?? '',
          email: data.data.email ?? '',
          department: data.data.department ?? '',
          studentId: data.data.studentId ?? '',
          phone: data.data.phone ?? '',
          avatar: data.data.avatar ?? '',
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [status, session?.user?.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/users/${session?.user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, department: form.department, phone: form.phone }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(data.error || 'Failed to update profile');
    }
  }

  if (status === 'loading' || loading) {
    return <div className="animate-pulse h-64 bg-white rounded-xl border border-gray-200" />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {form.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{form.name}</p>
            <p className="text-sm text-gray-500">{form.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium capitalize">
              Student
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" value={form.email} disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input
                type="text" value={form.studentId} disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text" value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit" disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

