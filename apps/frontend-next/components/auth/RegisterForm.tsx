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
        firstName: data.firstName,
        middleInitial: data.middleInitial || undefined,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
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

      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
        <div className="sm:col-span-2">
          <FormField
            label="First Name"
            id="firstName"
            type="text"
            placeholder="First"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
        </div>

        <div className="sm:col-span-1">
          <FormField
            label="M.I."
            id="middleInitial"
            type="text"
            placeholder="M"
            maxLength={2}
            autoComplete="additional-name"
            error={errors.middleInitial?.message}
            {...register('middleInitial')}
          />
        </div>

        <div className="sm:col-span-3">
          <FormField
            label="Last Name"
            id="lastName"
            type="text"
            placeholder="Last"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>
      </div>

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

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Create Account
      </Button>
    </form>
  );
}
