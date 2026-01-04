'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import type { Player, Tournament } from '@opprs/rest-api-client';
import { formatPlayerName } from '@/lib/utils/player';

interface LandingData {
  rankingLeaderboard: Player[];
  ratingLeaderboard: Player[];
  recentTournaments: Tournament[];
  stats: {
    players: { total: number; rated: number };
    tournaments: { total: number };
    results: { total: number };
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getEventBoosterLabel(booster: string): string | null {
  const labels: Record<string, string> = {
    CERTIFIED: 'C',
    CERTIFIED_PLUS: 'C+',
    CHAMPIONSHIP_SERIES: 'CS',
    MAJOR: 'M',
  };
  return labels[booster] ?? null;
}

export default function LandingPage() {
  const [data, setData] = useState<LandingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'ranking' | 'rating'>('ranking');

  useEffect(() => {
    async function fetchData() {
      try {
        const [rankingLeaderboard, ratingLeaderboard, recentTournaments, stats] =
          await Promise.all([
            apiClient.stats.leaderboard({ type: 'ranking', limit: 10 }),
            apiClient.stats.leaderboard({ type: 'rating', limit: 10 }),
            apiClient.tournaments.recent({ limit: 5 }),
            apiClient.stats.overview(),
          ]);

        setData({
          rankingLeaderboard,
          ratingLeaderboard,
          recentTournaments,
          stats,
        });
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <p className="text-red-600 text-center">{error || 'Failed to load data'}</p>
        </Card>
      </div>
    );
  }

  const players = viewType === 'ranking' ? data.rankingLeaderboard : data.ratingLeaderboard;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Open Pinball Player Ranking System
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track player rankings, tournament results, and ratings across competitive pinball events.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-900">{data.stats.players.total}</div>
          <div className="text-sm text-gray-600">Total Players</div>
          <div className="text-xs text-gray-500 mt-1">{data.stats.players.rated} rated</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-900">{data.stats.tournaments.total}</div>
          <div className="text-sm text-gray-600">Tournaments</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-900">{data.stats.results.total}</div>
          <div className="text-sm text-gray-600">Results Recorded</div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top 10 Leaderboard</h2>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewType('ranking')}
                className={`px-3 py-1 text-sm font-medium rounded-l-md border ${
                  viewType === 'ranking'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Ranking
              </button>
              <button
                onClick={() => setViewType('rating')}
                className={`px-3 py-1 text-sm font-medium rounded-r-md border-t border-b border-r ${
                  viewType === 'rating'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Rating
              </button>
            </div>
          </div>

          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No players ranked yet.</p>
          ) : (
            <ul className="space-y-2">
              {players.map((player, index) => {
                const displayValue =
                  viewType === 'ranking'
                    ? `#${player.ranking ?? index + 1}`
                    : Math.round(player.rating);

                return (
                  <li
                    key={player.id}
                    className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}.
                      </span>
                      <Link
                        href={`/players/${player.id}`}
                        className="text-sm text-gray-900 hover:text-blue-600"
                      >
                        {formatPlayerName(player)}
                      </Link>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{displayValue}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/rankings"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View full rankings →
            </Link>
          </div>
        </Card>

        {/* Recent Tournaments */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tournaments</h2>
          {data.recentTournaments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent tournaments.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentTournaments.map((tournament) => {
                const boosterLabel = getEventBoosterLabel(tournament.eventBooster);
                return (
                  <li
                    key={tournament.id}
                    className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/tournaments/${tournament.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {tournament.name}
                        </Link>
                        {tournament.location && (
                          <p className="text-xs text-gray-500">{tournament.location}</p>
                        )}
                        {boosterLabel && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                            {boosterLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(tournament.date)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              href="/tournaments"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all tournaments →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
