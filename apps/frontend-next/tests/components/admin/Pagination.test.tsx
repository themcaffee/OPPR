import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '@/components/admin/Pagination';

describe('Pagination', () => {
  it('returns null when totalPages <= 1', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={onPageChange} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when totalPages is 0', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={onPageChange} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders Previous and Next buttons', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('shows "Page X of Y" text', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChange} />);

    expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('enables Previous button when not on first page', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled();
  });

  it('disables Next button on last page', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={5} totalPages={5} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables Next button when not on last page', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={4} totalPages={5} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  it('calls onPageChange with currentPage - 1 when Previous clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with currentPage + 1 when Next clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
