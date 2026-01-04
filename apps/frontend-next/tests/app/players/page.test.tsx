import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlayersPage from '@/app/(public)/players/page';
import { createMockPlayer, createMockPaginatedResponse } from '../../mocks/data-factories';
import type { Player } from '@opprs/rest-api-client';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockPlayersList = vi.fn();
const mockPlayersSearch = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    players: {
      list: (...args: unknown[]) => mockPlayersList(...args),
      search: (...args: unknown[]) => mockPlayersSearch(...args),
    },
  },
}));

describe('PlayersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockPlayersList.mockImplementation(() => new Promise(() => {}));
    render(<PlayersPage />);

    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('Browse all players and view their profiles.')).toBeInTheDocument();
    // Check for skeleton loading
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders player list after loading', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Champion', rating: 1850, ranking: 1, isRated: true, eventCount: 25 }),
      createMockPlayer({ id: 'p2', firstName: 'Bob', lastName: 'Wizard', rating: 1750, ranking: 2, isRated: true, eventCount: 20 }),
      createMockPlayer({ id: 'p3', firstName: 'Charlie', lastName: 'Newbie', rating: 1500, ranking: null, isRated: false, eventCount: 3 }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 1, 3));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Champion')).toBeInTheDocument();
    });

    expect(screen.getByText('Bob Wizard')).toBeInTheDocument();
    expect(screen.getByText('Charlie Newbie')).toBeInTheDocument();
  });

  it('displays rated badge for rated players', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Rated', lastName: 'Player', isRated: true }),
      createMockPlayer({ id: 'p2', firstName: 'Unrated', lastName: 'Player', isRated: false }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 1, 2));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Rated Player')).toBeInTheDocument();
    });

    // Should have exactly one "Rated" badge
    const ratedBadges = screen.getAllByText('Rated');
    expect(ratedBadges).toHaveLength(1);
  });

  it('displays rating and ranking values', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Test', lastName: 'Player', rating: 1850, ranking: 5, eventCount: 15 }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 1, 1));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    expect(screen.getByText('1850')).toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('displays dash for null ranking', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Unranked', lastName: 'Player', ranking: null }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 1, 1));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Unranked Player')).toBeInTheDocument();
    });

    const rankCell = screen.getByText('-');
    expect(rankCell).toBeInTheDocument();
  });

  it('displays error state when API fails', async () => {
    mockPlayersList.mockRejectedValue(new Error('Network error'));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load players')).toBeInTheDocument();
    });
  });

  it('displays empty state when no players', async () => {
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse([], 1, 1, 0));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('No players yet.')).toBeInTheDocument();
    });
  });

  it('handles search form submission', async () => {
    const allPlayers: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Champion' }),
      createMockPlayer({ id: 'p2', firstName: 'Bob', lastName: 'Wizard' }),
    ];
    const searchResults: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Champion' }),
    ];

    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(allPlayers, 1, 1, 2));
    mockPlayersSearch.mockResolvedValue(searchResults);

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Champion')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search players...');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockPlayersSearch).toHaveBeenCalledWith({ q: 'Alice', limit: 50 });
    });
  });

  it('shows clear button when search is active', async () => {
    const allPlayers: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Champion' }),
    ];
    const searchResults: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Champion' }),
    ];

    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(allPlayers, 1, 1, 1));
    mockPlayersSearch.mockResolvedValue(searchResults);

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Champion')).toBeInTheDocument();
    });

    // Initially no clear button
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();

    // Perform search
    const searchInput = screen.getByPlaceholderText('Search players...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });
  });

  it('clears search when clear button clicked', async () => {
    const allPlayers: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Champion' }),
      createMockPlayer({ id: 'p2', firstName: 'Bob', lastName: 'Wizard' }),
    ];
    const searchResults: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Champion' }),
    ];

    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(allPlayers, 1, 1, 2));
    mockPlayersSearch.mockResolvedValue(searchResults);

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Champion')).toBeInTheDocument();
    });

    // Perform search
    const searchInput = screen.getByPlaceholderText('Search players...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(mockPlayersSearch).toHaveBeenCalled();
    });

    // Clear search
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    await waitFor(() => {
      // Should have called list again after clearing
      expect(mockPlayersList).toHaveBeenCalledTimes(2);
    });
  });

  it('displays empty search results message', async () => {
    const allPlayers: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Champion' }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(allPlayers, 1, 1, 1));
    mockPlayersSearch.mockResolvedValue([]);

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Champion')).toBeInTheDocument();
    });

    // Perform search with no results
    const searchInput = screen.getByPlaceholderText('Search players...');
    fireEvent.change(searchInput, { target: { value: 'NonexistentPlayer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(screen.getByText('No players found matching your search.')).toBeInTheDocument();
    });
  });

  it('displays pagination controls for multiple pages', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Test', lastName: 'Player' }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 3, 60));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    expect(screen.getByText('Page 1 of 3 (60 players)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  it('handles pagination next button click', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Page 1', lastName: 'Player' }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 3, 60));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3 (60 players)')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(mockPlayersList).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
      });
    });
  });

  it('handles pagination previous button click', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Page 2', lastName: 'Player' }),
    ];
    // Start on page 2
    mockPlayersList
      .mockResolvedValueOnce(createMockPaginatedResponse(players, 1, 3, 60))
      .mockResolvedValueOnce(createMockPaginatedResponse(players, 2, 3, 60))
      .mockResolvedValueOnce(createMockPaginatedResponse(players, 1, 3, 60));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3 (60 players)')).toBeInTheDocument();
    });

    // Go to page 2
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(screen.getByText('Page 2 of 3 (60 players)')).toBeInTheDocument();
    });

    // Go back to page 1
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

    await waitFor(() => {
      expect(mockPlayersList).toHaveBeenLastCalledWith({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
      });
    });
  });

  it('hides pagination when only one page', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Only', lastName: 'Player' }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 1, 1));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Only Player')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('hides pagination during search', async () => {
    const allPlayers: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Alice', lastName: 'Champion' }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(allPlayers, 1, 3, 60));
    mockPlayersSearch.mockResolvedValue(allPlayers);

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    });

    // Perform search
    const searchInput = screen.getByPlaceholderText('Search players...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(mockPlayersSearch).toHaveBeenCalled();
    });

    // Pagination should be hidden during search
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('displays player name properly', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'John', middleInitial: 'A', lastName: 'Doe' }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 1, 1));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('John A. Doe')).toBeInTheDocument();
    });
  });

  it('renders player links with correct href', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'player-abc-123', firstName: 'Linked', lastName: 'Player' }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 1, 1));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Linked Player')).toBeInTheDocument();
    });

    const playerLink = screen.getByRole('link', { name: 'Linked Player' });
    expect(playerLink).toHaveAttribute('href', '/players/player-abc-123');
  });

  it('renders table headers correctly', async () => {
    const players: Player[] = [
      createMockPlayer({ id: 'p1', firstName: 'Test', lastName: 'Player' }),
    ];
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(players, 1, 1, 1));

    render(<PlayersPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });
});
