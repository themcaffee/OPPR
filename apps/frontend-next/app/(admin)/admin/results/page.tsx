'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ResultWithRelations, PaginatedResponse } from '@opprs/rest-api-client';

export default function AdminResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<ResultWithRelations> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.results.list({ page, limit: 20 });
      setData(result);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const columns = [
    {
      key: 'player',
      header: 'Player',
      render: (r: ResultWithRelations) => r.player.name ?? r.player.email ?? '-',
    },
    {
      key: 'tournament',
      header: 'Tournament',
      render: (r: ResultWithRelations) => r.tournament.name,
    },
    { key: 'position', header: 'Position' },
    {
      key: 'totalPoints',
      header: 'Points',
      render: (r: ResultWithRelations) => r.totalPoints?.toFixed(2) ?? '-',
    },
    {
      key: 'decayedPoints',
      header: 'Decayed Points',
      render: (r: ResultWithRelations) => r.decayedPoints?.toFixed(2) ?? '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <Button onClick={() => router.push('/admin/results/new')}>Add Result</Button>
      </div>

      <Card className="p-0">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(r) => router.push(`/admin/results/${r.id}`)}
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
