import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

let mockPathname = '/admin';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('AdminSidebar', () => {
  beforeEach(() => {
    mockPathname = '/admin';
  });

  it('renders Dashboard link', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders Players link', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: 'Players' })).toBeInTheDocument();
  });

  it('renders Tournaments link', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: 'Tournaments' })).toBeInTheDocument();
  });

  it('renders Users link', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
  });

  it('has correct href for Dashboard link', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/admin');
  });

  it('has correct href for Players link', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: 'Players' })).toHaveAttribute('href', '/admin/players');
  });

  it('has correct href for Tournaments link', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: 'Tournaments' })).toHaveAttribute(
      'href',
      '/admin/tournaments'
    );
  });

  it('has correct href for Users link', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/admin/users');
  });

  it('highlights Dashboard when on /admin', () => {
    mockPathname = '/admin';
    render(<AdminSidebar />);

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveClass('bg-blue-600');
  });

  it('highlights Players when on /admin/players', () => {
    mockPathname = '/admin/players';
    render(<AdminSidebar />);

    const playersLink = screen.getByRole('link', { name: 'Players' });
    expect(playersLink).toHaveClass('bg-blue-600');
  });

  it('highlights Players when on /admin/players/123', () => {
    mockPathname = '/admin/players/123';
    render(<AdminSidebar />);

    const playersLink = screen.getByRole('link', { name: 'Players' });
    expect(playersLink).toHaveClass('bg-blue-600');
  });

  it('highlights Tournaments when on /admin/tournaments', () => {
    mockPathname = '/admin/tournaments';
    render(<AdminSidebar />);

    const tournamentsLink = screen.getByRole('link', { name: 'Tournaments' });
    expect(tournamentsLink).toHaveClass('bg-blue-600');
  });

  it('highlights Users when on /admin/users/edit/456', () => {
    mockPathname = '/admin/users/edit/456';
    render(<AdminSidebar />);

    const usersLink = screen.getByRole('link', { name: 'Users' });
    expect(usersLink).toHaveClass('bg-blue-600');
  });

  it('does not highlight Dashboard for subpaths like /admin/players', () => {
    mockPathname = '/admin/players';
    render(<AdminSidebar />);

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).not.toHaveClass('bg-blue-600');
  });

  it('applies inactive styling to non-active links', () => {
    mockPathname = '/admin';
    render(<AdminSidebar />);

    const playersLink = screen.getByRole('link', { name: 'Players' });
    expect(playersLink).toHaveClass('text-gray-700');
    expect(playersLink).not.toHaveClass('bg-blue-600');
  });
});
