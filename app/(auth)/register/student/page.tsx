import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: 'Student Registration — UniPortal' };

export default function StudentRegisterPage() {
  return <RegisterForm role="student" />;
}