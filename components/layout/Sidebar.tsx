'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems: Record<string, { label: string; href: string; icon: string }[]> = {
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: '🏠' },
    { label: 'Courses', href: '/student/courses', icon: '📚' },
    { label: 'Grades', href: '/student/grades', icon: '📊' },
    { label: 'Profile', href: '/student/profile', icon: '👤' },
  ],
  faculty: [
    { label: 'Dashboard', href: '/faculty/dashboard', icon: '🏠' },
    { label: 'My Courses', href: '/faculty/courses', icon: '📚' },
    { label: 'Grades', href: '/faculty/grades', icon: '📝' },
    { label: 'Attendance', href: '/faculty/attendance', icon: '✅' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Courses', href: '/admin/courses', icon: '📚' },
    { label: 'Calendar', href: '/admin/calendar', icon: '📅' },
    { label: 'Announcements', href: '/admin/announcements', icon: '📢' },
    { label: 'Reports', href: '/admin/reports', icon: '📈' },
  ],
};

export default function Sidebar({ role }: { role: 'student' | 'faculty' | 'admin' }) {
  const pathname = usePathname();
  const items = navItems[role] ?? [];

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-blue-700">🎓 UniPortal</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 px-3 capitalize">{role} Portal</p>
      </div>
    </aside>
  );
}