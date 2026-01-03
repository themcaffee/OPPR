import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RankingCard } from '@/components/dashboard/RankingCard';

describe('RankingCard', () => {
  it('renders ranking position with hash prefix', () => {
    render(<RankingCard ranking={42} totalDecayedPoints={1234.5} />);

    expect(screen.getByText('#42')).toBeInTheDocument();
    expect(screen.getByText('World Ranking')).toBeInTheDocument();
    expect(screen.getByText('1234.5 points')).toBeInTheDocument();
  });

  it('shows Unranked when ranking is null', () => {
    render(<RankingCard ranking={null} totalDecayedPoints={0} />);

    expect(screen.getByText('Unranked')).toBeInTheDocument();
  });

  it('formats points with one decimal place', () => {
    render(<RankingCard ranking={1} totalDecayedPoints={999.123} />);

    expect(screen.getByText('999.1 points')).toBeInTheDocument();
  });

  it('shows zero points correctly', () => {
    render(<RankingCard ranking={100} totalDecayedPoints={0} />);

    expect(screen.getByText('0.0 points')).toBeInTheDocument();
  });
});
