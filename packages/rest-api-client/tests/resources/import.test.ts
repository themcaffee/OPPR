import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportResource } from '../../src/resources/import.js';
import type { ImportTournamentResponse } from '../../src/types/index.js';

describe('ImportResource', () => {
  let mockRequest: ReturnType<typeof vi.fn>;
  let resource: ImportResource;

  beforeEach(() => {
    mockRequest = vi.fn();
    resource = new ImportResource(mockRequest);
  });

  describe('matchplayTournament', () => {
    it('should import tournament from Matchplay with minimal options', async () => {
      const response: ImportTournamentResponse = {
        tournament: {
          id: '1',
          name: 'Imported Tournament',
          date: '2025-01-01',
          location: 'Matchplay Location',
          eventBooster: 'NONE',
          ratedPlayerCount: 20,
          baseValue: 10.0,
          tva: 5.0,
          tgp: 100,
          totalValue: 15.0,
          tgpConfig: null,
          externalId: '12345',
          notes: null,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        resultsCreated: 20,
        playersCreated: 5,
        message: 'Successfully imported tournament from Matchplay',
      };

      mockRequest.mockResolvedValue(response);

      const result = await resource.matchplayTournament(12345);

      expect(result).toEqual(response);
      expect(mockRequest).toHaveBeenCalledWith('/import/matchplay/tournament/12345', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    });

    it('should import tournament from Matchplay with custom options', async () => {
      const response: ImportTournamentResponse = {
        tournament: {
          id: '1',
          name: 'Imported Tournament',
          date: '2025-01-01',
          location: 'Matchplay Location',
          eventBooster: 'MAJOR',
          ratedPlayerCount: 20,
          baseValue: 10.0,
          tva: 5.0,
          tgp: 150,
          totalValue: 22.5,
          tgpConfig: null,
          externalId: '12345',
          notes: 'Custom notes',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        resultsCreated: 20,
        playersCreated: 5,
        message: 'Successfully imported tournament from Matchplay',
      };

      mockRequest.mockResolvedValue(response);

      const options = {
        eventBooster: 'MAJOR' as const,
        notes: 'Custom notes',
        overrideTgp: 150,
      };

      const result = await resource.matchplayTournament(12345, options);

      expect(result).toEqual(response);
      expect(mockRequest).toHaveBeenCalledWith('/import/matchplay/tournament/12345', {
        method: 'POST',
        body: JSON.stringify(options),
      });
    });

    it('should import tournament with TGP config override', async () => {
      const response: ImportTournamentResponse = {
        tournament: {
          id: '1',
          name: 'Imported Tournament',
          date: '2025-01-01',
          location: 'Matchplay Location',
          eventBooster: 'NONE',
          ratedPlayerCount: 20,
          baseValue: 10.0,
          tva: 5.0,
          tgp: 120,
          totalValue: 18.0,
          tgpConfig: {
            formatType: 'FLIP_FRENZY',
            customMultipliers: {},
          },
          externalId: '12345',
          notes: null,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        resultsCreated: 20,
        playersCreated: 5,
        message: 'Successfully imported tournament from Matchplay',
      };

      mockRequest.mockResolvedValue(response);

      const options = {
        tgpConfig: {
          formatType: 'FLIP_FRENZY' as const,
          customMultipliers: {},
        },
      };

      const result = await resource.matchplayTournament(12345, options);

      expect(result).toEqual(response);
      expect(mockRequest).toHaveBeenCalledWith('/import/matchplay/tournament/12345', {
        method: 'POST',
        body: JSON.stringify(options),
      });
    });

    it('should handle import with no new players created', async () => {
      const response: ImportTournamentResponse = {
        tournament: {
          id: '1',
          name: 'Imported Tournament',
          date: '2025-01-01',
          location: 'Matchplay Location',
          eventBooster: 'NONE',
          ratedPlayerCount: 20,
          baseValue: 10.0,
          tva: 5.0,
          tgp: 100,
          totalValue: 15.0,
          tgpConfig: null,
          externalId: '12345',
          notes: null,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        resultsCreated: 20,
        playersCreated: 0,
        message: 'Successfully imported tournament from Matchplay (all players already existed)',
      };

      mockRequest.mockResolvedValue(response);

      const result = await resource.matchplayTournament(67890);

      expect(result).toEqual(response);
      expect(result.playersCreated).toBe(0);
    });
  });
});
