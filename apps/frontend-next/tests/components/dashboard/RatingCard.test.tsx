import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingCard } from '@/components/dashboard/RatingCard';

describe('RatingCard', () => {
  it('renders rating value', () => {
    render(
      <RatingCard
        rating={1850}
        ratingDeviation={50}
        isRated={true}
        eventCount={10}
      />
    );

    expect(screen.getByText('1850')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('RD: 50')).toBeInTheDocument();
  });

  it('shows rated player badge when isRated is true', () => {
    render(
      <RatingCard
        rating={1500}
        ratingDeviation={100}
        isRated={true}
        eventCount={5}
      />
    );

    expect(screen.getByText('Rated Player')).toBeInTheDocument();
  });

  it('shows events until rated message when not rated', () => {
    render(
      <RatingCard
        rating={1500}
        ratingDeviation={200}
        isRated={false}
        eventCount={2}
      />
    );

    expect(screen.getByText('3 events until rated')).toBeInTheDocument();
  });

  it('shows singular event message when 1 event remaining', () => {
    render(
      <RatingCard
        rating={1500}
        ratingDeviation={150}
        isRated={false}
        eventCount={4}
      />
    );

    expect(screen.getByText('1 event until rated')).toBeInTheDocument();
  });

  it('rounds rating to nearest integer', () => {
    render(
      <RatingCard
        rating={1523.7}
        ratingDeviation={75.3}
        isRated={true}
        eventCount={8}
      />
    );

    expect(screen.getByText('1524')).toBeInTheDocument();
    expect(screen.getByText('RD: 75')).toBeInTheDocument();
  });
});
