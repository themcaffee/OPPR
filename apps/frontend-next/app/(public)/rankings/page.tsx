'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import type { Player, PaginatedResponse } from '@opprs/rest-api-client';

export default function RankingsPage() {
  const [data, setData] = useState<PaginatedResponse<Player> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'ranking' | 'rating'>('ranking');
  const [page, setPage] = useState(1);
  const limit = 50;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await apiClient.players.list({
          page,
          limit,
          sortBy: viewType,
          sortOrder: viewType === 'ranking' ? 'asc' : 'desc',
          isRated: true,
        });
        setData(result);
      } catch (err) {
        setError('Failed to load rankings');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [page, viewType]);

  const handleViewTypeChange = (type: 'ranking' | 'rating') => {
    setViewType(type);
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Player Rankings</h1>
        <p className="text-gray-600">
          View all rated players sorted by {viewType === 'ranking' ? 'world ranking' : 'Glicko rating'}.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => handleViewTypeChange('ranking')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewType === 'ranking'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Ranking
            </button>
            <button
              onClick={() => handleViewTypeChange('rating')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                viewType === 'rating'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Rating
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : error || !data ? (
          <p className="text-red-600 text-center py-8">{error || 'Failed to load rankings'}</p>
        ) : data.data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No rated players yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-16">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      Player
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      {viewType === 'ranking' ? 'Rank' : 'Rating'}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      Events
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((player, index) => {
                    const position = (page - 1) * limit + index + 1;
                    const displayValue =
                      viewType === 'ranking'
                        ? player.ranking ?? '-'
                        : Math.round(player.rating);

                    return (
                      <tr
                        key={player.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-500">{position}</td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/players/${player.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {player.name ?? 'Unknown Player'}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-gray-700">
                          {viewType === 'ranking' && typeof displayValue === 'number'
                            ? `#${displayValue}`
                            : displayValue}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-500">
                          {player.eventCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} players)
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
