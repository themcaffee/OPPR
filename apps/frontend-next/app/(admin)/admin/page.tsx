'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import type { OverviewStats } from '@opprs/rest-api-client';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.stats
      .overview()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{stats?.players.total ?? 0}</p>
            <p className="text-gray-600">Total Players</p>
            <p className="text-sm text-gray-500">{stats?.players.rated ?? 0} rated</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats?.tournaments.total ?? 0}</p>
            <p className="text-gray-600">Tournaments</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{stats?.results.total ?? 0}</p>
            <p className="text-gray-600">Results</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
