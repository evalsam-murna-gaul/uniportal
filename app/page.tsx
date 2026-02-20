import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to their dashboard
  if (session?.user?.role === 'student') redirect('/student/dashboard');
  if (session?.user?.role === 'faculty') redirect('/faculty/dashboard');
  if (session?.user?.role === 'admin') redirect('/admin/dashboard');

  // Otherwise show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-xl font-bold text-blue-700">UniPortal</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span>✨</span> University Academic Management System
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Your Campus,{' '}
            <span className="text-blue-600">All in One Place</span>
          </h1>

          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            Manage courses, grades, attendance, and announcements — seamlessly
            across students, faculty, and administration.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="rounded-xl bg-blue-600 text-white px-8 py-3.5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Sign In to Portal
            </Link>
            <Link
              href="/register"
              className="rounded-xl border-2 border-gray-200 text-gray-700 px-8 py-3.5 text-sm font-semibold hover:border-blue-300 hover:bg-white transition-colors"
            >
              Create an Account
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto mt-20 w-full">
          {[
            {
              icon: '🎓',
              role: 'Students',
              color: 'blue',
              features: ['Register for courses', 'View grades & GPA', 'Track announcements', 'Manage profile'],
            },
            {
              icon: '👨‍🏫',
              role: 'Faculty',
              color: 'purple',
              features: ['Manage assigned courses', 'Upload & edit grades', 'Mark attendance', 'View student lists'],
            },
            {
              icon: '🛡️',
              role: 'Admin',
              color: 'green',
              features: ['Manage all users', 'Create & assign courses', 'Approve enrollments', 'View system reports'],
            },
          ].map(card => (
            <div
              key={card.role}
              className="bg-white rounded-2xl border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4
                ${card.color === 'blue' ? 'bg-blue-50' : card.color === 'purple' ? 'bg-purple-50' : 'bg-green-50'}`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-3">{card.role}</h3>
              <ul className="space-y-2">
                {card.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-green-500 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} UniPortal — University Academic Management System
      </footer>
    </div>
  );
}