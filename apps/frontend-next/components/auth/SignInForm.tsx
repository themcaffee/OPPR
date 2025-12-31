'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInFormData } from '@/lib/validations/auth';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    // TODO: Implement actual authentication when backend is ready
    console.log('Sign in submitted:', data);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert('Sign in successful! (Backend not yet implemented)');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email"
        id="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <FormField
        label="Password"
        id="password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Sign In
      </Button>
    </form>
  );
}
