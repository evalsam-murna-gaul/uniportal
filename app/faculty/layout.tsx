import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'faculty') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role="faculty" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}