'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import type { Tournament, TournamentResult } from '@opprs/rest-api-client';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getEventBoosterLabel(booster: string): string {
  const labels: Record<string, string> = {
    NONE: 'None',
    CERTIFIED: 'Certified',
    CERTIFIED_PLUS: 'Certified+',
    CHAMPIONSHIP_SERIES: 'Championship Series',
    MAJOR: 'Major',
  };
  return labels[booster] ?? booster;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [results, setResults] = useState<TournamentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tournamentData, resultsData] = await Promise.all([
          apiClient.tournaments.get(tournamentId),
          apiClient.tournaments.getResults(tournamentId),
        ]);
        setTournament(tournamentData);
        setResults(resultsData);
      } catch (err) {
        setError('Failed to load tournament');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [tournamentId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <p className="text-red-600 text-center">{error || 'Tournament not found'}</p>
          <div className="mt-4 text-center">
            <Link href="/tournaments" className="text-blue-600 hover:text-blue-800">
              ← Back to tournaments
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <div className="mb-6">
        <Link href="/tournaments" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to tournaments
        </Link>
      </div>

      {/* Tournament Info */}
      <Card className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
        {tournament.location && (
          <p className="text-gray-600 mb-4">{tournament.location}</p>
        )}
        <div className="text-sm text-gray-500 mb-6">{formatDate(tournament.date)}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase">Event Type</div>
            <div className="text-sm font-medium text-gray-900">
              {getEventBoosterLabel(tournament.eventBooster)}
            </div>
          </div>
          {tournament.tgp && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase">TGP</div>
              <div className="text-sm font-medium text-gray-900">{tournament.tgp}%</div>
            </div>
          )}
          {tournament.firstPlaceValue && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase">1st Place</div>
              <div className="text-sm font-medium text-gray-900">
                {tournament.firstPlaceValue.toFixed(2)} pts
              </div>
            </div>
          )}
          {tournament.baseValue && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase">Base Value</div>
              <div className="text-sm font-medium text-gray-900">
                {tournament.baseValue.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Standings ({results.length} players)
        </h2>

        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No results recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-16">
                    Pos
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Player
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Points
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Efficiency
                  </th>
                </tr>
              </thead>
              <tbody>
                {results
                  .sort((a, b) => a.position - b.position)
                  .map((result) => (
                    <tr
                      key={result.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {result.position}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/players/${result.player.id}`}
                          className="text-sm text-gray-900 hover:text-blue-600"
                        >
                          {result.player.name ?? 'Unknown Player'}
                        </Link>
                        {result.optedOut && (
                          <span className="ml-2 text-xs text-gray-400">(opted out)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-700">
                        {result.totalPoints?.toFixed(2) ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-500">
                        {result.efficiency ? `${(result.efficiency * 100).toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
