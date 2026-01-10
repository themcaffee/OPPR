'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { ProfileDropdown } from '@/components/shared/ProfileDropdown';
import type { AuthUser } from '@opprs/rest-api-client';

const navLinks = [
  { href: '/rankings', label: 'Rankings' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/blog', label: 'Blog' },
];

export function AppHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = (await apiClient.getMe()) as AuthUser;
        setUser(userData);
      } catch {
        // Not authenticated, that's fine
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            OPPRS
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/admin' || pathname.startsWith('/admin/')
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Auth Links - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
            ) : isAuthenticated && user ? (
              <ProfileDropdown user={user} />
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium ${
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`text-sm font-medium ${
                    pathname === '/admin' || pathname.startsWith('/admin/')
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <div className="pt-4 border-t border-gray-200 flex flex-col space-y-4">
                {isLoading ? (
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                ) : isAuthenticated && user ? (
                  <ProfileDropdown user={user} onSignOut={() => setMobileMenuOpen(false)} />
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="text-sm text-gray-600 hover:text-gray-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
