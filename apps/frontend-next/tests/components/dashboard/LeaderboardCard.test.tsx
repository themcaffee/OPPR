import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import type { Player } from '@opprs/rest-api-client';

describe('LeaderboardCard', () => {
  const mockPlayers: Player[] = [
    {
      id: 'p1',
      externalId: null,
      name: 'Alice',
      rating: 1800,
      ratingDeviation: 50,
      ranking: 1,
      isRated: true,
      eventCount: 20,
      lastRatingUpdate: null,
      lastEventDate: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'p2',
      externalId: null,
      name: 'Bob',
      rating: 1750,
      ratingDeviation: 60,
      ranking: 2,
      isRated: true,
      eventCount: 15,
      lastRatingUpdate: null,
      lastEventDate: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  it('renders leaderboard title', () => {
    render(<LeaderboardCard players={mockPlayers} />);

    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('shows all players', () => {
    render(<LeaderboardCard players={mockPlayers} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('highlights current user in the list', () => {
    render(<LeaderboardCard players={mockPlayers} currentPlayerId="p1" />);

    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('shows empty state when no players', () => {
    render(<LeaderboardCard players={[]} />);

    expect(screen.getByText('No players ranked yet.')).toBeInTheDocument();
  });

  it('displays both ranking and rating values', () => {
    render(<LeaderboardCard players={mockPlayers} />);

    // Rankings
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    // Ratings
    expect(screen.getByText('1800')).toBeInTheDocument();
    expect(screen.getByText('1750')).toBeInTheDocument();
  });

  it('shows Unknown Player for null names', () => {
    const playersWithNullName: Player[] = [
      {
        ...mockPlayers[0],
        name: null,
      },
    ];

    render(<LeaderboardCard players={playersWithNullName} />);

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });
});
