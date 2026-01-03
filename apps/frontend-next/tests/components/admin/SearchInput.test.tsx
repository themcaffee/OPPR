import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchInput } from '@/components/admin/SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders input with placeholder', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} placeholder="Search users..." />);

    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('uses default placeholder when not provided', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('shows initial value', () => {
    const onChange = vi.fn();
    render(<SearchInput value="initial" onChange={onChange} />);

    expect(screen.getByDisplayValue('initial')).toBeInTheDocument();
  });

  it('updates local value immediately on input', () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('debounces onChange by default 300ms', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not have been called immediately
    expect(onChange).not.toHaveBeenCalled();

    // Advance timers by 299ms
    vi.advanceTimersByTime(299);
    expect(onChange).not.toHaveBeenCalled();

    // Advance to 300ms
    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('uses custom debounceMs when provided', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} debounceMs={500} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });

    // Should not have been called at 300ms
    vi.advanceTimersByTime(300);
    expect(onChange).not.toHaveBeenCalled();

    // Should not have been called at 499ms
    vi.advanceTimersByTime(199);
    expect(onChange).not.toHaveBeenCalled();

    // Should be called at 500ms
    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('cancels previous timeout on new input', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByRole('searchbox');

    // Type first value
    fireEvent.change(input, { target: { value: 'first' } });
    vi.advanceTimersByTime(200);

    // Type second value before timeout
    fireEvent.change(input, { target: { value: 'second' } });
    vi.advanceTimersByTime(300);

    // Only the second value should be passed
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('second');
  });

  it('calls onChange after debounce timeout', async () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'search term' } });

    vi.advanceTimersByTime(300);

    expect(onChange).toHaveBeenCalledWith('search term');
  });
});
