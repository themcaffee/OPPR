import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TournamentResultsManager } from '@/components/admin/TournamentResultsManager';
import { createMockPaginatedResponse } from '../../mocks/data-factories';
import type { TournamentResult } from '@opprs/rest-api-client';

const mockTournamentsGetResults = vi.fn();
const mockStandingsCreate = vi.fn();
const mockStandingsUpdate = vi.fn();
const mockStandingsDelete = vi.fn();
const mockPlayersList = vi.fn();
const mockPlayersSearch = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    tournaments: {
      getResults: (...args: unknown[]) => mockTournamentsGetResults(...args),
    },
    standings: {
      create: (...args: unknown[]) => mockStandingsCreate(...args),
      update: (...args: unknown[]) => mockStandingsUpdate(...args),
      delete: (...args: unknown[]) => mockStandingsDelete(...args),
    },
    players: {
      list: (...args: unknown[]) => mockPlayersList(...args),
      search: (...args: unknown[]) => mockPlayersSearch(...args),
    },
  },
}));

describe('TournamentResultsManager', () => {
  const mockResults: TournamentResult[] = [
    {
      id: 'result-1',
      position: 1,
      optedOut: false,
      linearPoints: null,
      dynamicPoints: null,
      totalPoints: 100,
      ageInDays: null,
      decayMultiplier: null,
      decayedPoints: 100,
      efficiency: null,
      player: { id: 'p1', name: 'Alice', rating: 1500, ranking: 1 },
    },
    {
      id: 'result-2',
      position: 2,
      optedOut: true,
      linearPoints: null,
      dynamicPoints: null,
      totalPoints: 80,
      ageInDays: null,
      decayMultiplier: null,
      decayedPoints: 60,
      efficiency: null,
      player: { id: 'p2', name: 'Bob', rating: 1400, ranking: 2 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockTournamentsGetResults.mockResolvedValue([]);
    mockPlayersList.mockResolvedValue(createMockPaginatedResponse([]));
    mockPlayersSearch.mockResolvedValue([]);
  });

  it('shows loading state initially', () => {
    mockTournamentsGetResults.mockReturnValue(new Promise(() => {}));

    render(<TournamentResultsManager tournamentId="tour-1" />);

    expect(screen.getByText('Loading results...')).toBeInTheDocument();
  });

  it('loads results on mount', async () => {
    mockTournamentsGetResults.mockResolvedValue(mockResults);

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(mockTournamentsGetResults).toHaveBeenCalledWith('tour-1');
    });
  });

  it('shows empty state when no results', async () => {
    mockTournamentsGetResults.mockResolvedValue([]);

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByText(/no results yet/i)).toBeInTheDocument();
    });
  });

  it('renders results table with headers', async () => {
    mockTournamentsGetResults.mockResolvedValue(mockResults);

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByText('Pos')).toBeInTheDocument();
      expect(screen.getByText('Player')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
    });
  });

  it('displays player names', async () => {
    mockTournamentsGetResults.mockResolvedValue(mockResults);

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('shows "Add Result" button', async () => {
    mockTournamentsGetResults.mockResolvedValue([]);

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add result/i })).toBeInTheDocument();
    });
  });

  it('opens add form when "Add Result" clicked', async () => {
    mockTournamentsGetResults.mockResolvedValue([]);

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add result/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /add result/i }));

    expect(screen.getByText('Add New Result')).toBeInTheDocument();
  });

  it('shows inline edit form when Edit clicked', async () => {
    mockTournamentsGetResults.mockResolvedValue(mockResults);

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Edit')[0]);

    // Position input should appear
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('opens delete confirmation when Delete clicked', async () => {
    mockTournamentsGetResults.mockResolvedValue(mockResults);

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Delete')[0]);

    expect(screen.getByText('Delete Result')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('calls apiClient.standings.delete when confirmed', async () => {
    mockTournamentsGetResults.mockResolvedValue(mockResults);
    mockStandingsDelete.mockResolvedValue({});

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Delete')[0]);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Delete Result')).toBeInTheDocument();
    });

    // Confirm delete - there are multiple Delete buttons, get the one in the modal
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    const confirmButton = deleteButtons[deleteButtons.length - 1]; // The confirm button is the last one
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockStandingsDelete).toHaveBeenCalledWith('result-1');
    });
  });

  it('shows opted out badge for opted out results', async () => {
    mockTournamentsGetResults.mockResolvedValue(mockResults);

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByText('Opted Out')).toBeInTheDocument();
    });
  });

  it('shows tournament name in header when provided', async () => {
    mockTournamentsGetResults.mockResolvedValue([]);

    render(<TournamentResultsManager tournamentId="tour-1" tournamentName="Test Tournament" />);

    await waitFor(() => {
      expect(screen.getByText(/Test Tournament/)).toBeInTheDocument();
    });
  });

  it('calls apiClient.standings.update when saving edit', async () => {
    mockTournamentsGetResults.mockResolvedValue(mockResults);
    mockStandingsUpdate.mockResolvedValue({});

    render(<TournamentResultsManager tournamentId="tour-1" />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Start editing
    fireEvent.click(screen.getAllByText('Edit')[0]);

    // Change position
    const positionInput = screen.getByDisplayValue('1');
    fireEvent.change(positionInput, { target: { value: '3' } });

    // Save
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockStandingsUpdate).toHaveBeenCalledWith('result-1', {
        position: 3,
        optedOut: false,
      });
    });
  });
});
