'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import {
  TGPConfigForm,
  defaultTGPConfig,
  type EventBoosterType,
} from '@/components/admin/TGPConfigForm';
import { TournamentValueDisplay } from '@/components/admin/TournamentValueDisplay';
import { TournamentResultsManager } from '@/components/admin/TournamentResultsManager';
import type { UpdateTournamentRequest, Tournament } from '@opprs/rest-api-client';
import type { TGPConfig } from '@opprs/core';

type TabType = 'details' | 'results';

interface FormData {
  name: string;
  date: string;
  location: string;
}

export default function AdminTournamentEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [isLoading, setIsLoading] = useState(!isNew);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tournament, setTournament] = useState<Tournament | null>(null);

  // TGP Configuration state
  const [tgpConfig, setTgpConfig] = useState<TGPConfig>(defaultTGPConfig);
  const [eventBooster, setEventBooster] = useState<EventBoosterType>('NONE');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    if (!isNew) {
      apiClient.tournaments.get(id).then((t) => {
        setTournament(t);
        reset({
          name: t.name,
          date: t.date.split('T')[0],
          location: t.location ?? '',
        });
        setEventBooster(t.eventBooster as EventBoosterType);
        // Load TGP config if available
        if (t.tgpConfig && typeof t.tgpConfig === 'object') {
          const config = t.tgpConfig as Record<string, unknown>;
          if (config.qualifying && config.finals) {
            setTgpConfig(config as unknown as TGPConfig);
          }
        }
        setIsLoading(false);
      });
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data: FormData) => {
    const payload: UpdateTournamentRequest = {
      name: data.name,
      date: new Date(data.date).toISOString(),
      location: data.location || undefined,
      eventBooster,
      tgpConfig: tgpConfig as unknown as Record<string, unknown>,
    };
    if (isNew) {
      const created = await apiClient.tournaments.create(
        payload as Required<UpdateTournamentRequest>
      );
      // Navigate to the newly created tournament to allow adding results
      router.push(`/admin/tournaments/${created.id}`);
    } else {
      await apiClient.tournaments.update(id, payload);
      // Refresh tournament data
      const updated = await apiClient.tournaments.get(id);
      setTournament(updated);
    }
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

  // Calculate result stats for display
  const resultStats = useMemo(() => {
    // This would come from the tournament data in a real implementation
    return {
      totalPlayers: 0,
      ratedPlayers: 0,
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tournament...</div>
      </div>
    );
  }

  const tabClasses = (tab: TabType) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      activeTab === tab
        ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200'
        : 'bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200'
    }`;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? 'Add Tournament' : `Edit: ${tournament?.name || 'Tournament'}`}
        </h1>
        {!isNew && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Delete Tournament
          </Button>
        )}
      </div>

      {/* Tabs - only show for existing tournaments */}
      {!isNew && (
        <div className="flex space-x-1 mb-0 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={tabClasses('details')}
          >
            Details & Configuration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={tabClasses('results')}
          >
            Results
          </button>
        </div>
      )}

      {/* Details Tab */}
      {(isNew || activeTab === 'details') && (
        <div className="space-y-6 mt-6">
          {/* Basic Info */}
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <FormField label="Location" id="location" {...register('location')} />

              <div className="flex justify-end pt-4 border-t">
                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    {isNew ? 'Create Tournament' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* TGP Configuration */}
          <TGPConfigForm
            tgpConfig={tgpConfig}
            eventBooster={eventBooster}
            onTGPConfigChange={setTgpConfig}
            onEventBoosterChange={setEventBooster}
          />

          {/* Tournament Value Preview */}
          <TournamentValueDisplay
            tgpConfig={tgpConfig}
            eventBooster={eventBooster}
            ratedPlayerCount={resultStats.ratedPlayers}
            totalPlayerCount={resultStats.totalPlayers}
          />

          {isNew && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After creating the tournament, you&apos;ll be able to add
                player results in the Results tab.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results Tab */}
      {!isNew && activeTab === 'results' && (
        <div className="mt-6">
          <TournamentResultsManager tournamentId={id} tournamentName={tournament?.name} />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Tournament"
        message="Are you sure you want to delete this tournament? This will also delete all associated results. This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
