import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileDropdown } from '@/components/shared/ProfileDropdown';
import type { AuthUser } from '@opprs/rest-api-client';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

// Mock the api-client
const mockLogout = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    logout: () => mockLogout(),
  },
}));

describe('ProfileDropdown', () => {
  const mockUser: AuthUser = {
    id: '1',
    email: 'test@example.com',
    role: 'user',
    player: {
      id: 'player-1',
      firstName: 'Test',
      middleInitial: null,
      lastName: 'Player',
      rating: 1500,
      ratingDeviation: 350,
      ranking: 1,
      isRated: true,
      eventCount: 5,
    },
  };

  const mockUserWithoutPlayer: AuthUser = {
    id: '2',
    email: 'noname@example.com',
    role: 'user',
    player: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays player name when available', () => {
    render(<ProfileDropdown user={mockUser} />);

    expect(screen.getByText('Test Player')).toBeInTheDocument();
  });

  it('displays email when player name is not available', () => {
    render(<ProfileDropdown user={mockUserWithoutPlayer} />);

    expect(screen.getByText('noname@example.com')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<ProfileDropdown user={mockUser} />);

    const button = screen.getByText('Test Player');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Sign Out' })).toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking the button again', async () => {
    render(<ProfileDropdown user={mockUser} />);

    const button = screen.getByText('Test Player');

    // Open dropdown
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
    });

    // Close dropdown
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument();
    });
  });

  it('Profile link has correct href', async () => {
    render(<ProfileDropdown user={mockUser} />);

    fireEvent.click(screen.getByText('Test Player'));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveAttribute('href', '/profile');
    });
  });

  it('calls logout and redirects on Sign Out click', async () => {
    render(<ProfileDropdown user={mockUser} />);

    fireEvent.click(screen.getByText('Test Player'));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Sign Out' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign Out' }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/sign-in');
    });
  });

  it('calls onSignOut callback when signing out', async () => {
    const mockOnSignOut = vi.fn();
    render(<ProfileDropdown user={mockUser} onSignOut={mockOnSignOut} />);

    fireEvent.click(screen.getByText('Test Player'));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Sign Out' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign Out' }));

    await waitFor(() => {
      expect(mockOnSignOut).toHaveBeenCalled();
    });
  });

  it('closes dropdown when clicking Profile link', async () => {
    render(<ProfileDropdown user={mockUser} />);

    fireEvent.click(screen.getByText('Test Player'));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('menuitem', { name: 'Profile' }));

    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument();
    });
  });

  it('shows loading state during sign out', async () => {
    // Make logout take some time
    mockLogout.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<ProfileDropdown user={mockUser} />);

    fireEvent.click(screen.getByText('Test Player'));

    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Sign Out' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('menuitem', { name: 'Sign Out' }));

    await waitFor(() => {
      expect(screen.getByText('Signing out...')).toBeInTheDocument();
    });
  });

  it('has correct aria attributes', () => {
    render(<ProfileDropdown user={mockUser} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-haspopup', 'true');
  });

  it('updates aria-expanded when dropdown is open', async () => {
    render(<ProfileDropdown user={mockUser} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
