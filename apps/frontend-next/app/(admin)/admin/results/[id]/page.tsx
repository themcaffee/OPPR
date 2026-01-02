'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { ResultWithRelations, UpdateResultRequest } from '@opprs/rest-api-client';

interface FormData extends UpdateResultRequest {
  playerId?: string;
  tournamentId?: string;
}

export default function AdminResultEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [result, setResult] = useState<ResultWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    if (!isNew) {
      apiClient.results.get(id).then((r) => {
        setResult(r);
        reset({
          position: r.position,
          optedOut: r.optedOut,
          linearPoints: r.linearPoints ?? undefined,
          dynamicPoints: r.dynamicPoints ?? undefined,
          totalPoints: r.totalPoints ?? undefined,
          decayMultiplier: r.decayMultiplier ?? undefined,
          decayedPoints: r.decayedPoints ?? undefined,
          efficiency: r.efficiency ?? undefined,
        });
        setIsLoading(false);
      });
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data: FormData) => {
    if (isNew) {
      await apiClient.results.create({
        playerId: data.playerId!,
        tournamentId: data.tournamentId!,
        position: data.position!,
        optedOut: data.optedOut,
      });
    } else {
      await apiClient.results.update(id, data);
    }
    router.push('/admin/results');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.results.delete(id);
      router.push('/admin/results');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'Add Result' : 'Edit Result'}</h1>

      {result && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Player:</strong> {result.player.name ?? result.player.email ?? 'Unknown'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Tournament:</strong> {result.tournament.name}
          </p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isNew && (
            <>
              <FormField
                label="Player ID"
                id="playerId"
                {...register('playerId', { required: 'Player ID is required' })}
                error={errors.playerId?.message}
              />
              <FormField
                label="Tournament ID"
                id="tournamentId"
                {...register('tournamentId', { required: 'Tournament ID is required' })}
                error={errors.tournamentId?.message}
              />
            </>
          )}

          <FormField
            label="Position"
            id="position"
            type="number"
            {...register('position', { required: 'Position is required', valueAsNumber: true })}
            error={errors.position?.message}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="optedOut"
              {...register('optedOut')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="optedOut" className="text-sm font-medium text-gray-700">
              Opted Out
            </label>
          </div>

          <FormField
            label="Linear Points"
            id="linearPoints"
            type="number"
            step="0.01"
            {...register('linearPoints', { valueAsNumber: true })}
          />
          <FormField
            label="Dynamic Points"
            id="dynamicPoints"
            type="number"
            step="0.01"
            {...register('dynamicPoints', { valueAsNumber: true })}
          />
          <FormField
            label="Total Points"
            id="totalPoints"
            type="number"
            step="0.01"
            {...register('totalPoints', { valueAsNumber: true })}
          />
          <FormField
            label="Decay Multiplier"
            id="decayMultiplier"
            type="number"
            step="0.01"
            {...register('decayMultiplier', { valueAsNumber: true })}
          />
          <FormField
            label="Decayed Points"
            id="decayedPoints"
            type="number"
            step="0.01"
            {...register('decayedPoints', { valueAsNumber: true })}
          />
          <FormField
            label="Efficiency"
            id="efficiency"
            type="number"
            step="0.01"
            {...register('efficiency', { valueAsNumber: true })}
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
        title="Delete Result"
        message="Are you sure you want to delete this result? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
