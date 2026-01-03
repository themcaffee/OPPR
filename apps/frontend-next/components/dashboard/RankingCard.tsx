import { Card } from '@/components/ui/Card';

interface RankingCardProps {
  ranking: number | null;
  totalDecayedPoints: number;
}

export function RankingCard({ ranking, totalDecayedPoints }: RankingCardProps) {
  return (
    <Card>
      <div className="text-center">
        <p className="text-3xl font-bold text-purple-600">
          {ranking ? `#${ranking}` : 'Unranked'}
        </p>
        <p className="text-gray-600">World Ranking</p>
        <p className="text-sm text-gray-500">
          {totalDecayedPoints.toFixed(1)} points
        </p>
      </div>
    </Card>
  );
}
