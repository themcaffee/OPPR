import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card } from '@/components/ui/Card';
import { AuthLinks } from '@/components/auth/AuthLinks';

export const metadata: Metadata = {
  title: 'Create Account - OPPRS',
  description: 'Create your OPPRS account',
};

export default function RegisterPage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Create Account</h1>
      <RegisterForm />
      <AuthLinks mode="register" />
    </Card>
  );
}
