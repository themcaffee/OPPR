'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import type { EventBoosterType, ImportTournamentResponse } from '@opprs/rest-api-client';

const EVENT_BOOSTERS: Array<{ value: EventBoosterType | ''; label: string }> = [
  { value: '', label: 'Auto-detect (default)' },
  { value: 'NONE', label: 'None' },
  { value: 'CERTIFIED', label: 'Certified' },
  { value: 'CERTIFIED_PLUS', label: 'Certified Plus' },
  { value: 'CHAMPIONSHIP_SERIES', label: 'Championship Series' },
  { value: 'MAJOR', label: 'Major' },
];

interface FormData {
  matchplayId: string;
  eventBooster: EventBoosterType | '';
  apiToken: string;
}

export default function ImportMatchplayPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportTournamentResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      matchplayId: '',
      eventBooster: '',
      apiToken: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setResult(null);

    const matchplayId = parseInt(data.matchplayId, 10);
    if (isNaN(matchplayId) || matchplayId <= 0) {
      setError('Please enter a valid Matchplay tournament ID');
      return;
    }

    try {
      const response = await apiClient.import.matchplayTournament(matchplayId, {
        eventBooster: data.eventBooster || undefined,
        apiToken: data.apiToken || undefined,
      });
      setResult(response);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Import from Matchplay</h1>

      <Card>
        {!result ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Matchplay Tournament ID"
              id="matchplayId"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="e.g., 12345"
              {...register('matchplayId', {
                required: 'Tournament ID is required',
                pattern: {
                  value: /^[0-9]+$/,
                  message: 'Must be a valid number',
                },
              })}
              error={errors.matchplayId?.message}
              hint="Find this in the Matchplay tournament URL: matchplay.events/tournaments/[ID]"
            />

            <div>
              <label
                htmlFor="eventBooster"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Event Booster (optional)
              </label>
              <select
                id="eventBooster"
                {...register('eventBooster')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EVENT_BOOSTERS.map((booster) => (
                  <option key={booster.value} value={booster.value}>
                    {booster.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Override the event booster type. Leave as auto-detect to use the default.
              </p>
            </div>

            <FormField
              label="API Token (optional)"
              id="apiToken"
              type="password"
              {...register('apiToken')}
              hint="Required for private tournaments. Get this from your Matchplay account settings."
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Import Tournament
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800">
                {result.created ? 'Tournament Imported' : 'Tournament Updated'}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Tournament</h4>
                <p className="text-lg font-semibold">{result.tournament.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(result.tournament.date).toLocaleDateString()}
                  {result.tournament.location && ` - ${result.tournament.location}`}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-2xl font-bold text-blue-600">{result.playersCreated}</p>
                  <p className="text-sm text-gray-500">Players Created</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-2xl font-bold text-blue-600">{result.playersUpdated}</p>
                  <p className="text-sm text-gray-500">Players Updated</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md">
                  <p className="text-2xl font-bold text-blue-600">{result.resultsCount}</p>
                  <p className="text-sm text-gray-500">Results</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                <div>
                  <span className="text-gray-500">Event Booster:</span>{' '}
                  <span className="font-medium">{result.tournament.eventBooster}</span>
                </div>
                <div>
                  <span className="text-gray-500">First Place Value:</span>{' '}
                  <span className="font-medium">
                    {result.tournament.firstPlaceValue?.toFixed(2) ?? '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setResult(null)}>
                Import Another
              </Button>
              <Button onClick={() => router.push(`/admin/tournaments/${result.tournament.id}`)}>
                View Tournament
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
