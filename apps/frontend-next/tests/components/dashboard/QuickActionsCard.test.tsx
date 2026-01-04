import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';

describe('QuickActionsCard', () => {
  it('renders the title', () => {
    render(<QuickActionsCard />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('renders View My Results link', () => {
    render(<QuickActionsCard />);

    const link = screen.getByRole('link', { name: 'View My Results' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/profile/results');
  });

  it('renders Find Tournaments link', () => {
    render(<QuickActionsCard />);

    const link = screen.getByRole('link', { name: 'Find Tournaments' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/profile/tournaments');
  });

  it('renders Update Profile link', () => {
    render(<QuickActionsCard />);

    const link = screen.getByRole('link', { name: 'Update Profile' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/profile/settings');
  });
});
