import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/StatCard';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Events" value={42} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Total Events')).toBeInTheDocument();
  });

  it('renders subtext when provided', () => {
    render(<StatCard label="Players" value={100} subtext="50 rated" />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Players')).toBeInTheDocument();
    expect(screen.getByText('50 rated')).toBeInTheDocument();
  });

  it('does not render subtext when not provided', () => {
    render(<StatCard label="Test" value="N/A" />);

    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('renders string values', () => {
    render(<StatCard label="Status" value="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatCard label="Test" value={1} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
