import type { Metadata } from 'next';
import { SignInForm } from '@/components/auth/SignInForm';
import { Card } from '@/components/ui/Card';
import { AuthLinks } from '@/components/auth/AuthLinks';

export const metadata: Metadata = {
  title: 'Sign In - OPPRS',
  description: 'Sign in to your OPPRS account',
};

export default function SignInPage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign In</h1>
      <SignInForm />
      <AuthLinks mode="sign-in" />
    </Card>
  );
}
