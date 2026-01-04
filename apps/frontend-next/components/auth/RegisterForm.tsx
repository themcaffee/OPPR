'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  OpprsConflictError,
  OpprsValidationError,
  OpprsNetworkError,
} from '@opprs/rest-api-client';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { apiClient } from '@/lib/api-client';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);

    try {
      await apiClient.register({
        name: data.name,
        email: data.email,
        password: data.password,
        acceptPolicies: data.acceptPolicies,
      });
      router.push('/profile');
    } catch (err) {
      if (err instanceof OpprsConflictError) {
        setError('An account with this email already exists.');
      } else if (err instanceof OpprsValidationError) {
        setError(err.message || 'Please check your information and try again.');
      } else if (err instanceof OpprsNetworkError) {
        setError('Unable to connect. Please check your connection and try again.');
      } else {
        setError('Registration failed. Please try again.');
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
        label="Name"
        id="name"
        type="text"
        placeholder="Your name"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />

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
        placeholder="Create a password"
        autoComplete="new-password"
        error={errors.password?.message}
        hint="At least 8 characters with uppercase, lowercase, and number"
        {...register('password')}
      />

      <FormField
        label="Confirm Password"
        id="confirmPassword"
        type="password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="space-y-1">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="acceptPolicies"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register('acceptPolicies')}
          />
          <label htmlFor="acceptPolicies" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Terms of Service
            </a>
            ,{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Privacy Policy
            </a>
            , and{' '}
            <a
              href="/code-of-conduct"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Code of Conduct
            </a>
          </label>
        </div>
        {errors.acceptPolicies?.message && (
          <p className="text-sm text-red-600">{errors.acceptPolicies.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Create Account
      </Button>
    </form>
  );
}
