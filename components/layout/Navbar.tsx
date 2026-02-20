'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

interface NavbarProps {
  user: { name?: string | null; email?: string | null; role?: string };
}

export default function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-blue-700">UniPortal</span>
        <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium capitalize">
          {user.role}
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name}</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}