import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeaderboardCard } from '@/components/dashboard/LeaderboardCard';
import type { Player } from '@opprs/rest-api-client';

describe('LeaderboardCard', () => {
  const mockRankingPlayers: Player[] = [
    {
      id: 'p1',
      externalId: null,
      name: 'Alice',
      email: 'alice@example.com',
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
      email: 'bob@example.com',
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

  const mockRatingPlayers: Player[] = [
    {
      id: 'p3',
      externalId: null,
      name: 'Charlie',
      email: 'charlie@example.com',
      rating: 1900,
      ratingDeviation: 40,
      ranking: 3,
      isRated: true,
      eventCount: 25,
      lastRatingUpdate: null,
      lastEventDate: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  it('renders leaderboard title', () => {
    render(
      <LeaderboardCard
        rankingPlayers={mockRankingPlayers}
        ratingPlayers={mockRatingPlayers}
      />
    );

    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
  });

  it('shows ranking view by default', () => {
    render(
      <LeaderboardCard
        rankingPlayers={mockRankingPlayers}
        ratingPlayers={mockRatingPlayers}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('switches to rating view when clicking Rating button', () => {
    render(
      <LeaderboardCard
        rankingPlayers={mockRankingPlayers}
        ratingPlayers={mockRatingPlayers}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Rating' }));

    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('highlights current user in the list', () => {
    render(
      <LeaderboardCard
        rankingPlayers={mockRankingPlayers}
        ratingPlayers={mockRatingPlayers}
        currentPlayerId="p1"
      />
    );

    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('shows empty state when no players', () => {
    render(
      <LeaderboardCard rankingPlayers={[]} ratingPlayers={[]} />
    );

    expect(screen.getByText('No players ranked yet.')).toBeInTheDocument();
  });

  it('displays ranking values in ranking view', () => {
    render(
      <LeaderboardCard
        rankingPlayers={mockRankingPlayers}
        ratingPlayers={mockRatingPlayers}
      />
    );

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('displays rating values in rating view', () => {
    render(
      <LeaderboardCard
        rankingPlayers={mockRankingPlayers}
        ratingPlayers={mockRatingPlayers}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Rating' }));

    expect(screen.getByText('1900')).toBeInTheDocument();
  });

  it('shows Unknown Player for null names', () => {
    const playersWithNullName: Player[] = [
      {
        ...mockRankingPlayers[0],
        name: null,
      },
    ];

    render(
      <LeaderboardCard
        rankingPlayers={playersWithNullName}
        ratingPlayers={[]}
      />
    );

    expect(screen.getByText('Unknown Player')).toBeInTheDocument();
  });
});
