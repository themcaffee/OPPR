'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Player, PaginatedResponse } from '@opprs/rest-api-client';

export default function AdminPlayersPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Player> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (search) {
        const players = await apiClient.players.search({ q: search, limit: 50 });
        setData({
          data: players,
          pagination: { page: 1, limit: 50, total: players.length, totalPages: 1 },
        });
      } else {
        const result = await apiClient.players.list({ page, limit: 20 });
        setData(result);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const columns = [
    { key: 'name', header: 'Name', render: (p: Player) => p.name ?? '-' },
    { key: 'email', header: 'Email', render: (p: Player) => p.email ?? '-' },
    { key: 'rating', header: 'Rating', render: (p: Player) => p.rating.toFixed(0) },
    { key: 'ranking', header: 'Ranking', render: (p: Player) => p.ranking ?? '-' },
    { key: 'eventCount', header: 'Events' },
    { key: 'isRated', header: 'Rated', render: (p: Player) => (p.isRated ? 'Yes' : 'No') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Players</h1>
        <Button onClick={() => router.push('/admin/players/new')}>Add Player</Button>
      </div>

      <Card className="p-0">
        <div className="p-4 border-b">
          <SearchInput value={search} onChange={setSearch} placeholder="Search players..." />
        </div>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(p) => router.push(`/admin/players/${p.id}`)}
        />
        {data && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
