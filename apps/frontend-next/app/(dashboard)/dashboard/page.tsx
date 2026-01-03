'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RatingCard } from '@/components/dashboard/RatingCard';
import { RankingCard } from '@/components/dashboard/RankingCard';
import { PlayerStatsCard } from '@/components/dashboard/PlayerStatsCard';
import { RecentResultsTable } from '@/components/dashboard/RecentResultsTable';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { NoPlayerProfile } from '@/components/dashboard/NoPlayerProfile';
import type {
  AuthUser,
  PlayerStats,
  PlayerResult,
  Player,
  Tournament,
} from '@opprs/rest-api-client';

interface DashboardData {
  user: AuthUser | null;
  stats: PlayerStats | null;
  results: PlayerResult[];
  rankingLeaderboard: Player[];
  ratingLeaderboard: Player[];
  recentTournaments: Tournament[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    user: null,
    stats: null,
    results: [],
    rankingLeaderboard: [],
    ratingLeaderboard: [],
    recentTournaments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Cast to AuthUser since we're using cookie-based auth
        const user = (await apiClient.getMe()) as AuthUser;

        // Fetch data that doesn't require a player profile
        const [rankingLeaderboard, ratingLeaderboard, recentTournaments] = await Promise.all([
          apiClient.stats.leaderboard({ type: 'ranking', limit: 10 }),
          apiClient.stats.leaderboard({ type: 'rating', limit: 10 }),
          apiClient.tournaments.recent({ limit: 5 }),
        ]);

        // Fetch player-specific data if profile exists
        let stats: PlayerStats | null = null;
        let results: PlayerResult[] = [];

        if (user.player) {
          [stats, results] = await Promise.all([
            apiClient.players.getStats(user.player.id),
            apiClient.players.getResults(user.player.id),
          ]);
          // Limit to most recent 5 results
          results = results.slice(0, 5);
        }

        setData({
          user,
          stats,
          results,
          rankingLeaderboard,
          ratingLeaderboard,
          recentTournaments,
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <>
        <DashboardHeader />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DashboardHeader />
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const { user, stats, results, rankingLeaderboard, ratingLeaderboard, recentTournaments } = data;
  const hasPlayerProfile = user?.player !== null;

  return (
    <>
      <DashboardHeader playerName={user?.player?.name} />
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          {!hasPlayerProfile ? (
            <NoPlayerProfile />
          ) : (
            <>
              {/* Top row: Rating, Ranking, Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RatingCard
                  rating={user!.player!.rating}
                  ratingDeviation={user!.player!.ratingDeviation}
                  isRated={user!.player!.isRated}
                  eventCount={user!.player!.eventCount}
                />
                <RankingCard
                  ranking={user!.player!.ranking}
                  totalDecayedPoints={stats?.totalDecayedPoints ?? 0}
                />
                <QuickActionsCard />
              </div>

              {/* Second row: Stats and Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {stats && <PlayerStatsCard stats={stats} />}
                </div>
                <LeaderboardCard
                  rankingPlayers={rankingLeaderboard}
                  ratingPlayers={ratingLeaderboard}
                  currentPlayerId={user?.player?.id}
                />
              </div>

              {/* Third row: Recent Results and Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RecentResultsTable results={results} />
                </div>
                <ActivityFeed recentTournaments={recentTournaments} />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
