'use client';

import { useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  studentId?: string;
  employeeId?: string;
  isActive: boolean;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  faculty: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};

const LIMIT = 20;

export default function UserTable({
  users, loading, onRefresh, total, page, onPageChange,
}: {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
  total: number;
  page: number;
  onPageChange: (p: number) => void;
}) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const totalPages = Math.ceil(total / LIMIT);

  async function toggleActive(user: User) {
    setProcessingId(user._id);
    const method = user.isActive ? 'DELETE' : 'PUT';
    const body = user.isActive ? undefined : JSON.stringify({ isActive: true });
    await fetch(`/api/users/${user._id}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body,
    });
    setProcessingId(null);
    onRefresh();
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-2">
        {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
        <p className="text-4xl mb-3">👥</p>
        <p className="text-sm">No users found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name', 'Email', 'Role', 'ID', 'Department', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u._id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{u.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-gray-400">
                  {u.studentId ?? u.employeeId ?? '—'}
                </td>
                <td className="py-3 px-4 text-xs text-gray-500">{u.department ?? '—'}</td>
                <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleActive(u)}
                    disabled={processingId === u._id}
                    className={`text-xs font-medium hover:underline disabled:opacity-50 ${u.isActive ? 'text-red-500' : 'text-green-600'}`}
                  >
                    {processingId === u._id ? '…' : u.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400">Showing {users.length} of {total}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="px-3 py-1.5 text-xs text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}