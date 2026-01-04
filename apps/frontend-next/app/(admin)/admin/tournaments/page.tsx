'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Tournament, PaginatedResponse } from '@opprs/rest-api-client';

export default function AdminTournamentsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Tournament> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    try {
      if (search) {
        const tournaments = await apiClient.tournaments.search({ q: search, limit: 50 });
        setData({
          data: tournaments,
          pagination: { page: 1, limit: 50, total: tournaments.length, totalPages: 1 },
        });
      } else {
        const result = await apiClient.tournaments.list({ page, limit: 20 });
        setData(result);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'date',
      header: 'Date',
      render: (t: Tournament) => new Date(t.date).toLocaleDateString(),
    },
    { key: 'location', header: 'Location', render: (t: Tournament) => t.location?.name ?? '-' },
    { key: 'eventBooster', header: 'Booster' },
    {
      key: 'firstPlaceValue',
      header: '1st Place Value',
      render: (t: Tournament) => t.firstPlaceValue?.toFixed(2) ?? '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => router.push('/admin/import/matchplay')}>
            Import from Matchplay
          </Button>
          <Button onClick={() => router.push('/admin/tournaments/new')}>Add Tournament</Button>
        </div>
      </div>

      <Card className="p-0">
        <div className="p-4 border-b">
          <SearchInput value={search} onChange={setSearch} placeholder="Search tournaments..." />
        </div>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(t) => router.push(`/admin/tournaments/${t.id}`)}
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
