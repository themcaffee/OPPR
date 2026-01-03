import { Card } from '@/components/ui/Card';

interface RatingCardProps {
  rating: number;
  ratingDeviation: number;
  isRated: boolean;
  eventCount: number;
}

export function RatingCard({ rating, ratingDeviation, isRated, eventCount }: RatingCardProps) {
  const eventsUntilRated = Math.max(0, 5 - eventCount);

  return (
    <Card>
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600">{Math.round(rating)}</p>
        <p className="text-gray-600">Rating</p>
        <p className="text-sm text-gray-500">RD: {Math.round(ratingDeviation)}</p>
        {isRated ? (
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
            Rated Player
          </span>
        ) : (
          <p className="mt-2 text-sm text-amber-600">
            {eventsUntilRated} event{eventsUntilRated !== 1 ? 's' : ''} until rated
          </p>
        )}
      </div>
    </Card>
  );
}
