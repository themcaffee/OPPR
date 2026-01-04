import type { ReactNode } from 'react';
import { AppHeader } from '@/components/shared/AppHeader';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader />
      {children}
    </div>
  );
}
