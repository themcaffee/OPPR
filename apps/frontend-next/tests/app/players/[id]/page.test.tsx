import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PlayerProfilePage from '@/app/(public)/players/[id]/page';
import { createMockPlayer } from '../../../mocks/data-factories';
import type { Player, PlayerStats, PlayerResult } from '@opprs/rest-api-client';

const mockPlayerId = 'player-123';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: mockPlayerId }),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

const mockPlayersGet = vi.fn();
const mockPlayersGetStats = vi.fn();
const mockPlayersGetResults = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    players: {
      get: (...args: unknown[]) => mockPlayersGet(...args),
      getStats: (...args: unknown[]) => mockPlayersGetStats(...args),
      getResults: (...args: unknown[]) => mockPlayersGetResults(...args),
    },
  },
}));

function createMockPlayerStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    totalEvents: 10,
    totalPoints: 500,
    totalDecayedPoints: 450,
    averagePoints: 50,
    averagePosition: 5,
    averageFinish: 5,
    averageEfficiency: 0.75,
    firstPlaceFinishes: 2,
    topThreeFinishes: 5,
    bestFinish: 1,
    highestPoints: 100,
    ...overrides,
  };
}

function createMockPlayerResult(overrides: Partial<PlayerResult> = {}): PlayerResult {
  return {
    id: 'result-1',
    position: 1,
    optedOut: false,
    linearPoints: 10,
    dynamicPoints: 40,
    totalPoints: 50,
    ageInDays: 30,
    decayMultiplier: 1.0,
    decayedPoints: 50,
    efficiency: 0.8,
    tournament: {
      id: 'tour-1',
      name: 'Test Tournament',
      date: '2024-01-15T00:00:00.000Z',
      location: 'Test City',
      eventBooster: 'NONE',
    },
    ...overrides,
  };
}

