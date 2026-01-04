import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTournament,
  findTournamentById,
  findTournamentByExternalId,
  findTournaments,
  getRecentTournaments,
  getTournamentsByDateRange,
  getTournamentsByBoosterType,
  getMajorTournaments,
  updateTournament,
  deleteTournament,
  countTournaments,
  getTournamentWithResults,
  getTournamentWithMatches,
  searchTournaments,
  getTournamentStats,
} from '../src/tournaments.js';
import { createPlayer } from '../src/players.js';
import { createStanding, countStandings } from '../src/standings.js';
import { createRound } from '../src/rounds.js';
import { createMatch } from '../src/matches.js';
import { createEntry } from '../src/entries.js';
import {
  createTournamentInput,
  createMajorTournamentInput,
  createCertifiedTournamentInput,
  resetTournamentCounter,
} from './factories/tournament.factory.js';
import { createPlayerInput, resetPlayerCounter } from './factories/player.factory.js';
import { createStandingInput } from './factories/result.factory.js';

beforeEach(() => {
  resetTournamentCounter();
  resetPlayerCounter();
});

describe('tournaments', () => {
  describe('createTournament', () => {
    it('should create a tournament with required fields', async () => {
      const tournament = await createTournament({
        name: 'Test Tournament',
        date: new Date('2024-01-15'),
      });

      expect(tournament.id).toBeDefined();
      expect(tournament.name).toBe('Test Tournament');
      expect(tournament.date).toEqual(new Date('2024-01-15'));
      expect(tournament.createdAt).toBeInstanceOf(Date);
      expect(tournament.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a tournament with all fields', async () => {
      const input = createTournamentInput({
        baseValue: 10,
        tvaRating: 100,
        tvaRanking: 50,
        totalTVA: 150,
        tgp: 95,
        eventBoosterMultiplier: 1.5,
        firstPlaceValue: 200,
        allowsOptOut: true,
        tgpConfig: { format: 'test' },
      });

      const tournament = await createTournament(input);

      expect(tournament.externalId).toBe(input.externalId);
      expect(tournament.name).toBe(input.name);
      expect(tournament.baseValue).toBe(10);
      expect(tournament.tvaRating).toBe(100);
      expect(tournament.tvaRanking).toBe(50);
      expect(tournament.totalTVA).toBe(150);
      expect(tournament.tgp).toBe(95);
      expect(tournament.eventBoosterMultiplier).toBe(1.5);
      expect(tournament.firstPlaceValue).toBe(200);
      expect(tournament.allowsOptOut).toBe(true);
      expect(tournament.tgpConfig).toEqual({ format: 'test' });
    });

    it('should default eventBooster to NONE when not provided', async () => {
      const tournament = await createTournament({
        name: 'Test Tournament',
        date: new Date(),
      });

      expect(tournament.eventBooster).toBe('NONE');
    });

    it('should use provided eventBooster value', async () => {
      const tournament = await createTournament(createMajorTournamentInput());

      expect(tournament.eventBooster).toBe('MAJOR');
    });

    it('should create tournaments with different booster types', async () => {
      const none = await createTournament(createTournamentInput({ eventBooster: 'NONE' }));
      const certified = await createTournament(createTournamentInput({ eventBooster: 'CERTIFIED' }));
      const certifiedPlus = await createTournament(createTournamentInput({ eventBooster: 'CERTIFIED_PLUS' }));
      const championship = await createTournament(createTournamentInput({ eventBooster: 'CHAMPIONSHIP_SERIES' }));
      const major = await createTournament(createTournamentInput({ eventBooster: 'MAJOR' }));

      expect(none.eventBooster).toBe('NONE');
      expect(certified.eventBooster).toBe('CERTIFIED');
      expect(certifiedPlus.eventBooster).toBe('CERTIFIED_PLUS');
      expect(championship.eventBooster).toBe('CHAMPIONSHIP_SERIES');
      expect(major.eventBooster).toBe('MAJOR');
    });
  });

  describe('findTournamentById', () => {
    it('should find an existing tournament by ID', async () => {
      const created = await createTournament(createTournamentInput());

      const found = await findTournamentById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe(created.name);
    });

    it('should return null for non-existent ID', async () => {
      const found = await findTournamentById('non-existent-id');

      expect(found).toBeNull();
    });

    it('should support include option for relations', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      await createStanding(createStandingInput(player.id, tournament.id));

      const found = await findTournamentById(tournament.id, { standings: true });

      expect(found).not.toBeNull();
      expect(found!.standings).toBeDefined();
      expect(found!.standings).toHaveLength(1);
    });
  });

  describe('findTournamentByExternalId', () => {
    it('should find a tournament by external ID', async () => {
      const input = createTournamentInput({ externalId: 'unique-external-id' });
      const created = await createTournament(input);

      const found = await findTournamentByExternalId('unique-external-id');

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent external ID', async () => {
      const found = await findTournamentByExternalId('non-existent-external-id');

      expect(found).toBeNull();
    });

    it('should support include option', async () => {
      const tournament = await createTournament(createTournamentInput());

      const found = await findTournamentByExternalId(tournament.externalId!, { standings: true });

      expect(found).not.toBeNull();
      expect(found!.standings).toBeDefined();
    });
  });

  describe('findTournaments', () => {
    it('should return all tournaments with empty options', async () => {
      await createTournament(createTournamentInput());
      await createTournament(createTournamentInput());
      await createTournament(createTournamentInput());

      const tournaments = await findTournaments();

      expect(tournaments).toHaveLength(3);
    });

    it('should support take/skip pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await createTournament(createTournamentInput());
      }

      const page1 = await findTournaments({ take: 2, skip: 0 });
      const page2 = await findTournaments({ take: 2, skip: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
    });

    it('should support where filter', async () => {
      await createTournament(createMajorTournamentInput());
      await createTournament(createTournamentInput());

      const majors = await findTournaments({ where: { eventBooster: 'MAJOR' } });

      expect(majors).toHaveLength(1);
      expect(majors[0].eventBooster).toBe('MAJOR');
    });

    it('should support orderBy', async () => {
      await createTournament(createTournamentInput({ date: new Date('2024-01-01') }));
      await createTournament(createTournamentInput({ date: new Date('2024-06-01') }));
      await createTournament(createTournamentInput({ date: new Date('2024-03-01') }));

      const tournaments = await findTournaments({ orderBy: { date: 'desc' } });

      expect(tournaments[0].date).toEqual(new Date('2024-06-01'));
      expect(tournaments[1].date).toEqual(new Date('2024-03-01'));
      expect(tournaments[2].date).toEqual(new Date('2024-01-01'));
    });

    it('should support include option', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      await createStanding(createStandingInput(player.id, tournament.id));

      const tournaments = await findTournaments({ include: { standings: true } });

      expect(tournaments[0].standings).toBeDefined();
    });
  });

  describe('getRecentTournaments', () => {
    it('should return tournaments ordered by date descending', async () => {
      await createTournament(createTournamentInput({ date: new Date('2024-01-01') }));
      await createTournament(createTournamentInput({ date: new Date('2024-06-01') }));
      await createTournament(createTournamentInput({ date: new Date('2024-03-01') }));

      const tournaments = await getRecentTournaments();

      expect(tournaments[0].date).toEqual(new Date('2024-06-01'));
      expect(tournaments[1].date).toEqual(new Date('2024-03-01'));
      expect(tournaments[2].date).toEqual(new Date('2024-01-01'));
    });

    it('should use default limit of 20', async () => {
      for (let i = 0; i < 25; i++) {
        await createTournament(createTournamentInput());
      }

      const tournaments = await getRecentTournaments();

      expect(tournaments).toHaveLength(20);
    });

    it('should respect custom limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createTournament(createTournamentInput());
      }

      const tournaments = await getRecentTournaments(5);

      expect(tournaments).toHaveLength(5);
    });

    it('should support include option', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      await createStanding(createStandingInput(player.id, tournament.id));

      const tournaments = await getRecentTournaments(10, { standings: true });

      expect(tournaments[0].standings).toBeDefined();
    });
  });

  describe('getTournamentsByDateRange', () => {
    it('should return tournaments within date range (inclusive)', async () => {
      await createTournament(createTournamentInput({ date: new Date('2024-01-01') }));
      await createTournament(createTournamentInput({ date: new Date('2024-03-15') }));
      await createTournament(createTournamentInput({ date: new Date('2024-06-01') }));

      const tournaments = await getTournamentsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-03-31'),
      );

      expect(tournaments).toHaveLength(2);
    });

    it('should include boundary dates', async () => {
      await createTournament(createTournamentInput({ date: new Date('2024-01-01') }));
      await createTournament(createTournamentInput({ date: new Date('2024-01-31') }));

      const tournaments = await getTournamentsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );

      expect(tournaments).toHaveLength(2);
    });

    it('should return empty array for no matches', async () => {
      await createTournament(createTournamentInput({ date: new Date('2024-06-01') }));

      const tournaments = await getTournamentsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-03-31'),
      );

      expect(tournaments).toHaveLength(0);
    });

    it('should support additional options', async () => {
      for (let i = 0; i < 5; i++) {
        await createTournament(createTournamentInput({ date: new Date('2024-02-01') }));
      }

      const tournaments = await getTournamentsByDateRange(
        new Date('2024-01-01'),
        new Date('2024-12-31'),
        { take: 2 },
      );

      expect(tournaments).toHaveLength(2);
    });
  });

  describe('getTournamentsByBoosterType', () => {
    it('should return tournaments with specified booster type', async () => {
      await createTournament(createMajorTournamentInput());
      await createTournament(createCertifiedTournamentInput());
      await createTournament(createTournamentInput());

      const majors = await getTournamentsByBoosterType('MAJOR');

      expect(majors).toHaveLength(1);
      expect(majors[0].eventBooster).toBe('MAJOR');
    });

    it('should return all tournaments of each type', async () => {
      await createTournament(createMajorTournamentInput());
      await createTournament(createMajorTournamentInput());
      await createTournament(createCertifiedTournamentInput());

      const majors = await getTournamentsByBoosterType('MAJOR');
      const certified = await getTournamentsByBoosterType('CERTIFIED');

      expect(majors).toHaveLength(2);
      expect(certified).toHaveLength(1);
    });

    it('should support additional options', async () => {
      for (let i = 0; i < 5; i++) {
        await createTournament(createMajorTournamentInput());
      }

      const majors = await getTournamentsByBoosterType('MAJOR', { take: 2 });

      expect(majors).toHaveLength(2);
    });

    it('should return empty array for no matches', async () => {
      await createTournament(createTournamentInput());

      const majors = await getTournamentsByBoosterType('MAJOR');

      expect(majors).toHaveLength(0);
    });
  });

  describe('getMajorTournaments', () => {
    it('should return only MAJOR tournaments', async () => {
      await createTournament(createMajorTournamentInput());
      await createTournament(createCertifiedTournamentInput());
      await createTournament(createTournamentInput());

      const majors = await getMajorTournaments();

      expect(majors).toHaveLength(1);
      expect(majors[0].eventBooster).toBe('MAJOR');
    });

    it('should order by date descending', async () => {
      await createTournament(createMajorTournamentInput({ date: new Date('2024-01-01') }));
      await createTournament(createMajorTournamentInput({ date: new Date('2024-06-01') }));

      const majors = await getMajorTournaments();

      expect(majors[0].date).toEqual(new Date('2024-06-01'));
      expect(majors[1].date).toEqual(new Date('2024-01-01'));
    });

    it('should respect optional limit', async () => {
      for (let i = 0; i < 5; i++) {
        await createTournament(createMajorTournamentInput());
      }

      const majors = await getMajorTournaments(2);

      expect(majors).toHaveLength(2);
    });

    it('should return all majors when no limit specified', async () => {
      for (let i = 0; i < 5; i++) {
        await createTournament(createMajorTournamentInput());
      }

      const majors = await getMajorTournaments();

      expect(majors).toHaveLength(5);
    });
  });

  describe('updateTournament', () => {
    it('should update a single field', async () => {
      const tournament = await createTournament(createTournamentInput({ name: 'Original Name' }));

      const updated = await updateTournament(tournament.id, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
    });

    it('should update multiple fields', async () => {
      const tournament = await createTournament(createTournamentInput());

      const updated = await updateTournament(tournament.id, {
        name: 'Updated Name',
        baseValue: 15,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.baseValue).toBe(15);
    });

    it('should update eventBooster', async () => {
      const tournament = await createTournament(createTournamentInput());

      const updated = await updateTournament(tournament.id, { eventBooster: 'MAJOR' });

      expect(updated.eventBooster).toBe('MAJOR');
    });

    it('should update timestamps', async () => {
      const tournament = await createTournament(createTournamentInput());
      const originalUpdatedAt = tournament.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await updateTournament(tournament.id, { name: 'New Name' });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('deleteTournament', () => {
    it('should delete an existing tournament', async () => {
      const tournament = await createTournament(createTournamentInput());

      const deleted = await deleteTournament(tournament.id);

      expect(deleted.id).toBe(tournament.id);

      const found = await findTournamentById(tournament.id);
      expect(found).toBeNull();
    });

    it('should cascade delete tournament standings', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      await createStanding(createStandingInput(player.id, tournament.id));

      const countBefore = await countStandings({ tournamentId: tournament.id });
      expect(countBefore).toBe(1);

      await deleteTournament(tournament.id);

      const countAfter = await countStandings({ tournamentId: tournament.id });
      expect(countAfter).toBe(0);
    });
  });

  describe('countTournaments', () => {
    it('should count all tournaments', async () => {
      await createTournament(createTournamentInput());
      await createTournament(createTournamentInput());
      await createTournament(createTournamentInput());

      const count = await countTournaments();

      expect(count).toBe(3);
    });

    it('should count with filter', async () => {
      await createTournament(createMajorTournamentInput());
      await createTournament(createTournamentInput());
      await createTournament(createMajorTournamentInput());

      const count = await countTournaments({ eventBooster: 'MAJOR' });

      expect(count).toBe(2);
    });

    it('should return 0 for no matches', async () => {
      await createTournament(createTournamentInput());

      const count = await countTournaments({ eventBooster: 'MAJOR' });

      expect(count).toBe(0);
    });
  });

  describe('getTournamentWithResults', () => {
    it('should return tournament with all results', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createStanding(createStandingInput(player1.id, tournament.id, { position: 1 }));
      await createStanding(createStandingInput(player2.id, tournament.id, { position: 2 }));

      const result = await getTournamentWithResults(tournament.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(tournament.id);
      expect(result!.standings).toBeDefined();
      expect(result!.standings).toHaveLength(2);
    });

    it('should order results by position ascending', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const player3 = await createPlayer(createPlayerInput());
      await createStanding(createStandingInput(player1.id, tournament.id, { position: 3 }));
      await createStanding(createStandingInput(player2.id, tournament.id, { position: 1 }));
      await createStanding(createStandingInput(player3.id, tournament.id, { position: 2 }));

      const result = await getTournamentWithResults(tournament.id);

      expect(result!.standings[0].position).toBe(1);
      expect(result!.standings[1].position).toBe(2);
      expect(result!.standings[2].position).toBe(3);
    });

    it('should include player data in results', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput({ name: 'Test Player' }));
      await createStanding(createStandingInput(player.id, tournament.id));

      const result = await getTournamentWithResults(tournament.id);

      expect(result!.standings[0].player).toBeDefined();
      expect(result!.standings[0].player.name).toBe('Test Player');
    });

    it('should return null for non-existent tournament', async () => {
      const result = await getTournamentWithResults('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getTournamentWithMatches', () => {
    it('should return tournament with rounds, matches, and entries', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput({ name: 'Test Player' }));
      const round = await createRound({
        tournamentId: tournament.id,
        number: 1,
        name: 'Round 1',
      });
      const match = await createMatch({
        tournamentId: tournament.id,
        roundId: round.id,
        number: 1,
        machineName: 'Test Machine',
      });
      await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'WIN',
        position: 1,
      });

      const result = await getTournamentWithMatches(tournament.id);

      expect(result).not.toBeNull();
      expect(result!.rounds).toBeDefined();
      expect(result!.rounds).toHaveLength(1);
      expect(result!.rounds[0].matches).toHaveLength(1);
      expect(result!.rounds[0].matches[0].entries).toHaveLength(1);
      expect(result!.rounds[0].matches[0].entries[0].player.name).toBe('Test Player');
    });

    it('should return null for non-existent tournament', async () => {
      const result = await getTournamentWithMatches('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('searchTournaments', () => {
    it('should find tournaments by name (case-insensitive)', async () => {
      await createTournament(createTournamentInput({ name: 'Pinball Championship' }));
      await createTournament(createTournamentInput({ name: 'Local Tournament' }));

      const results = await searchTournaments('pinball');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Pinball Championship');
    });

    it('should match partial strings', async () => {
      await createTournament(createTournamentInput({ name: 'Pinball Championship 2024' }));
      await createTournament(createTournamentInput({ name: 'Pinball Open' }));

      const results = await searchTournaments('pinball');

      expect(results).toHaveLength(2);
    });

    it('should order results by date descending', async () => {
      await createTournament(createTournamentInput({ name: 'Pinball 1', date: new Date('2024-01-01') }));
      await createTournament(createTournamentInput({ name: 'Pinball 2', date: new Date('2024-06-01') }));

      const results = await searchTournaments('pinball');

      expect(results[0].date).toEqual(new Date('2024-06-01'));
      expect(results[1].date).toEqual(new Date('2024-01-01'));
    });

    it('should use default limit of 20', async () => {
      for (let i = 0; i < 25; i++) {
        await createTournament(createTournamentInput({ name: `Tournament ${i}` }));
      }

      const results = await searchTournaments('Tournament');

      expect(results).toHaveLength(20);
    });

    it('should respect custom limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createTournament(createTournamentInput({ name: `Tournament ${i}` }));
      }

      const results = await searchTournaments('Tournament', 5);

      expect(results).toHaveLength(5);
    });

    it('should return empty array for no matches', async () => {
      await createTournament(createTournamentInput({ name: 'Pinball Championship' }));

      const results = await searchTournaments('xyz');

      expect(results).toHaveLength(0);
    });
  });

  describe('getTournamentStats', () => {
    it('should return null for non-existent tournament', async () => {
      const stats = await getTournamentStats('non-existent-id');

      expect(stats).toBeNull();
    });

    it('should return zero stats when tournament has no results', async () => {
      const tournament = await createTournament(createTournamentInput());

      const stats = await getTournamentStats(tournament.id);

      expect(stats).not.toBeNull();
      expect(stats!.playerCount).toBe(0);
      expect(stats!.averagePoints).toBe(0);
      expect(stats!.averageEfficiency).toBe(0);
      expect(stats!.highestPoints).toBe(0);
      expect(stats!.lowestPoints).toBe(0);
    });

    it('should calculate correct stats with results', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());

      await createStanding(createStandingInput(player1.id, tournament.id, {
        position: 1,
        totalPoints: 100,
        efficiency: 0.9,
      }));
      await createStanding(createStandingInput(player2.id, tournament.id, {
        position: 2,
        totalPoints: 50,
        efficiency: 0.7,
      }));

      const stats = await getTournamentStats(tournament.id);

      expect(stats!.playerCount).toBe(2);
      expect(stats!.averagePoints).toBe(75);
      expect(stats!.averageEfficiency).toBe(0.8);
      expect(stats!.highestPoints).toBe(100);
      expect(stats!.lowestPoints).toBe(50);
    });

    it('should include tournament data', async () => {
      const tournament = await createTournament(createTournamentInput({ name: 'Test Tournament' }));

      const stats = await getTournamentStats(tournament.id);

      expect(stats!.tournament).toBeDefined();
      expect(stats!.tournament.name).toBe('Test Tournament');
    });

    it('should handle null totalPoints and efficiency', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      await createStanding({
        playerId: player.id,
        tournamentId: tournament.id,
        position: 1,
        // totalPoints and efficiency not provided - will be null/undefined
      });

      const stats = await getTournamentStats(tournament.id);

      expect(stats!.playerCount).toBe(1);
      expect(stats!.averagePoints).toBe(0);
      expect(stats!.averageEfficiency).toBe(0);
    });

    it('should calculate stats with single result', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      await createStanding(createStandingInput(player.id, tournament.id, {
        totalPoints: 100,
        efficiency: 0.95,
      }));

      const stats = await getTournamentStats(tournament.id);

      expect(stats!.playerCount).toBe(1);
      expect(stats!.averagePoints).toBe(100);
      expect(stats!.averageEfficiency).toBe(0.95);
      expect(stats!.highestPoints).toBe(100);
      expect(stats!.lowestPoints).toBe(100);
    });
  });
});
