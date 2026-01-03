import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoPlayerProfile } from '@/components/dashboard/NoPlayerProfile';

describe('NoPlayerProfile', () => {
  it('renders the no profile message', () => {
    render(<NoPlayerProfile />);

    expect(screen.getByText('No Player Profile Linked')).toBeInTheDocument();
  });

  it('displays explanation text', () => {
    render(<NoPlayerProfile />);

    expect(
      screen.getByText(/Your account is not yet linked to a player profile/)
    ).toBeInTheDocument();
  });

  it('displays contact admin message', () => {
    render(<NoPlayerProfile />);

    expect(
      screen.getByText(/Please contact an administrator/)
    ).toBeInTheDocument();
  });
});
