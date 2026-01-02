'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { UpdateTournamentRequest, EventBoosterType } from '@opprs/rest-api-client';

const EVENT_BOOSTERS: EventBoosterType[] = [
  'NONE',
  'CERTIFIED',
  'CERTIFIED_PLUS',
  'CHAMPIONSHIP_SERIES',
  'MAJOR',
];

interface FormData extends Omit<UpdateTournamentRequest, 'date'> {
  date: string;
}

export default function AdminTournamentEditPage() {
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
  } = useForm<FormData>();

  useEffect(() => {
    if (!isNew) {
      apiClient.tournaments.get(id).then((t) => {
        reset({
          name: t.name,
          date: t.date.split('T')[0],
          location: t.location ?? '',
          eventBooster: t.eventBooster,
          baseValue: t.baseValue ?? undefined,
          tgp: t.tgp ?? undefined,
          firstPlaceValue: t.firstPlaceValue ?? undefined,
        });
        setIsLoading(false);
      });
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data: FormData) => {
    const payload: UpdateTournamentRequest = {
      ...data,
      date: new Date(data.date).toISOString(),
    };
    if (isNew) {
      await apiClient.tournaments.create(payload as Required<UpdateTournamentRequest>);
    } else {
      await apiClient.tournaments.update(id, payload);
    }
    router.push('/admin/tournaments');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.tournaments.delete(id);
      router.push('/admin/tournaments');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'Add Tournament' : 'Edit Tournament'}</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Name"
            id="name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <FormField
            label="Date"
            id="date"
            type="date"
            {...register('date', { required: 'Date is required' })}
            error={errors.date?.message}
          />
          <FormField label="Location" id="location" {...register('location')} />

          <div>
            <label htmlFor="eventBooster" className="block text-sm font-medium text-gray-700 mb-1">
              Event Booster
            </label>
            <select
              id="eventBooster"
              {...register('eventBooster')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {EVENT_BOOSTERS.map((booster) => (
                <option key={booster} value={booster}>
                  {booster}
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="Base Value"
            id="baseValue"
            type="number"
            step="0.01"
            {...register('baseValue', { valueAsNumber: true })}
          />
          <FormField
            label="TGP"
            id="tgp"
            type="number"
            step="0.01"
            {...register('tgp', { valueAsNumber: true })}
          />
          <FormField
            label="First Place Value"
            id="firstPlaceValue"
            type="number"
            step="0.01"
            {...register('firstPlaceValue', { valueAsNumber: true })}
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
        title="Delete Tournament"
        message="Are you sure you want to delete this tournament? This will also delete all associated results."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
