import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentResultsTable } from '@/components/dashboard/RecentResultsTable';
import type { PlayerResult } from '@opprs/rest-api-client';

describe('RecentResultsTable', () => {
  const mockResults: PlayerResult[] = [
    {
      id: '1',
      position: 1,
      optedOut: false,
      linearPoints: 10,
      dynamicPoints: 90,
      totalPoints: 100,
      ageInDays: 30,
      decayMultiplier: 1.0,
      decayedPoints: 100,
      efficiency: 100,
      tournament: {
        id: 't1',
        name: 'State Championship',
        date: '2024-12-15',
        location: 'Portland',
        eventBooster: 'MAJOR',
      },
    },
    {
      id: '2',
      position: 3,
      optedOut: false,
      linearPoints: 5,
      dynamicPoints: 45,
      totalPoints: 50,
      ageInDays: 400,
      decayMultiplier: 0.75,
      decayedPoints: 37.5,
      efficiency: 85,
      tournament: {
        id: 't2',
        name: 'Weekly Tournament',
        date: '2024-12-08',
        location: 'Seattle',
        eventBooster: 'NONE',
      },
    },
  ];

  it('renders table with results', () => {
    render(<RecentResultsTable results={mockResults} />);

    expect(screen.getByText('Recent Results')).toBeInTheDocument();
    expect(screen.getByText('State Championship')).toBeInTheDocument();
    expect(screen.getByText('Weekly Tournament')).toBeInTheDocument();
  });

  it('shows empty state when no results', () => {
    render(<RecentResultsTable results={[]} />);

    expect(screen.getByText('No tournament results yet.')).toBeInTheDocument();
  });

  it('displays position correctly', () => {
    render(<RecentResultsTable results={mockResults} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays points with one decimal', () => {
    render(<RecentResultsTable results={mockResults} />);

    // 100.0 appears twice (totalPoints and decayedPoints for first result)
    const hundredPoints = screen.getAllByText('100.0');
    expect(hundredPoints).toHaveLength(2);
    expect(screen.getByText('50.0')).toBeInTheDocument();
  });

  it('displays decayed points', () => {
    render(<RecentResultsTable results={mockResults} />);

    expect(screen.getByText('37.5')).toBeInTheDocument();
  });

  it('shows event booster badge for major events', () => {
    render(<RecentResultsTable results={mockResults} />);

    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<RecentResultsTable results={mockResults} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Tournament')).toBeInTheDocument();
    expect(screen.getByText('Pos')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('Decayed')).toBeInTheDocument();
  });
});
