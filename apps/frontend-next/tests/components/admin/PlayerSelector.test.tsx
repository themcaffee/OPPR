import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlayerSelector } from '@/components/admin/PlayerSelector';
import { createMockPlayer, createMockPaginatedResponse } from '../../mocks/data-factories';

const mockPlayersList = vi.fn();
const mockPlayersGet = vi.fn();
const mockPlayersSearch = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    players: {
      list: (...args: unknown[]) => mockPlayersList(...args),
      get: (...args: unknown[]) => mockPlayersGet(...args),
      search: (...args: unknown[]) => mockPlayersSearch(...args),
    },
  },
}));

describe('PlayerSelector', () => {
  const mockPlayers = [
    createMockPlayer({ id: 'p1', name: 'Alice', rating: 1800, ranking: 1 }),
    createMockPlayer({ id: 'p2', name: 'Bob', rating: 1750, ranking: 2 }),
    createMockPlayer({ id: 'p3', name: 'Charlie', rating: 1700, ranking: 3 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse(mockPlayers));
    mockPlayersSearch.mockResolvedValue([]);
  });

  it('renders input with placeholder when no value selected', () => {
    const onChange = vi.fn();
    render(<PlayerSelector value={null} onChange={onChange} />);

    expect(screen.getByPlaceholderText(/search for a player/i)).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    const onChange = vi.fn();
    render(<PlayerSelector value={null} onChange={onChange} placeholder="Find a player..." />);

    expect(screen.getByPlaceholderText('Find a player...')).toBeInTheDocument();
  });

  it('loads recent players on mount', async () => {
    const onChange = vi.fn();
    render(<PlayerSelector value={null} onChange={onChange} />);

    await waitFor(() => {
      expect(mockPlayersList).toHaveBeenCalledWith({
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });
  });

  it('shows selected player name when value is set', async () => {
    const onChange = vi.fn();
    const selectedPlayer = createMockPlayer({ id: 'p1', name: 'Alice' });
    mockPlayersGet.mockResolvedValue(selectedPlayer);

    render(<PlayerSelector value="p1" onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  it('opens dropdown on input focus', async () => {
    const onChange = vi.fn();
    render(<PlayerSelector value={null} onChange={onChange} />);

    await waitFor(() => {
      expect(mockPlayersList).toHaveBeenCalled();
    });

    const input = screen.getByPlaceholderText(/search for a player/i);
    fireEvent.focus(input);

    expect(screen.getByText('Recent Players')).toBeInTheDocument();
  });

  it('filters out excludePlayerIds from results', async () => {
    const onChange = vi.fn();

    render(
      <PlayerSelector value={null} onChange={onChange} excludePlayerIds={['p1', 'p3']} />
    );

    await waitFor(() => {
      expect(mockPlayersList).toHaveBeenCalled();
    });

    const input = screen.getByPlaceholderText(/search for a player/i);
    fireEvent.focus(input);

    // Only Bob should be visible
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('calls onChange with playerId and player when selecting', async () => {
    const onChange = vi.fn();

    render(<PlayerSelector value={null} onChange={onChange} />);

    await waitFor(() => {
      expect(mockPlayersList).toHaveBeenCalled();
    });

    const input = screen.getByPlaceholderText(/search for a player/i);
    fireEvent.focus(input);

    fireEvent.click(screen.getByText('Bob'));

    expect(onChange).toHaveBeenCalledWith('p2', expect.objectContaining({ id: 'p2', name: 'Bob' }));
  });

  it('clears selection when clear button clicked', async () => {
    const onChange = vi.fn();
    const selectedPlayer = createMockPlayer({ id: 'p1', name: 'Alice' });
    mockPlayersGet.mockResolvedValue(selectedPlayer);

    render(<PlayerSelector value="p1" onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Find and click the clear button (the X icon button)
    // The button has type="button" but no name, find it within the component
    const container = screen.getByText('Alice').closest('div')?.parentElement;
    const clearButton = container?.querySelector('button');
    expect(clearButton).toBeTruthy();
    fireEvent.click(clearButton!);

    expect(onChange).toHaveBeenCalledWith('', null);
  });

  it('disables input when disabled prop is true', () => {
    const onChange = vi.fn();

    render(<PlayerSelector value={null} onChange={onChange} disabled={true} />);

    const input = screen.getByPlaceholderText(/search for a player/i);
    expect(input).toBeDisabled();
  });

  it('shows player rating and ranking in dropdown items', async () => {
    const onChange = vi.fn();

    render(<PlayerSelector value={null} onChange={onChange} />);

    await waitFor(() => {
      expect(mockPlayersList).toHaveBeenCalled();
    });

    const input = screen.getByPlaceholderText(/search for a player/i);
    fireEvent.focus(input);

    expect(screen.getByText(/Rating: 1800/)).toBeInTheDocument();
    expect(screen.getByText(/Rank: #1/)).toBeInTheDocument();
  });
});
