import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerStatsCard } from '@/components/dashboard/PlayerStatsCard';

describe('PlayerStatsCard', () => {
  const mockStats = {
    totalEvents: 24,
    averagePosition: 8.3,
    averageEfficiency: 85.5,
    firstPlaceFinishes: 3,
    topThreeFinishes: 12,
    bestFinish: 1,
  };

  it('renders all stats correctly', () => {
    render(<PlayerStatsCard stats={mockStats} />);

    expect(screen.getByText('Performance Stats')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('Events Played')).toBeInTheDocument();
    expect(screen.getByText('8.3')).toBeInTheDocument();
    expect(screen.getByText('Avg Position')).toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument();
    expect(screen.getByText('Efficiency')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1st Place Wins')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Top 3 Finishes')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Best Finish')).toBeInTheDocument();
  });

  it('shows dash for best finish when zero', () => {
    render(
      <PlayerStatsCard
        stats={{
          ...mockStats,
          bestFinish: 0,
        }}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('formats average position with one decimal', () => {
    render(
      <PlayerStatsCard
        stats={{
          ...mockStats,
          averagePosition: 5.789,
        }}
      />
    );

    expect(screen.getByText('5.8')).toBeInTheDocument();
  });
});
