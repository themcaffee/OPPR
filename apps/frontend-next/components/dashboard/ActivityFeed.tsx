import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import type { Tournament } from '@opprs/rest-api-client';

interface ActivityFeedProps {
  recentTournaments: Tournament[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
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

export function ActivityFeed({ recentTournaments }: ActivityFeedProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tournaments</h3>
      {recentTournaments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent tournaments.</p>
      ) : (
        <ul className="space-y-3">
          {recentTournaments.map((tournament) => {
            const boosterLabel = getEventBoosterLabel(tournament.eventBooster);
            return (
              <li key={tournament.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <Link
                  href={`/tournaments/${tournament.id}`}
                  className="flex items-start justify-between hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 hover:text-blue-600">{tournament.name}</p>
                    {tournament.location && (
                      <p className="text-xs text-gray-500">{tournament.location}</p>
                    )}
                    {boosterLabel && (
                      <span className="inline-block mt-1 text-xs text-blue-600">
                        {boosterLabel}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(tournament.date)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
