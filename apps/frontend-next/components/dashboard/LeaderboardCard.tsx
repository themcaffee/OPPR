import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import type { Player } from '@opprs/rest-api-client';

interface LeaderboardCardProps {
  players: Player[];
  currentPlayerId?: string;
}

export function LeaderboardCard({ players, currentPlayerId }: LeaderboardCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
      </div>

      {players.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No players ranked yet.</p>
      ) : (
        <ul className="space-y-2">
          {players.map((player, index) => {
            const isCurrentUser = player.id === currentPlayerId;

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
                  <Link
                    href={`/players/${player.id}`}
                    className={`text-sm hover:text-blue-600 ${isCurrentUser ? 'font-semibold text-blue-700' : 'text-gray-900'}`}
                  >
                    {player.name ?? 'Unknown Player'}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-blue-600">(You)</span>
                    )}
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    #{player.ranking ?? index + 1}
                  </span>
                  <span className="text-sm text-gray-500">{Math.round(player.rating)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
