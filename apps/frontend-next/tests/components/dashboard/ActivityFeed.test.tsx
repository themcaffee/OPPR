import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import type { Tournament } from '@opprs/rest-api-client';

describe('ActivityFeed', () => {
  const mockTournaments: Tournament[] = [
    {
      id: 't1',
      externalId: null,
      name: 'Winter Classic',
      location: 'Portland, OR',
      date: '2024-12-20',
      tgpConfig: null,
      eventBooster: 'CERTIFIED',
      allowsOptOut: false,
      baseValue: 20,
      tvaRating: 10,
      tvaRanking: 15,
      totalTVA: 25,
      tgp: 100,
      eventBoosterMultiplier: 1.25,
      firstPlaceValue: 50,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 't2',
      externalId: null,
      name: 'Holiday Bash',
      location: null,
      date: '2024-12-25',
      tgpConfig: null,
      eventBooster: 'NONE',
      allowsOptOut: false,
      baseValue: 15,
      tvaRating: 5,
      tvaRanking: 10,
      totalTVA: 15,
      tgp: 80,
      eventBoosterMultiplier: 1.0,
      firstPlaceValue: 30,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  it('renders the title', () => {
    render(<ActivityFeed recentTournaments={mockTournaments} />);

    expect(screen.getByText('Recent Tournaments')).toBeInTheDocument();
  });

  it('displays tournament names', () => {
    render(<ActivityFeed recentTournaments={mockTournaments} />);

    expect(screen.getByText('Winter Classic')).toBeInTheDocument();
    expect(screen.getByText('Holiday Bash')).toBeInTheDocument();
  });

  it('shows location when available', () => {
    render(<ActivityFeed recentTournaments={mockTournaments} />);

    expect(screen.getByText('Portland, OR')).toBeInTheDocument();
  });

  it('shows empty state when no tournaments', () => {
    render(<ActivityFeed recentTournaments={[]} />);

    expect(screen.getByText('No recent tournaments.')).toBeInTheDocument();
  });

  it('shows event booster label for certified events', () => {
    render(<ActivityFeed recentTournaments={mockTournaments} />);

    expect(screen.getByText('Certified')).toBeInTheDocument();
  });

  it('does not show event booster for NONE events', () => {
    render(<ActivityFeed recentTournaments={[mockTournaments[1]]} />);

    expect(screen.queryByText('Certified')).not.toBeInTheDocument();
  });
});
