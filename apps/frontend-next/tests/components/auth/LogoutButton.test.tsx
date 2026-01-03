import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LogoutButton } from '@/components/auth/LogoutButton';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockLogout = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    logout: (...args: unknown[]) => mockLogout(...args),
  },
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Sign Out button', () => {
    render(<LogoutButton />);

    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls apiClient.logout on click', async () => {
    mockLogout.mockResolvedValue(undefined);

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('redirects to /sign-in after logout', async () => {
    mockLogout.mockResolvedValue(undefined);

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-in');
    });
  });

  it('redirects to /sign-in even if logout fails', async () => {
    mockLogout.mockRejectedValue(new Error('Logout failed'));

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-in');
    });
  });

  it('shows loading state during logout', async () => {
    let resolveLogout: () => void;
    mockLogout.mockReturnValue(
      new Promise((resolve) => {
        resolveLogout = () => resolve(undefined);
      })
    );

    render(<LogoutButton />);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });

    resolveLogout!();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });
});
