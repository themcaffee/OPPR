'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { Player } from '@opprs/rest-api-client';

interface LeaderboardCardProps {
  rankingPlayers: Player[];
  ratingPlayers: Player[];
  currentPlayerId?: string;
}

export function LeaderboardCard({
  rankingPlayers,
  ratingPlayers,
  currentPlayerId,
}: LeaderboardCardProps) {
  const [viewType, setViewType] = useState<'ranking' | 'rating'>('ranking');

  const players = viewType === 'ranking' ? rankingPlayers : ratingPlayers;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setViewType('ranking')}
            className={`px-3 py-1 text-sm font-medium rounded-l-md border ${
              viewType === 'ranking'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Ranking
          </button>
          <button
            onClick={() => setViewType('rating')}
            className={`px-3 py-1 text-sm font-medium rounded-r-md border-t border-b border-r ${
              viewType === 'rating'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Rating
          </button>
        </div>
      </div>

      {players.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No players ranked yet.</p>
      ) : (
        <ul className="space-y-2">
          {players.map((player, index) => {
            const isCurrentUser = player.id === currentPlayerId;
            const displayValue =
              viewType === 'ranking'
                ? `#${player.ranking ?? index + 1}`
                : Math.round(player.rating);

            return (
              <li
                key={player.id}
                className={`flex items-center justify-between py-2 px-3 rounded ${
                  isCurrentUser ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    {index + 1}.
                  </span>
                  <span className={`text-sm ${isCurrentUser ? 'font-semibold text-blue-700' : 'text-gray-900'}`}>
                    {player.name ?? 'Unknown Player'}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-blue-600">(You)</span>
                    )}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{displayValue}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
