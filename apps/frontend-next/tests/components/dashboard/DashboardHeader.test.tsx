import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('DashboardHeader', () => {
  it('renders the OPPRS logo link', () => {
    render(<DashboardHeader />);

    const logoLink = screen.getByRole('link', { name: 'OPPRS' });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders Home link', () => {
    render(<DashboardHeader />);

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders Sign Out button', () => {
    render(<DashboardHeader />);

    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
  });

  it('displays player name when provided', () => {
    render(<DashboardHeader playerName="John Doe" />);

    expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument();
  });

  it('does not display welcome message when playerName is null', () => {
    render(<DashboardHeader playerName={null} />);

    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  it('does not display welcome message when playerName is undefined', () => {
    render(<DashboardHeader />);

    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });
});
