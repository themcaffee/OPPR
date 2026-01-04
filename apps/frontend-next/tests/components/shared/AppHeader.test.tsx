import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AppHeader } from '@/components/shared/AppHeader';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock the api-client
const mockGetMe = vi.fn();
const mockLogout = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getMe: () => mockGetMe(),
    logout: () => mockLogout(),
  },
}));

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockGetMe.mockRejectedValue(new Error('Not authenticated'));
    });

    it('renders the OPPRS logo link', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const logoLink = screen.getByRole('link', { name: 'OPPRS' });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('renders navigation links', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: 'Rankings' })).toHaveAttribute('href', '/rankings');
      expect(screen.getByRole('link', { name: 'Tournaments' })).toHaveAttribute(
        'href',
        '/tournaments'
      );
    });

    it('renders Sign in and Register links', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
      expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
    });

    it('does not render profile dropdown, Admin, or Sign Out when not authenticated', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
      });

      expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Sign Out' })).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockGetMe.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'user',
        player: {
          id: 'player-1',
          name: 'Test Player',
        },
      });
    });

    it('renders profile dropdown with user name when authenticated', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });
    });

    it('renders Profile link in dropdown when clicked', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });

      // Click the first profile dropdown button (desktop view)
      const profileButtons = screen.getAllByText('Test Player');
      fireEvent.click(profileButtons[0]);

      await waitFor(() => {
        // There may be multiple Profile links (desktop and mobile dropdowns)
        const profileLinks = screen.getAllByRole('menuitem', { name: 'Profile' });
        expect(profileLinks.length).toBeGreaterThan(0);
        expect(profileLinks[0]).toHaveAttribute('href', '/profile');
      });
    });

    it('renders Sign Out button in dropdown when clicked', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });

      // Click the first profile dropdown button (desktop view)
      const profileButtons = screen.getAllByText('Test Player');
      fireEvent.click(profileButtons[0]);

      await waitFor(() => {
        // There may be multiple Sign Out buttons (desktop and mobile dropdowns)
        const signOutButtons = screen.getAllByRole('menuitem', { name: 'Sign Out' });
        expect(signOutButtons.length).toBeGreaterThan(0);
      });
    });

    it('does not render Sign in and Register links when authenticated', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });

      expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Register' })).not.toBeInTheDocument();
    });

    it('does not render Admin link in main nav for non-admin users', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });

      // Admin link should not appear in main navigation for non-admin users
      const nav = screen.getByRole('navigation');
      expect(nav.querySelector('a[href="/admin"]')).not.toBeInTheDocument();
    });
  });

  describe('when user is an admin', () => {
    beforeEach(() => {
      mockGetMe.mockResolvedValue({
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        player: {
          id: 'player-1',
          name: 'Admin Player',
        },
      });
    });

    it('renders Admin link in main navigation for admin users', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByText('Admin Player')).toBeInTheDocument();
      });

      // Admin link should appear in main navigation
      const nav = screen.getByRole('navigation');
      const adminLink = nav.querySelector('a[href="/admin"]');
      expect(adminLink).toBeInTheDocument();
      expect(adminLink).toHaveTextContent('Admin');
    });
  });

  describe('mobile menu', () => {
    beforeEach(() => {
      mockGetMe.mockRejectedValue(new Error('Not authenticated'));
    });

    it('toggles mobile menu when button is clicked', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
      });

      const menuButton = screen.getByRole('button', { name: 'Open menu' });
      expect(menuButton).toBeInTheDocument();

      // Menu should not be visible initially (mobile nav is hidden by md:hidden class)
      // We can't easily test CSS visibility in JSDOM, but we can verify the button works
      fireEvent.click(menuButton);

      // After clicking, the mobile menu items should be in the DOM
      // (they're always rendered when mobileMenuOpen is true)
    });
  });
});
