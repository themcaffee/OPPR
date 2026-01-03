import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders with title and message', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('shows custom confirmLabel and cancelLabel', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Delete" cancelLabel="Keep" />);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
  });

  it('uses default "Confirm" and "Cancel" when not provided', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancel button clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables cancel button when isLoading', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('shows loading state on confirm button when isLoading', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);

    // When loading, the Button component shows Loading... and is disabled
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find((b) => b.textContent?.includes('Confirm') || b.textContent?.includes('Loading'));
    expect(confirmButton).toBeDisabled();
  });

  it('applies danger styling when variant is danger', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />);

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toHaveClass('bg-red-600');
  });

  it('does not apply danger styling when variant is warning', () => {
    render(<ConfirmDialog {...defaultProps} variant="warning" />);

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).not.toHaveClass('bg-red-600');
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} isOpen={false} />);

    expect(container.firstChild).toBeNull();
  });
});
