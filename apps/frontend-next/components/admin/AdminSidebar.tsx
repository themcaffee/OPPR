'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/players', label: 'Players' },
  { href: '/admin/tournaments', label: 'Tournaments' },
  { href: '/admin/results', label: 'Results' },
  { href: '/admin/users', label: 'Users' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
