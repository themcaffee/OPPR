import type { ReactNode } from 'react';
import { AppHeader } from '@/components/shared/AppHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
