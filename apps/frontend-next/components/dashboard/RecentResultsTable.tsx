import type { ReactElement } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import type { PlayerResult } from '@opprs/rest-api-client';

interface RecentResultsTableProps {
  results: PlayerResult[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDecayColor(multiplier: number | null): string {
  if (multiplier === null) return 'text-gray-500';
  if (multiplier >= 1) return 'text-green-600';
  if (multiplier >= 0.75) return 'text-yellow-600';
  if (multiplier >= 0.5) return 'text-orange-600';
  return 'text-red-600';
}

function getEventBoosterBadge(booster: string): ReactElement | null {
  if (booster === 'NONE') return null;

  const badges: Record<string, { label: string; className: string }> = {
    CERTIFIED: { label: 'C', className: 'bg-blue-100 text-blue-800' },
    CERTIFIED_PLUS: { label: 'C+', className: 'bg-blue-200 text-blue-900' },
    CHAMPIONSHIP_SERIES: { label: 'CS', className: 'bg-purple-100 text-purple-800' },
    MAJOR: { label: 'M', className: 'bg-amber-100 text-amber-800' },
  };

  const badge = badges[booster];
  if (!badge) return null;

  return (
    <span className={`ml-2 px-1.5 py-0.5 text-xs font-medium rounded ${badge.className}`}>
      {badge.label}
    </span>
  );
}

export function RecentResultsTable({ results }: RecentResultsTableProps) {
  if (results.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
        <p className="text-gray-500 text-center py-4">No tournament results yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
      <div className="overflow-x-auto -mx-8 -mb-8">
        <table className="w-full">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tournament
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Pos
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Points
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Decayed
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(result.tournament.date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <Link
                    href={`/tournaments/${result.tournament.id}`}
                    className="hover:text-blue-600"
                  >
                    {result.tournament.name}
                  </Link>
                  {getEventBoosterBadge(result.tournament.eventBooster)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-center font-medium">
                  {result.position}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {result.totalPoints?.toFixed(1) ?? '-'}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${getDecayColor(result.decayMultiplier)}`}>
                  {result.decayedPoints?.toFixed(1) ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