describe('PlayerProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockPlayersGet.mockImplementation(() => new Promise(() => {}));
    mockPlayersGetStats.mockImplementation(() => new Promise(() => {}));
    mockPlayersGetResults.mockImplementation(() => new Promise(() => {}));

    render(<PlayerProfilePage />);

    // Check for skeleton loading
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders player profile after loading', async () => {
    const player: Player = createMockPlayer({
      id: mockPlayerId,
      name: 'Alice Champion',
      rating: 1850,
      ratingDeviation: 50,
      ranking: 5,
      isRated: true,
      eventCount: 25,
    });
    const stats = createMockPlayerStats();
    const results: PlayerResult[] = [];

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue(results);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Alice Champion')).toBeInTheDocument();
    });
  });

  it('displays rated badge for rated players', async () => {
    const player: Player = createMockPlayer({
      name: 'Rated Player',
      isRated: true,
      eventCount: 10,
    });
    const stats = createMockPlayerStats();

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Rated Player')).toBeInTheDocument();
    });

    expect(screen.getByText('Rated')).toBeInTheDocument();
  });

  it('displays events needed for unrated players', async () => {
    const player: Player = createMockPlayer({
      name: 'New Player',
      isRated: false,
      eventCount: 3,
    });
    const stats = createMockPlayerStats({ totalEvents: 3 });

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('New Player')).toBeInTheDocument();
    });

    expect(screen.getByText('2 more events to rated')).toBeInTheDocument();
  });

  it('displays rating card with correct values', async () => {
    const player: Player = createMockPlayer({
      name: 'Test Player',
      rating: 1850,
      ratingDeviation: 75,
    });
    const stats = createMockPlayerStats();

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    expect(screen.getByText('1850')).toBeInTheDocument();
    expect(screen.getByText('RD: 75')).toBeInTheDocument();
  });

  it('displays ranking card with position', async () => {
    const player: Player = createMockPlayer({
      name: 'Ranked Player',
      ranking: 10,
    });
    const stats = createMockPlayerStats({ totalDecayedPoints: 350.5 });

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Ranked Player')).toBeInTheDocument();
    });

    expect(screen.getByText('#10')).toBeInTheDocument();
    expect(screen.getByText('350.5 pts')).toBeInTheDocument();
  });

  it('displays dash for null ranking', async () => {
    const player: Player = createMockPlayer({
      name: 'Unranked Player',
      ranking: null,
    });
    const stats = createMockPlayerStats();

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Unranked Player')).toBeInTheDocument();
    });

    // Look for the dash in the ranking card specifically
    const rankingCards = screen.getAllByText('-');
    expect(rankingCards.length).toBeGreaterThan(0);
  });

  it('displays event count', async () => {
    const player: Player = createMockPlayer({
      name: 'Active Player',
      eventCount: 42,
    });
    const stats = createMockPlayerStats({ totalEvents: 42 });

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Active Player')).toBeInTheDocument();
    });

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('displays performance stats', async () => {
    const player: Player = createMockPlayer({ name: 'Pro Player', eventCount: 20 });
    const stats = createMockPlayerStats({
      totalEvents: 20,
      firstPlaceFinishes: 7,
      topThreeFinishes: 15,
      bestFinish: 1,
      averageEfficiency: 0.85,
    });

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Performance Stats')).toBeInTheDocument();
    });

    expect(screen.getByText('First Places')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument(); // First place finishes
    expect(screen.getByText('Top 3 Finishes')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Best Finish')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Avg Efficiency')).toBeInTheDocument();
    expect(screen.getByText('85.0%')).toBeInTheDocument();
  });

  it('displays tournament history table', async () => {
    const player: Player = createMockPlayer({ name: 'Tournament Player' });
    const stats = createMockPlayerStats();
    const results: PlayerResult[] = [
      createMockPlayerResult({
        id: 'r1',
        position: 1,
        totalPoints: 100,
        decayedPoints: 100,
        decayMultiplier: 1.0,
        tournament: {
          id: 't1',
          name: 'Championship 2024',
          date: '2024-06-15T00:00:00.000Z',
          location: 'Las Vegas',
          eventBooster: 'MAJOR',
        },
      }),
      createMockPlayerResult({
        id: 'r2',
        position: 3,
        totalPoints: 50,
        decayedPoints: 37.5,
        decayMultiplier: 0.75,
        tournament: {
          id: 't2',
          name: 'Regional Event',
          date: '2023-06-15T00:00:00.000Z',
          location: 'Portland',
          eventBooster: 'NONE',
        },
      }),
    ];

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue(results);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Tournament History (2 events)')).toBeInTheDocument();
    });

    expect(screen.getByText('Championship 2024')).toBeInTheDocument();
    expect(screen.getByText('Regional Event')).toBeInTheDocument();
    expect(screen.getByText('Las Vegas')).toBeInTheDocument();
    expect(screen.getByText('Portland')).toBeInTheDocument();
  });

  it('displays event booster badges in tournament history', async () => {
    const player: Player = createMockPlayer({ name: 'Test Player' });
    const stats = createMockPlayerStats();
    const results: PlayerResult[] = [
      createMockPlayerResult({
        tournament: {
          id: 't1',
          name: 'Major Event',
          date: '2024-01-15T00:00:00.000Z',
          location: null,
          eventBooster: 'MAJOR',
        },
      }),
      createMockPlayerResult({
        id: 'r2',
        tournament: {
          id: 't2',
          name: 'Certified Event',
          date: '2024-01-14T00:00:00.000Z',
          location: null,
          eventBooster: 'CERTIFIED',
        },
      }),
    ];

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue(results);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Major Event')).toBeInTheDocument();
    });

    expect(screen.getByText('M')).toBeInTheDocument(); // Major badge
    expect(screen.getByText('C')).toBeInTheDocument(); // Certified badge
  });

  it('displays decay multiplier in tournament history', async () => {
    const player: Player = createMockPlayer({ name: 'Test Player' });
    const stats = createMockPlayerStats();
    const results: PlayerResult[] = [
      createMockPlayerResult({
        totalPoints: 100,
        decayedPoints: 75,
        decayMultiplier: 0.75,
        tournament: {
          id: 't1',
          name: 'Decayed Event',
          date: '2023-01-15T00:00:00.000Z',
          location: null,
          eventBooster: 'NONE',
        },
      }),
    ];

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue(results);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Decayed Event')).toBeInTheDocument();
    });

    expect(screen.getByText('100.00')).toBeInTheDocument();
    expect(screen.getByText('75.00')).toBeInTheDocument();
    expect(screen.getByText('(75%)')).toBeInTheDocument();
  });

  it('displays empty tournament history message', async () => {
    const player: Player = createMockPlayer({ name: 'New Player' });
    const stats = createMockPlayerStats({ totalEvents: 0 });

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('New Player')).toBeInTheDocument();
    });

    expect(screen.getByText('Tournament History (0 events)')).toBeInTheDocument();
    expect(screen.getByText('No tournament results yet.')).toBeInTheDocument();
  });

  it('displays error state when API fails', async () => {
    mockPlayersGet.mockRejectedValue(new Error('Player not found'));
    mockPlayersGetStats.mockRejectedValue(new Error('Stats not found'));
    mockPlayersGetResults.mockRejectedValue(new Error('Results not found'));

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load player')).toBeInTheDocument();
    });

    expect(screen.getByText('← Back to players')).toBeInTheDocument();
  });

  it('displays Unknown Player for null name', async () => {
    const player: Player = createMockPlayer({ name: null });
    const stats = createMockPlayerStats();

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Unknown Player')).toBeInTheDocument();
    });
  });

  it('renders back link to players list', async () => {
    const player: Player = createMockPlayer({ name: 'Test Player' });
    const stats = createMockPlayerStats();

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Player')).toBeInTheDocument();
    });

    const backLink = screen.getByRole('link', { name: '← Back to players' });
    expect(backLink).toHaveAttribute('href', '/players');
  });

  it('renders tournament links in history', async () => {
    const player: Player = createMockPlayer({ name: 'Test Player' });
    const stats = createMockPlayerStats();
    const results: PlayerResult[] = [
      createMockPlayerResult({
        tournament: {
          id: 'tour-abc-123',
          name: 'Linked Tournament',
          date: '2024-01-15T00:00:00.000Z',
          location: null,
          eventBooster: 'NONE',
        },
      }),
    ];

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue(results);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Linked Tournament')).toBeInTheDocument();
    });

    const tournamentLink = screen.getByRole('link', { name: 'Linked Tournament' });
    expect(tournamentLink).toHaveAttribute('href', '/tournaments/tour-abc-123');
  });

  it('hides performance stats section when no events', async () => {
    const player: Player = createMockPlayer({ name: 'No Events Player' });
    const stats = createMockPlayerStats({ totalEvents: 0 });

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('No Events Player')).toBeInTheDocument();
    });

    expect(screen.queryByText('Performance Stats')).not.toBeInTheDocument();
  });

  it('calls API with correct player ID', async () => {
    const player: Player = createMockPlayer({ name: 'Test Player' });
    const stats = createMockPlayerStats();

    mockPlayersGet.mockResolvedValue(player);
    mockPlayersGetStats.mockResolvedValue(stats);
    mockPlayersGetResults.mockResolvedValue([]);

    render(<PlayerProfilePage />);

    await waitFor(() => {
      expect(mockPlayersGet).toHaveBeenCalledWith(mockPlayerId);
    });

    expect(mockPlayersGetStats).toHaveBeenCalledWith(mockPlayerId);
    expect(mockPlayersGetResults).toHaveBeenCalledWith(mockPlayerId);
  });
});
