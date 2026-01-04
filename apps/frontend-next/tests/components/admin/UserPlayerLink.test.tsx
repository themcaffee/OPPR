import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserPlayerLink } from '@/components/admin/UserPlayerLink';
import { createMockUser, createMockPlayer, createMockPaginatedResponse } from '../../mocks/data-factories';

const mockUsersLinkPlayer = vi.fn();
const mockUsersUnlinkPlayer = vi.fn();
const mockPlayersList = vi.fn();
const mockPlayersSearch = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    users: {
      linkPlayer: (...args: unknown[]) => mockUsersLinkPlayer(...args),
      unlinkPlayer: (...args: unknown[]) => mockUsersUnlinkPlayer(...args),
    },
    players: {
      list: (...args: unknown[]) => mockPlayersList(...args),
      search: (...args: unknown[]) => mockPlayersSearch(...args),
    },
  },
}));

describe('UserPlayerLink', () => {
  const mockPlayer = createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Smith' });
  const mockUserWithPlayer = createMockUser({
    id: 'user-1',
    player: mockPlayer,
  });
  const mockUserWithoutPlayer = createMockUser({
    id: 'user-2',
    player: null,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse([mockPlayer]));
    mockPlayersSearch.mockResolvedValue([]);
  });

  it('shows player name when user has linked player', () => {
    const onUpdate = vi.fn();
    render(<UserPlayerLink user={mockUserWithPlayer} onUpdate={onUpdate} />);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('shows "Link Player" button when user has no linked player', () => {
    const onUpdate = vi.fn();
    render(<UserPlayerLink user={mockUserWithoutPlayer} onUpdate={onUpdate} />);

    expect(screen.getByRole('button', { name: /link player/i })).toBeInTheDocument();
  });

  it('shows Change and Unlink buttons for linked player', () => {
    const onUpdate = vi.fn();
    render(<UserPlayerLink user={mockUserWithPlayer} onUpdate={onUpdate} />);

    expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unlink/i })).toBeInTheDocument();
  });

  it('opens PlayerSelector when Link Player clicked', () => {
    const onUpdate = vi.fn();
    render(<UserPlayerLink user={mockUserWithoutPlayer} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /link player/i }));

    expect(screen.getByPlaceholderText(/search for a player/i)).toBeInTheDocument();
  });

  it('opens PlayerSelector when Change clicked', () => {
    const onUpdate = vi.fn();
    render(<UserPlayerLink user={mockUserWithPlayer} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /change/i }));

    expect(screen.getByPlaceholderText(/search for a player/i)).toBeInTheDocument();
  });

  it('calls apiClient.users.unlinkPlayer when Unlink clicked', async () => {
    const onUpdate = vi.fn();
    mockUsersUnlinkPlayer.mockResolvedValue({});

    render(<UserPlayerLink user={mockUserWithPlayer} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /unlink/i }));

    await waitFor(() => {
      expect(mockUsersUnlinkPlayer).toHaveBeenCalledWith('user-1');
    });
  });

  it('calls onUpdate after unlinking player', async () => {
    const onUpdate = vi.fn();
    mockUsersUnlinkPlayer.mockResolvedValue({});

    render(<UserPlayerLink user={mockUserWithPlayer} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /unlink/i }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('shows Cancel button in edit mode', () => {
    const onUpdate = vi.fn();
    render(<UserPlayerLink user={mockUserWithPlayer} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /change/i }));

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('closes editor when Cancel clicked', () => {
    const onUpdate = vi.fn();
    render(<UserPlayerLink user={mockUserWithPlayer} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /change/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByPlaceholderText(/search for a player/i)).not.toBeInTheDocument();
  });

  it('calls apiClient.users.linkPlayer when selecting a player', async () => {
    const onUpdate = vi.fn();
    const newPlayer = createMockPlayer({ id: 'p2', firstName: 'Bob', lastName: 'Jones' });
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse([newPlayer]));
    mockUsersLinkPlayer.mockResolvedValue({});

    render(<UserPlayerLink user={mockUserWithoutPlayer} onUpdate={onUpdate} />);

    // Click link player
    fireEvent.click(screen.getByRole('button', { name: /link player/i }));

    // Wait for players to load
    await waitFor(() => {
      expect(mockPlayersList).toHaveBeenCalled();
    });

    // Open dropdown and select
    const input = screen.getByPlaceholderText(/search for a player/i);
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Bob Jones'));

    await waitFor(() => {
      expect(mockUsersLinkPlayer).toHaveBeenCalledWith('user-2', 'p2');
    });
  });

  it('calls onUpdate after linking player', async () => {
    const onUpdate = vi.fn();
    const newPlayer = createMockPlayer({ id: 'p2', firstName: 'Bob', lastName: 'Jones' });
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse([newPlayer]));
    mockUsersLinkPlayer.mockResolvedValue({});

    render(<UserPlayerLink user={mockUserWithoutPlayer} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /link player/i }));

    await waitFor(() => {
      expect(mockPlayersList).toHaveBeenCalled();
    });

    const input = screen.getByPlaceholderText(/search for a player/i);
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Bob Jones'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });
});
