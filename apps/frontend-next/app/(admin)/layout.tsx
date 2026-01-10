'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AppHeader } from '@/components/shared/AppHeader';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader />
      <div className="flex">
        {/* Mobile menu button */}
        <div className="md:hidden fixed bottom-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="sr-only">Open admin menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
