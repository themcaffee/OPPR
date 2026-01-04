'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OpprsAuthError, OpprsNetworkError } from '@opprs/rest-api-client';
import { signInSchema, type SignInFormData } from '@/lib/validations/auth';
import { apiClient } from '@/lib/api-client';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const getRedirectUrl = (): string => {
    const redirect = searchParams.get('redirect');
    // Security: Only allow relative paths starting with /
    // Reject protocol-relative URLs (//evil.com) and absolute URLs
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      // Redirect "/" to "/profile" directly since "/" just redirects there anyway
      // This avoids a race condition with middleware cookie detection
      return redirect === '/' ? '/profile' : redirect;
    }
    return '/profile';
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setError(null);

    try {
      await apiClient.login({
        email: data.email,
        password: data.password,
      });
      router.push(getRedirectUrl());
    } catch (err) {
      if (err instanceof OpprsAuthError) {
        setError('Invalid email or password.');
      } else if (err instanceof OpprsNetworkError) {
        setError('Unable to connect. Please check your connection and try again.');
      } else {
        setError('Sign in failed. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

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
