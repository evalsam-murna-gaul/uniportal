'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ROLES, Role } from '@/constants/roles';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<{
    name: string; email: string; password: string; role: Role;
    department: string; studentId: string; employeeId: string; phone: string;
  }>({
    name: '', email: '', password: '', role: ROLES.STUDENT,
    department: '', studentId: '', employeeId: '', phone: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_API_SECRET ?? '',
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      toast.error(data.error || 'Failed to create user');
      return;
    }
    toast.success(`Account created for ${form.name}`);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Create New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <div className="flex gap-2">
              {Object.values(ROLES).map(r => (
                <button
                  key={r} type="button"
                  onClick={() => setForm(f => ({ ...f, role: r as Role }))}
                  className={`flex-1 py-2 rounded-lg border text-xs font-medium capitalize transition-colors ${
                    form.role === r ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jane Doe"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jane@university.edu"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Temporary Password *</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <input type="text" value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+234…"
              />
            </div>

            {form.role === ROLES.STUDENT && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Student ID</label>
                <input type="text" value={form.studentId}
                  onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="STU/2024/001"
                />
              </div>
            )}

            {form.role !== ROLES.STUDENT && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Employee ID</label>
                <input type="text" value={form.employeeId}
                  onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="EMP/2024/001"
                />
              </div>
            )}
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
              {loading ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}