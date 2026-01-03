'use client';

import Link from 'next/link';
import { LogoutButton } from '@/components/auth/LogoutButton';

interface DashboardHeaderProps {
  playerName?: string | null;
}

export function DashboardHeader({ playerName }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            OPPRS
          </Link>
          {playerName && (
            <span className="text-gray-600">Welcome, {playerName}!</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
