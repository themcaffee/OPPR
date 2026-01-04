'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { UpdatePlayerRequest } from '@opprs/rest-api-client';

export default function AdminPlayerEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePlayerRequest>({
    defaultValues: isNew
      ? {
          name: '',
          rating: 1500,
          ratingDeviation: 200,
          ranking: undefined,
        }
      : {},
  });

  useEffect(() => {
    if (!isNew) {
      apiClient.players.get(id).then((p) => {
        reset({
          name: p.name ?? '',
          rating: p.rating,
          ratingDeviation: p.ratingDeviation,
          ranking: p.ranking ?? undefined,
        });
        setIsLoading(false);
      });
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data: UpdatePlayerRequest) => {
    if (isNew) {
      await apiClient.players.create(data);
    } else {
      await apiClient.players.update(id, data);
    }
    router.push('/admin/players');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.players.delete(id);
      router.push('/admin/players');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'Add Player' : 'Edit Player'}</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" id="name" {...register('name')} error={errors.name?.message} />
          <FormField
            label="Rating"
            id="rating"
            type="number"
            step="0.01"
            {...register('rating', { valueAsNumber: true })}
          />
          <FormField
            label="Rating Deviation"
            id="ratingDeviation"
            type="number"
            step="0.01"
            {...register('ratingDeviation', { valueAsNumber: true })}
          />
          <FormField
            label="Ranking"
            id="ranking"
            type="number"
            {...register('ranking', { valueAsNumber: true })}
          />

          <div className="flex justify-between pt-4">
            <div>
              {!isNew && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isNew ? 'Create' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Player"
        message="Are you sure you want to delete this player? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
