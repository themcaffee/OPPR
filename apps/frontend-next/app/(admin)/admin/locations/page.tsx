'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Location, PaginatedResponse } from '@opprs/rest-api-client';

export default function AdminLocationsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Location> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    try {
      if (search) {
        const locations = await apiClient.locations.search({ q: search, limit: 50 });
        setData({
          data: locations,
          pagination: { page: 1, limit: 50, total: locations.length, totalPages: 1 },
        });
      } else {
        const result = await apiClient.locations.list({ page, limit: 20, sortBy: 'name' });
        setData(result);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'city', header: 'City', render: (l: Location) => l.city ?? '-' },
    { key: 'state', header: 'State', render: (l: Location) => l.state ?? '-' },
    { key: 'country', header: 'Country', render: (l: Location) => l.country ?? '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        <Button onClick={() => router.push('/admin/locations/new')}>Add Location</Button>
      </div>

      <Card className="p-0">
        <div className="p-4 border-b">
          <SearchInput value={search} onChange={setSearch} placeholder="Search locations..." />
        </div>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(l) => router.push(`/admin/locations/${l.id}`)}
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
