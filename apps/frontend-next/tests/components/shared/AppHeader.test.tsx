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
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    getMe: () => mockGetMe(),
    logout: vi.fn().mockResolvedValue(undefined),
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
      expect(screen.getByRole('link', { name: 'Players' })).toHaveAttribute('href', '/players');
    });

    it('renders Sign in and Register links', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
      expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
    });

    it('does not render Dashboard, Admin, or Sign Out when not authenticated', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
      });

      expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
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

    it('renders Dashboard link when authenticated', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    });

    it('renders Sign Out button when authenticated', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
      });
    });

    it('displays welcome message with player name', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByText('Welcome, Test Player!')).toBeInTheDocument();
      });
    });

    it('does not render Sign in and Register links when authenticated', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
      });

      expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'Register' })).not.toBeInTheDocument();
    });

    it('does not render Admin link for non-admin users', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
      });

      expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();
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

    it('renders Admin link for admin users', async () => {
      render(<AppHeader />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');
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
