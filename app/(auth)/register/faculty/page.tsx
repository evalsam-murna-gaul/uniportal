import { notFound } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: 'Faculty Registration — UniPortal' };

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function FacultyRegisterPage({ searchParams }: Props) {
  const { token } = await searchParams;
  const expected = process.env.FACULTY_REGISTER_TOKEN;

  // If token is missing or wrong, show 404 — URL reveals nothing
  if (!expected || token !== expected) {
    notFound();
  }

  // Pass token to form so it can attach it to the API request header
  return <RegisterForm role="faculty" registerToken={expected} />;
}