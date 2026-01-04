import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicFooter } from '@/components/public/PublicFooter';

describe('PublicFooter', () => {
  it('renders the OPPRS description text', () => {
    render(<PublicFooter />);

    expect(screen.getByText('Open Pinball Player Ranking System')).toBeInTheDocument();
  });

  it('renders GitHub link', () => {
    render(<PublicFooter />);

    const githubLink = screen.getByRole('link', { name: /github/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/themcaffee/OPPR');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render Rankings, Tournaments, or Players links', () => {
    render(<PublicFooter />);

    expect(screen.queryByRole('link', { name: 'Rankings' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Tournaments' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Players' })).not.toBeInTheDocument();
  });
});
