'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import type { Tournament, PaginatedResponse } from '@opprs/rest-api-client';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getEventBoosterLabel(booster: string): string | null {
  const labels: Record<string, string> = {
    CERTIFIED: 'Certified',
    CERTIFIED_PLUS: 'Certified+',
    CHAMPIONSHIP_SERIES: 'Championship Series',
    MAJOR: 'Major',
  };
  return labels[booster] ?? null;
}

export default function TournamentsPage() {
  const [data, setData] = useState<PaginatedResponse<Tournament> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (searchQuery) {
          const results = await apiClient.tournaments.search({ q: searchQuery, limit: 50 });
          setData({
            data: results,
            pagination: { page: 1, limit: 50, total: results.length, totalPages: 1 },
          });
        } else {
          const result = await apiClient.tournaments.list({
            page,
            limit,
            sortBy: 'date',
            sortOrder: 'desc',
          });
          setData(result);
        }
      } catch (err) {
        setError('Failed to load tournaments');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [page, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tournaments</h1>
        <p className="text-gray-600">Browse all tournaments and view their results.</p>
      </div>

      <Card>
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tournaments..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : error || !data ? (
          <p className="text-red-600 text-center py-8">{error || 'Failed to load tournaments'}</p>
        ) : data.data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {searchQuery ? 'No tournaments found matching your search.' : 'No tournaments yet.'}
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {data.data.map((tournament) => {
                const boosterLabel = getEventBoosterLabel(tournament.eventBooster);
                return (
                  <Link
                    key={tournament.id}
                    href={`/tournaments/${tournament.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {tournament.name}
                        </h3>
                        {tournament.location?.name && (
                          <p className="text-sm text-gray-500">{tournament.location.name}</p>
                        )}
                        <div className="flex items-center space-x-3 mt-2">
                          {boosterLabel && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                              {boosterLabel}
                            </span>
                          )}
                          {tournament.firstPlaceValue && (
                            <span className="text-xs text-gray-500">
                              1st: {tournament.firstPlaceValue.toFixed(1)} pts
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(tournament.date)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {!searchQuery && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} tournaments)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={page === data.pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
