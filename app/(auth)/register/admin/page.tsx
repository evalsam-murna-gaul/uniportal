import { notFound } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: 'Admin Registration — UniPortal' };

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function AdminRegisterPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const expected = process.env.ADMIN_REGISTER_TOKEN;

  // Wrong/missing token → 404. The page effectively doesn't exist to outsiders.
  if (!expected || token !== expected) {
    notFound();
  }

  return <RegisterForm role="admin" registerToken={expected} />;
}