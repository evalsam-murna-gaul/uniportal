'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

interface RegisterFormProps {
  role: 'student' | 'faculty' | 'admin';
  registerToken?: string; // passed from server component via env
}

const roleConfig = {
  student: {
    label: 'Student',
    icon: '🎓',
    color: 'blue',
    idLabel: 'Student ID',
    idPlaceholder: 'STU/2024/001',
    idField: 'studentId' as const,
    description: 'Create your student account to register for courses and track your grades.',
  },
  faculty: {
    label: 'Faculty',
    icon: '👨‍🏫',
    color: 'purple',
    idLabel: 'Employee ID',
    idPlaceholder: 'EMP/2024/001',
    idField: 'employeeId' as const,
    description: 'Create your faculty account to manage courses, grades, and attendance.',
  },
  admin: {
    label: 'Administrator',
    icon: '🛡️',
    color: 'red',
    idLabel: 'Employee ID',
    idPlaceholder: 'ADM/2024/001',
    idField: 'employeeId' as const,
    description: 'Create an administrator account to manage the entire portal.',
  },
};

const accentClasses = {
  blue:   { badge: 'bg-blue-100 text-blue-700',   ring: 'focus:ring-blue-500',   btn: 'bg-blue-600 hover:bg-blue-700'   },
  purple: { badge: 'bg-purple-100 text-purple-700', ring: 'focus:ring-purple-500', btn: 'bg-purple-600 hover:bg-purple-700' },
  red:    { badge: 'bg-red-100 text-red-700',      ring: 'focus:ring-red-500',    btn: 'bg-red-700 hover:bg-red-800'     },
};

export default function RegisterForm({ role, registerToken }: RegisterFormProps) {
  const router = useRouter();
  const config = roleConfig[role];
  const accent = accentClasses[config.color as keyof typeof accentClasses];

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', phone: '',
    [config.idField]: '',
  });
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (registerToken) headers['x-register-token'] = registerToken;

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        department: form.department,
        phone: form.phone,
        [config.idField]: form[config.idField as keyof typeof form],
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      toast.error(data.error || 'Registration failed');
      return;
    }

    toast.success('Account created! Please sign in.');
    router.push('/login?registered=true');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${accent.badge}`}>
            <span>{config.icon}</span>
            {config.label} Registration
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">{config.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text" required value={form.name}
              onChange={e => set('name', e.target.value)}
              className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${accent.ring}`}
              placeholder="Jane Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email" required value={form.email}
              onChange={e => set('email', e.target.value)}
              className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${accent.ring}`}
              placeholder="jane@university.edu"
            />
          </div>

          {/* Password row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password" required value={form.password}
                onChange={e => set('password', e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${accent.ring}`}
                placeholder="Min 8 chars"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm *</label>
              <input
                type="password" required value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${accent.ring}`}
                placeholder="Repeat password"
              />
            </div>
          </div>

          {/* Department + Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text" value={form.department}
                onChange={e => set('department', e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${accent.ring}`}
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel" value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${accent.ring}`}
                placeholder="+234 800 000 0000"
              />
            </div>
          </div>

          {/* Role-specific ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{config.idLabel}</label>
            <input
              type="text" value={form[config.idField as keyof typeof form]}
              onChange={e => set(config.idField, e.target.value)}
              className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${accent.ring}`}
              placeholder={config.idPlaceholder}
            />
          </div>

          {/* Password hint */}
          <p className="text-xs text-gray-400">
            Password must be at least 8 characters with one uppercase letter and one number.
          </p>

          <button
            type="submit" disabled={loading}
            className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-colors mt-2 ${accent.btn}`}
          >
            {loading ? 'Creating account…' : `Create ${config.label} Account`}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}