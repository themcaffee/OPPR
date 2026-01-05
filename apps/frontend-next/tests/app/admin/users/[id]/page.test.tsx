import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUserEditPage from '@/app/(admin)/admin/users/[id]/page';
import {
  createMockUser,
  createMockPlayer,
  createMockPaginatedResponse,
} from '@tests/mocks/data-factories';

const mockPush = vi.fn();
const mockBack = vi.fn();
let mockParamsId = 'user-123';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useParams: () => ({ id: mockParamsId }),
}));

const mockUsersGet = vi.fn();
const mockUsersUpdate = vi.fn();
const mockUsersDelete = vi.fn();
const mockPlayersList = vi.fn();
const mockPlayersGet = vi.fn();
const mockPlayersSearch = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    users: {
      get: (...args: unknown[]) => mockUsersGet(...args),
      update: (...args: unknown[]) => mockUsersUpdate(...args),
      delete: (...args: unknown[]) => mockUsersDelete(...args),
    },
    players: {
      list: (...args: unknown[]) => mockPlayersList(...args),
      get: (...args: unknown[]) => mockPlayersGet(...args),
      search: (...args: unknown[]) => mockPlayersSearch(...args),
    },
  },
}));

describe('AdminUserEditPage', () => {
  const mockUser = createMockUser({
    id: 'user-123',
    email: 'test@example.com',
    role: 'USER',
    player: null,
    playerId: null,
  });

  const mockUserWithPlayer = createMockUser({
    id: 'user-456',
    email: 'linked@example.com',
    role: 'ADMIN',
    playerId: 'player-1',
    player: {
      id: 'player-1',
      name: 'Test Player',
      rating: 1500,
      ratingDeviation: 200,
      ranking: 10,
      isRated: true,
      eventCount: 5,
    },
  });

  const mockPlayer = createMockPlayer({
    id: 'player-1',
    name: 'Test Player',
    rating: 1500,
    ranking: 10,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockParamsId = 'user-123';
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse([]));
    mockPlayersSearch.mockResolvedValue([]);
  });

  describe('Page Rendering', () => {
    it('renders loading state initially', () => {
      mockUsersGet.mockReturnValue(new Promise(() => {}));
      render(<AdminUserEditPage />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders user details after loading', async () => {
      mockUsersGet.mockResolvedValue(mockUser);
      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument();
      });

      expect(screen.getByText('test@example.com')).toBeInTheDocument();

      // Wait for form to be reset with user data
      await waitFor(() => {
        expect(screen.getByLabelText('Role')).toHaveValue('USER');
      });
    });

    it('renders user with linked player', async () => {
      mockParamsId = 'user-456';
      mockUsersGet.mockResolvedValue(mockUserWithPlayer);
      mockPlayersGet.mockResolvedValue(mockPlayer);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByText('linked@example.com')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });
    });

    it('renders error state when loading fails', async () => {
      mockUsersGet.mockRejectedValue(new Error('Not found'));
      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load user')).toBeInTheDocument();
      });
    });

    it('displays email cannot be changed message', async () => {
      mockUsersGet.mockResolvedValue(mockUser);
      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Email cannot be changed')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with updated role', async () => {
      mockUsersGet.mockResolvedValue(mockUser);
      mockUsersUpdate.mockResolvedValue(mockUser);

      render(<AdminUserEditPage />);

      // Wait for form to be loaded and reset with user data
      await waitFor(() => {
        expect(screen.getByLabelText('Role')).toHaveValue('USER');
      });

      fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'ADMIN' } });
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(mockUsersUpdate).toHaveBeenCalledWith('user-123', {
          role: 'ADMIN',
          playerId: null,
        });
      });
    });

    it('submits form with password when provided', async () => {
      mockUsersGet.mockResolvedValue(mockUser);
      mockUsersUpdate.mockResolvedValue(mockUser);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/New Password/i), {
        target: { value: 'newpassword123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(mockUsersUpdate).toHaveBeenCalledWith('user-123', {
          role: 'USER',
          playerId: null,
          password: 'newpassword123',
        });
      });
    });

    it('navigates to users list on successful save', async () => {
      mockUsersGet.mockResolvedValue(mockUser);
      mockUsersUpdate.mockResolvedValue(mockUser);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/users');
      });
    });

    it('displays error message on save failure', async () => {
      mockUsersGet.mockResolvedValue(mockUser);
      mockUsersUpdate.mockRejectedValue(new Error('Update failed'));

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });
  });

  describe('Player Selection', () => {
    it('shows player selector for linking', async () => {
      mockUsersGet.mockResolvedValue(mockUser);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search for a player/i)).toBeInTheDocument();
      });
    });

    it('allows selecting a player', async () => {
      mockUsersGet.mockResolvedValue(mockUser);
      mockUsersUpdate.mockResolvedValue(mockUser);
      mockPlayersList.mockResolvedValue(createMockPaginatedResponse([mockPlayer]));

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search for a player/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/search for a player/i);
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Player'));

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(mockUsersUpdate).toHaveBeenCalledWith(
          'user-123',
          expect.objectContaining({
            playerId: 'player-1',
          })
        );
      });
    });

    it('allows clearing linked player', async () => {
      mockParamsId = 'user-456';
      mockUsersGet.mockResolvedValue(mockUserWithPlayer);
      mockUsersUpdate.mockResolvedValue(mockUserWithPlayer);
      mockPlayersGet.mockResolvedValue(mockPlayer);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Player')).toBeInTheDocument();
      });

      // Find and click clear button (the X button next to the player name)
      const container = screen.getByText('Test Player').closest('div')?.parentElement;
      const clearButton = container?.querySelector('button');
      expect(clearButton).toBeTruthy();
      fireEvent.click(clearButton!);

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(mockUsersUpdate).toHaveBeenCalledWith(
          'user-456',
          expect.objectContaining({
            playerId: null,
          })
        );
      });
    });
  });

  describe('Delete User', () => {
    it('shows delete confirmation dialog', async () => {
      mockUsersGet.mockResolvedValue(mockUser);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete User/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Delete User/i }));

      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    });

    it('deletes user and navigates on confirm', async () => {
      mockUsersGet.mockResolvedValue(mockUser);
      mockUsersDelete.mockResolvedValue({});

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete User/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Delete User/i }));

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockUsersDelete).toHaveBeenCalledWith('user-123');
        expect(mockPush).toHaveBeenCalledWith('/admin/users');
      });
    });

    it('closes delete dialog on cancel', async () => {
      mockUsersGet.mockResolvedValue(mockUser);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Delete User/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Delete User/i }));

      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      });

      // Find the Cancel button in the delete dialog - it's the last one
      const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
      const dialogCancelButton = cancelButtons[cancelButtons.length - 1];
      fireEvent.click(dialogCancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Are you sure you want to delete/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back on Cancel click', async () => {
      mockUsersGet.mockResolvedValue(mockUser);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
      });

      // The Cancel button next to Save Changes in the form footer
      const saveButton = screen.getByRole('button', { name: /Save Changes/i });
      const formActions = saveButton.closest('div');
      const cancelButton = formActions?.querySelector('button[type="button"]');
      expect(cancelButton).toBeTruthy();
      fireEvent.click(cancelButton!);

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('Password Field', () => {
    it('shows password hint text', async () => {
      mockUsersGet.mockResolvedValue(mockUser);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Leave blank to keep current password/i)
        ).toBeInTheDocument();
      });
    });

    it('does not include empty password in request', async () => {
      mockUsersGet.mockResolvedValue(mockUser);
      mockUsersUpdate.mockResolvedValue(mockUser);

      render(<AdminUserEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(mockUsersUpdate).toHaveBeenCalledWith('user-123', {
          role: 'USER',
          playerId: null,
        });
      });

      // Verify password was NOT included
      const callArgs = mockUsersUpdate.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('password');
    });
  });
});
