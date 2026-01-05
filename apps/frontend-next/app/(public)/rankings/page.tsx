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
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 50;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        if (searchQuery) {
          const results = await apiClient.players.search({ q: searchQuery, limit: 50 });
          setData({
            data: results,
            pagination: { page: 1, limit: 50, total: results.length, totalPages: 1 },
          });
        } else {
          const result = await apiClient.players.list({
            page,
            limit,
            sortBy: 'ranking',
            sortOrder: 'asc',
            isRated: true,
          });
          setData(result);
        }
      } catch (err) {
        setError('Failed to load rankings');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Player Rankings</h1>
        <p className="text-gray-600">View all rated players sorted by world ranking.</p>
      </div>

      <Card>
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search players..."
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

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {searchQuery ? 'Search Results' : 'Leaderboard'}
          </h2>
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
          <p className="text-gray-500 text-center py-8">
            {searchQuery ? 'No players found matching your search.' : 'No rated players yet.'}
          </p>
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
                      Rank
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      Rating
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      Events
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((player, index) => {
                    const position = (page - 1) * limit + index + 1;

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
                          {searchQuery && player.isRated && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                              Rated
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-medium text-gray-700">
                          {player.ranking != null ? `#${player.ranking}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-500">
                          {Math.round(player.rating)}
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
            {!searchQuery && data.pagination.totalPages > 1 && (
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
