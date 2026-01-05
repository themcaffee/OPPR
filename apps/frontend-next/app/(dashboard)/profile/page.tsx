'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { PlayerStatsCard } from '@/components/dashboard/PlayerStatsCard';
import { RecentResultsTable } from '@/components/dashboard/RecentResultsTable';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { NoPlayerProfile } from '@/components/dashboard/NoPlayerProfile';
import { LogoutButton } from '@/components/auth/LogoutButton';
import type {
  AuthUser,
  PlayerStats,
  PlayerResult,
  Player,
  Tournament,
} from '@opprs/rest-api-client';

interface ProfileData {
  user: AuthUser | null;
  stats: PlayerStats | null;
  results: PlayerResult[];
  leaderboard: Player[];
  recentTournaments: Tournament[];
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData>({
    user: null,
    stats: null,
    results: [],
    leaderboard: [],
    recentTournaments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        // Cast to AuthUser since we're using cookie-based auth
        const user = (await apiClient.getMe()) as AuthUser;

        // Fetch data that doesn't require a player profile
        const [leaderboard, recentTournaments] = await Promise.all([
          apiClient.stats.leaderboard({ type: 'ranking', limit: 10 }),
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
          leaderboard,
          recentTournaments,
        });
      } catch (err) {
        console.error('Profile data fetch error:', err);
        setError('Failed to load profile data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, []);

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
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
    );
  }

  const { user, stats, results, leaderboard, recentTournaments } = data;
  const hasPlayerProfile = user?.player != null;

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <LogoutButton />
        </div>

          {!hasPlayerProfile ? (
            <NoPlayerProfile />
          ) : (
            <>
              {/* First row: Stats and Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {stats && <PlayerStatsCard stats={stats} />}
                </div>
                <LeaderboardCard
                  players={leaderboard}
                  currentPlayerId={user?.player?.id}
                />
              </div>

              {/* Second row: Recent Results and Activity Feed */}
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
  );
}
