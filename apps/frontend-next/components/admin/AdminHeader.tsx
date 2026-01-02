import Link from 'next/link';
import { LogoutButton } from '@/components/auth/LogoutButton';

export function AdminHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-gray-900">
            OPPRS
          </Link>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            Admin
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            View Site
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
