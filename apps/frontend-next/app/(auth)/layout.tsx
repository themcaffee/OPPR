import type { ReactNode } from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-blue-600">
          OPPRS
        </Link>
        <p className="mt-2 text-gray-600">Open Pinball Player Ranking System</p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
