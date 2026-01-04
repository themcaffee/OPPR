import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportMatchplayPage from '@/app/(admin)/admin/import/matchplay/page';
import type { ImportTournamentResponse } from '@opprs/rest-api-client';
import { createMockTournament } from '@tests/mocks/data-factories';

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

const mockMatchplayTournament = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    import: {
      matchplayTournament: (...args: unknown[]) => mockMatchplayTournament(...args),
    },
  },
}));

describe('ImportMatchplayPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the import form', () => {
    render(<ImportMatchplayPage />);

    expect(screen.getByText('Import from Matchplay')).toBeInTheDocument();
    expect(screen.getByLabelText(/Matchplay Tournament ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Booster/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/API Token/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Import Tournament/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('shows validation error when tournament ID is empty', async () => {
    render(<ImportMatchplayPage />);

    fireEvent.click(screen.getByRole('button', { name: /Import Tournament/i }));

    await waitFor(() => {
      expect(screen.getByText('Tournament ID is required')).toBeInTheDocument();
    });
  });

  it('calls API with correct parameters on submit', async () => {
    const mockResponse: ImportTournamentResponse = {
      tournament: createMockTournament({
        id: 'tour-123',
        externalId: 'mp-12345',
        firstPlaceValue: 100.5,
        baseValue: 50,
        tgp: 100,
      }),
      playersCreated: 5,
      playersUpdated: 10,
      resultsCount: 15,
      created: true,
    };
    mockMatchplayTournament.mockResolvedValue(mockResponse);

    render(<ImportMatchplayPage />);

    fireEvent.change(screen.getByLabelText(/Matchplay Tournament ID/i), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Import Tournament/i }));

    await waitFor(() => {
      expect(mockMatchplayTournament).toHaveBeenCalledWith(12345, {
        eventBooster: undefined,
        apiToken: undefined,
      });
    });
  });

  it('passes event booster when selected', async () => {
    const mockResponse: ImportTournamentResponse = {
      tournament: createMockTournament({
        id: 'tour-123',
        externalId: 'mp-12345',
        eventBooster: 'MAJOR',
        firstPlaceValue: 200,
        eventBoosterMultiplier: 2.0,
      }),
      playersCreated: 3,
      playersUpdated: 7,
      resultsCount: 10,
      created: true,
    };
    mockMatchplayTournament.mockResolvedValue(mockResponse);

    render(<ImportMatchplayPage />);

    fireEvent.change(screen.getByLabelText(/Matchplay Tournament ID/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/Event Booster/i), {
      target: { value: 'MAJOR' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Import Tournament/i }));

    await waitFor(() => {
      expect(mockMatchplayTournament).toHaveBeenCalledWith(12345, {
        eventBooster: 'MAJOR',
        apiToken: undefined,
      });
    });
  });

  it('passes API token when provided', async () => {
    const mockResponse: ImportTournamentResponse = {
      tournament: createMockTournament({
        id: 'tour-123',
        externalId: 'mp-12345',
        name: 'Private Tournament',
        firstPlaceValue: 50,
        baseValue: 25,
        tgp: 50,
        tvaRating: 5,
        tvaRanking: 8,
        totalTVA: 13,
      }),
      playersCreated: 2,
      playersUpdated: 3,
      resultsCount: 5,
      created: true,
    };
    mockMatchplayTournament.mockResolvedValue(mockResponse);

    render(<ImportMatchplayPage />);

    fireEvent.change(screen.getByLabelText(/Matchplay Tournament ID/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/API Token/i), {
      target: { value: 'secret-token' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Import Tournament/i }));

    await waitFor(() => {
      expect(mockMatchplayTournament).toHaveBeenCalledWith(12345, {
        eventBooster: undefined,
        apiToken: 'secret-token',
      });
    });
  });

  it('displays success result after import', async () => {
    const mockResponse: ImportTournamentResponse = {
      tournament: createMockTournament({
        id: 'tour-123',
        externalId: 'mp-12345',
        eventBooster: 'CERTIFIED',
        firstPlaceValue: 100.5,
        eventBoosterMultiplier: 1.5,
      }),
      playersCreated: 5,
      playersUpdated: 10,
      resultsCount: 15,
      created: true,
    };
    mockMatchplayTournament.mockResolvedValue(mockResponse);

    render(<ImportMatchplayPage />);

    fireEvent.change(screen.getByLabelText(/Matchplay Tournament ID/i), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Import Tournament/i }));

    await waitFor(() => {
      expect(screen.getByText('Tournament Imported')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Tournament')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Players Created
    expect(screen.getByText('10')).toBeInTheDocument(); // Players Updated
    expect(screen.getByText('15')).toBeInTheDocument(); // Results
    expect(screen.getByText('CERTIFIED')).toBeInTheDocument();
    expect(screen.getByText('100.50')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Tournament/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Import Another/i })).toBeInTheDocument();
  });

  it('shows "Tournament Updated" for non-created imports', async () => {
    const mockResponse: ImportTournamentResponse = {
      tournament: createMockTournament({
        id: 'tour-123',
        externalId: 'mp-12345',
        name: 'Existing Tournament',
        firstPlaceValue: 50,
        baseValue: 25,
        tgp: 50,
        tvaRating: 5,
        tvaRanking: 8,
        totalTVA: 13,
      }),
      playersCreated: 0,
      playersUpdated: 5,
      resultsCount: 5,
      created: false,
    };
    mockMatchplayTournament.mockResolvedValue(mockResponse);

    render(<ImportMatchplayPage />);

    fireEvent.change(screen.getByLabelText(/Matchplay Tournament ID/i), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Import Tournament/i }));

    await waitFor(() => {
      expect(screen.getByText('Tournament Updated')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    mockMatchplayTournament.mockRejectedValue(new Error('Tournament not found'));

    render(<ImportMatchplayPage />);

    fireEvent.change(screen.getByLabelText(/Matchplay Tournament ID/i), {
      target: { value: '99999' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Import Tournament/i }));

    await waitFor(() => {
      expect(screen.getByText('Tournament not found')).toBeInTheDocument();
    });
  });

  it('navigates to tournament on View Tournament click', async () => {
    const mockResponse: ImportTournamentResponse = {
      tournament: createMockTournament({
        id: 'tour-123',
        externalId: 'mp-12345',
        firstPlaceValue: 50,
        baseValue: 25,
        tgp: 50,
        tvaRating: 5,
        tvaRanking: 8,
        totalTVA: 13,
      }),
      playersCreated: 1,
      playersUpdated: 2,
      resultsCount: 3,
      created: true,
    };
    mockMatchplayTournament.mockResolvedValue(mockResponse);

    render(<ImportMatchplayPage />);

    fireEvent.change(screen.getByLabelText(/Matchplay Tournament ID/i), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Import Tournament/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View Tournament/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /View Tournament/i }));

    expect(mockPush).toHaveBeenCalledWith('/admin/tournaments/tour-123');
  });

  it('resets form on Import Another click', async () => {
    const mockResponse: ImportTournamentResponse = {
      tournament: createMockTournament({
        id: 'tour-123',
        externalId: 'mp-12345',
        firstPlaceValue: 50,
        baseValue: 25,
        tgp: 50,
        tvaRating: 5,
        tvaRanking: 8,
        totalTVA: 13,
      }),
      playersCreated: 1,
      playersUpdated: 2,
      resultsCount: 3,
      created: true,
    };
    mockMatchplayTournament.mockResolvedValue(mockResponse);

    render(<ImportMatchplayPage />);

    fireEvent.change(screen.getByLabelText(/Matchplay Tournament ID/i), {
      target: { value: '12345' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Import Tournament/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Import Another/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Import Another/i }));

    expect(screen.getByLabelText(/Matchplay Tournament ID/i)).toBeInTheDocument();
    expect(screen.queryByText('Tournament Imported')).not.toBeInTheDocument();
  });

  it('navigates back on Cancel click', async () => {
    render(<ImportMatchplayPage />);

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(mockBack).toHaveBeenCalled();
  });

  it('shows hint text for tournament ID field', () => {
    render(<ImportMatchplayPage />);

    expect(
      screen.getByText(/Find this in the Matchplay tournament URL/i)
    ).toBeInTheDocument();
  });
});
