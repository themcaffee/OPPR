import { Card } from '@/components/ui/Card';

interface PlayerStatsCardProps {
  stats: {
    totalEvents: number;
    averagePosition: number;
    averageEfficiency: number;
    firstPlaceFinishes: number;
    topThreeFinishes: number;
    bestFinish: number;
  };
}

export function PlayerStatsCard({ stats }: PlayerStatsCardProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
          <p className="text-sm text-gray-600">Events Played</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.averagePosition.toFixed(1)}</p>
          <p className="text-sm text-gray-600">Avg Position</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.averageEfficiency.toFixed(0)}%</p>
          <p className="text-sm text-gray-600">Efficiency</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.firstPlaceFinishes}</p>
          <p className="text-sm text-gray-600">1st Place Wins</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.topThreeFinishes}</p>
          <p className="text-sm text-gray-600">Top 3 Finishes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.bestFinish === 0 ? '-' : `#${stats.bestFinish}`}
          </p>
          <p className="text-sm text-gray-600">Best Finish</p>
        </div>
      </div>
    </Card>
  );
}
