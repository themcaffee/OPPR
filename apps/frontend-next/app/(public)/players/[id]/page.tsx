'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import type { Player, PlayerStats, PlayerResult } from '@opprs/rest-api-client';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getEventBoosterBadge(booster: string): { label: string; color: string } | null {
  const badges: Record<string, { label: string; color: string }> = {
    CERTIFIED: { label: 'C', color: 'bg-blue-100 text-blue-700' },
    CERTIFIED_PLUS: { label: 'C+', color: 'bg-blue-200 text-blue-800' },
    CHAMPIONSHIP_SERIES: { label: 'CS', color: 'bg-purple-100 text-purple-700' },
    MAJOR: { label: 'M', color: 'bg-yellow-100 text-yellow-800' },
  };
  return badges[booster] ?? null;
}

function getDecayColor(multiplier: number | null | undefined): string {
  if (!multiplier) return 'text-gray-400';
  if (multiplier >= 1) return 'text-green-600';
  if (multiplier >= 0.75) return 'text-yellow-600';
  if (multiplier >= 0.5) return 'text-orange-500';
  return 'text-red-500';
}

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = params.id as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [playerData, statsData, resultsData] = await Promise.all([
          apiClient.players.get(playerId),
          apiClient.players.getStats(playerId),
          apiClient.players.getResults(playerId),
        ]);
        setPlayer(playerData);
        setStats(statsData);
        setResults(resultsData);
      } catch (err) {
        setError('Failed to load player');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <p className="text-red-600 text-center">{error || 'Player not found'}</p>
          <div className="mt-4 text-center">
            <Link href="/rankings" className="text-blue-600 hover:text-blue-800">
              ← Back to rankings
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
        <Link href="/rankings" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to rankings
        </Link>
      </div>

      {/* Player Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {player.name ?? 'Unknown Player'}
        </h1>
        <div className="flex items-center space-x-4">
          {player.isRated ? (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
              Rated
            </span>
          ) : (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {5 - player.eventCount} more events to rated
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1">Rating</div>
          <div className="text-2xl font-bold text-gray-900">{Math.round(player.rating)}</div>
          <div className="text-xs text-gray-400">RD: {Math.round(player.ratingDeviation)}</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1">Ranking</div>
          <div className="text-2xl font-bold text-gray-900">
            {player.ranking ? `#${player.ranking}` : '-'}
          </div>
          {stats && (
            <div className="text-xs text-gray-400">{stats.totalDecayedPoints?.toFixed(1)} pts</div>
          )}
        </Card>
        <Card className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1">Events</div>
          <div className="text-2xl font-bold text-gray-900">{player.eventCount}</div>
        </Card>
        {stats && (
          <Card className="text-center">
            <div className="text-xs text-gray-500 uppercase mb-1">Avg Position</div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.averagePosition?.toFixed(1) ?? '-'}
            </div>
          </Card>
        )}
      </div>

      {/* Performance Stats */}
      {stats && stats.totalEvents > 0 && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">First Places</div>
              <div className="text-xl font-bold text-gray-900">{stats.firstPlaceFinishes}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Top 3 Finishes</div>
              <div className="text-xl font-bold text-gray-900">{stats.topThreeFinishes}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Best Finish</div>
              <div className="text-xl font-bold text-gray-900">
                {stats.bestFinish ? `#${stats.bestFinish}` : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg Efficiency</div>
              <div className="text-xl font-bold text-gray-900">
                {stats.averageEfficiency ? `${(stats.averageEfficiency * 100).toFixed(1)}%` : '-'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tournament History */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tournament History ({results.length} events)
        </h2>

        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tournament results yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Tournament
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Pos
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Points
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                    Decayed
                  </th>
                </tr>
              </thead>
              <tbody>
                {results
                  .sort((a, b) => new Date(b.tournament.date).getTime() - new Date(a.tournament.date).getTime())
                  .map((result) => {
                    const badge = getEventBoosterBadge(result.tournament.eventBooster);
                    return (
                      <tr
                        key={result.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(result.tournament.date)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/tournaments/${result.tournament.id}`}
                              className="text-sm text-gray-900 hover:text-blue-600"
                            >
                              {result.tournament.name}
                            </Link>
                            {badge && (
                              <span className={`px-1.5 py-0.5 text-xs rounded ${badge.color}`}>
                                {badge.label}
                              </span>
                            )}
                          </div>
                          {result.tournament.location?.name && (
                            <div className="text-xs text-gray-400">{result.tournament.location.name}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-gray-900">
                          {result.position}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-700">
                          {result.totalPoints?.toFixed(2) ?? '-'}
                        </td>
                        <td className={`py-3 px-4 text-right text-sm font-medium ${getDecayColor(result.decayMultiplier)}`}>
                          {result.decayedPoints?.toFixed(2) ?? '-'}
                          {result.decayMultiplier !== null && result.decayMultiplier !== undefined && result.decayMultiplier < 1 && (
                            <span className="text-xs ml-1">({(result.decayMultiplier * 100).toFixed(0)}%)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
