'use client';

import { useEffect, useState, useCallback } from 'react';
import UserTable from '@/components/admin/UserTable';
import UserFormModal from '@/components/admin/UserForm';

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('isActive', statusFilter);
    params.set('page', String(page));
    params.set('limit', '20');
    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setUsers(data.data?.users ?? []);
    setTotal(data.data?.total ?? 0);
    setLoading(false);
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total users</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <UserTable
        users={users}
        loading={loading}
        onRefresh={fetchUsers}
        total={total}
        page={page}
        onPageChange={setPage}
      />

      {showModal && (
        <UserFormModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}