import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export function QuickActionsCard() {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        <Link
          href="/profile/results"
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          View My Results
        </Link>
        <Link
          href="/profile/tournaments"
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          Find Tournaments
        </Link>
        <Link
          href="/profile/settings"
          className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          Update Profile
        </Link>
      </div>
    </Card>
  );
}
