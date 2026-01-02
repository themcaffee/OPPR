import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Welcome - OPPRS',
  description: 'Welcome to OPPRS',
};

export default function ProfilePage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Welcome to OPPRS!</h1>
      <p className="text-gray-600 text-center mb-6">
        Your account has been created successfully. You can now start tracking your pinball
        tournament results.
      </p>
      <div className="text-center">
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </Card>
  );
}
