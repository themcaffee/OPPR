'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { PlayerSelector } from '@/components/admin/PlayerSelector';
import type { UserWithPlayer, Player } from '@opprs/rest-api-client';

interface UserEditFormData {
  role: 'USER' | 'ADMIN';
  playerId: string | null;
  password: string;
}

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<UserWithPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<UserEditFormData>({
    defaultValues: {
      role: 'USER',
      playerId: null,
      password: '',
    },
  });

  const playerId = watch('playerId');

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await apiClient.users.get(id);
      setUser(userData);
      reset({
        role: userData.role,
        playerId: userData.player?.id ?? null,
        password: '',
      });
    } catch (err) {
      setError('Failed to load user');
      console.error('Failed to load user:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const onSubmit = async (data: UserEditFormData) => {
    setError(null);
    try {
      await apiClient.users.update(id, {
        role: data.role,
        playerId: data.playerId,
        ...(data.password ? { password: data.password } : {}),
      });
      router.push('/admin/users');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save user';
      setError(message);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.users.delete(id);
      router.push('/admin/users');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlayerChange = (selectedPlayerId: string, _player: Player | null) => {
    setValue('playerId', selectedPlayerId || null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error && !user) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">User Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                {user?.email}
              </div>
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                {...register('role')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked Player</label>
              <PlayerSelector value={playerId} onChange={handlePlayerChange} />
              <p className="mt-1 text-xs text-gray-500">
                Link this user to a player profile for tournament participation
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Reset Password</h2>

          <FormField
            label="New Password"
            id="password"
            type="password"
            {...register('password', {
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
            hint="Leave blank to keep current password. Minimum 8 characters."
          />
        </Card>

        <div className="flex justify-between pt-4">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete User
            </Button>
          </div>
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${user?.email}? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
