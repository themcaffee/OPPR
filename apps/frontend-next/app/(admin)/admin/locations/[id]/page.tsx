'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import type { CreateLocationRequest } from '@opprs/rest-api-client';

export default function AdminLocationEditPage() {
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
  } = useForm<CreateLocationRequest>({
    defaultValues: isNew
      ? {
          name: '',
          address: '',
          city: '',
          state: '',
          country: '',
        }
      : {},
  });

  useEffect(() => {
    if (!isNew) {
      apiClient.locations.get(id).then((l) => {
        reset({
          name: l.name,
          address: l.address ?? '',
          city: l.city ?? '',
          state: l.state ?? '',
          country: l.country ?? '',
        });
        setIsLoading(false);
      });
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data: CreateLocationRequest) => {
    if (isNew) {
      await apiClient.locations.create(data);
    } else {
      await apiClient.locations.update(id, data);
    }
    router.push('/admin/locations');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.locations.delete(id);
      router.push('/admin/locations');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'Add Location' : 'Edit Location'}</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Name"
            id="name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <FormField label="Address" id="address" {...register('address')} />
          <FormField label="City" id="city" {...register('city')} />
          <FormField label="State" id="state" {...register('state')} />
          <FormField label="Country" id="country" {...register('country')} />

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
        title="Delete Location"
        message="Are you sure you want to delete this location? Tournaments at this location will no longer have a location assigned."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
