import { describe, it, expect, beforeEach } from 'vitest';
import {
  createResult,
  createManyResults,
  findResultById,
  findResultByPlayerAndTournament,
  findResults,
  getPlayerResults,
  getTournamentResults,
  getPlayerTopFinishes,
  updateResult,
  updateResultPoints,
  deleteResult,
  deleteResultsByTournament,
  countResults,
  getPlayerStats,
  recalculateTimeDecay,
} from '../src/results.js';
import { createPlayer } from '../src/players.js';
import { createTournament } from '../src/tournaments.js';
import { createResultInput, createManyResultInputs } from './factories/result.factory.js';
import { createPlayerInput, resetPlayerCounter } from './factories/player.factory.js';
import { createTournamentInput, resetTournamentCounter } from './factories/tournament.factory.js';
import { daysAgo, dateWithAgeInDays } from './setup/test-helpers.js';

beforeEach(() => {
  resetPlayerCounter();
  resetTournamentCounter();
});

describe('results', () => {
  describe('createResult', () => {
    it('should create a result with required fields', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      const result = await createResult({
        playerId: player.id,
        tournamentId: tournament.id,
        position: 1,
      });

      expect(result.id).toBeDefined();
      expect(result.playerId).toBe(player.id);
      expect(result.tournamentId).toBe(tournament.id);
      expect(result.position).toBe(1);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a result with all fields', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      const input = createResultInput(player.id, tournament.id, {
        position: 2,
        optedOut: true,
        linearPoints: 40,
        dynamicPoints: 60,
        totalPoints: 100,
        ageInDays: 30,
        decayMultiplier: 0.9,
        decayedPoints: 90,
        efficiency: 0.85,
      });

      const result = await createResult(input);

      expect(result.position).toBe(2);
      expect(result.optedOut).toBe(true);
      expect(result.linearPoints).toBe(40);
      expect(result.dynamicPoints).toBe(60);
      expect(result.totalPoints).toBe(100);
      expect(result.ageInDays).toBe(30);
      expect(result.decayMultiplier).toBe(0.9);
      expect(result.decayedPoints).toBe(90);
      expect(result.efficiency).toBe(0.85);
    });

    it('should default decayedPoints to totalPoints when not provided', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      const result = await createResult({
        playerId: player.id,
        tournamentId: tournament.id,
        position: 1,
        totalPoints: 100,
      });

      expect(result.decayedPoints).toBe(100);
    });

    it('should default decayedPoints to 0 when both decayedPoints and totalPoints are undefined', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      const result = await createResult({
        playerId: player.id,
        tournamentId: tournament.id,
        position: 1,
      });

      expect(result.decayedPoints).toBe(0);
    });

    it('should use provided decayedPoints when specified', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      const result = await createResult({
        playerId: player.id,
        tournamentId: tournament.id,
        position: 1,
        totalPoints: 100,
        decayedPoints: 75,
      });

      expect(result.decayedPoints).toBe(75);
    });
  });

  describe('createManyResults', () => {
    it('should create multiple results at once', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      const inputs = createManyResultInputs([player1, player2], tournament.id);

      const result = await createManyResults(inputs);

      expect(result.count).toBe(2);

      const count = await countResults({ tournamentId: tournament.id });
      expect(count).toBe(2);
    });

    it('should apply same decayedPoints defaults as createResult', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      await createManyResults([
        { playerId: player1.id, tournamentId: tournament.id, position: 1, totalPoints: 100 },
        { playerId: player2.id, tournamentId: tournament.id, position: 2 },
      ]);

      const results = await findResults({ where: { tournamentId: tournament.id } });
      const result1 = results.find((r) => r.playerId === player1.id);
      const result2 = results.find((r) => r.playerId === player2.id);

      expect(result1!.decayedPoints).toBe(100);
      expect(result2!.decayedPoints).toBe(0);
    });

    it('should return batch payload with count', async () => {
      const players = await Promise.all([
        createPlayer(createPlayerInput()),
        createPlayer(createPlayerInput()),
        createPlayer(createPlayerInput()),
      ]);
      const tournament = await createTournament(createTournamentInput());

      const inputs = createManyResultInputs(players, tournament.id);
      const result = await createManyResults(inputs);

      expect(result.count).toBe(3);
    });
  });

  describe('findResultById', () => {
    it('should find an existing result by ID', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      const created = await createResult(createResultInput(player.id, tournament.id));

      const found = await findResultById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent ID', async () => {
      const found = await findResultById('non-existent-id');

      expect(found).toBeNull();
    });

    it('should support include option', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      const created = await createResult(createResultInput(player.id, tournament.id));

      const found = await findResultById(created.id, { player: true, tournament: true });

      expect(found!.player).toBeDefined();
      expect(found!.tournament).toBeDefined();
    });
  });

  describe('findResultByPlayerAndTournament', () => {
    it('should find result by composite key', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      const created = await createResult(createResultInput(player.id, tournament.id));

      const found = await findResultByPlayerAndTournament(player.id, tournament.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null when not found', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      const found = await findResultByPlayerAndTournament(player.id, tournament.id);

      expect(found).toBeNull();
    });

    it('should support include option', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, tournament.id));

      const found = await findResultByPlayerAndTournament(player.id, tournament.id, {
        player: true,
        tournament: true,
      });

      expect(found!.player).toBeDefined();
      expect(found!.tournament).toBeDefined();
    });
  });

  describe('findResults', () => {
    it('should return all results with empty options', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, t1.id));
      await createResult(createResultInput(player.id, t2.id));

      const results = await findResults();

      expect(results).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const player = await createPlayer(createPlayerInput());
      for (let i = 0; i < 5; i++) {
        const tournament = await createTournament(createTournamentInput());
        await createResult(createResultInput(player.id, tournament.id));
      }

      const page = await findResults({ take: 2, skip: 1 });

      expect(page).toHaveLength(2);
    });

    it('should support where filter', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, t1.id, { position: 1 }));
      await createResult(createResultInput(player.id, t2.id, { position: 2 }));

      const results = await findResults({ where: { position: 1 } });

      expect(results).toHaveLength(1);
      expect(results[0].position).toBe(1);
    });

    it('should support orderBy', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, t1.id, { position: 2 }));
      await createResult(createResultInput(player.id, t2.id, { position: 1 }));

      const results = await findResults({ orderBy: { position: 'asc' } });

      expect(results[0].position).toBe(1);
      expect(results[1].position).toBe(2);
    });

    it('should support include option', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, tournament.id));

      const results = await findResults({ include: { player: true } });

      expect(results[0].player).toBeDefined();
    });
  });

  describe('getPlayerResults', () => {
    it('should return all results for a player', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, t1.id));
      await createResult(createResultInput(player.id, t2.id));

      const results = await getPlayerResults(player.id);

      expect(results).toHaveLength(2);
    });

    it('should include tournament relation', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput({ name: 'Test Tournament' }));
      await createResult(createResultInput(player.id, tournament.id));

      const results = await getPlayerResults(player.id);

      expect(results[0].tournament).toBeDefined();
      expect(results[0].tournament.name).toBe('Test Tournament');
    });

    it('should order by tournament date descending', async () => {
      const player = await createPlayer(createPlayerInput());
      const oldTournament = await createTournament(createTournamentInput({ date: new Date('2023-01-01') }));
      const newTournament = await createTournament(createTournamentInput({ date: new Date('2024-06-01') }));
      await createResult(createResultInput(player.id, oldTournament.id));
      await createResult(createResultInput(player.id, newTournament.id));

      const results = await getPlayerResults(player.id);

      expect(results[0].tournament.date.getTime()).toBeGreaterThan(results[1].tournament.date.getTime());
    });

    it('should support additional options', async () => {
      const player = await createPlayer(createPlayerInput());
      for (let i = 0; i < 5; i++) {
        const tournament = await createTournament(createTournamentInput());
        await createResult(createResultInput(player.id, tournament.id));
      }

      const results = await getPlayerResults(player.id, { take: 2 });

      expect(results).toHaveLength(2);
    });
  });

  describe('getTournamentResults', () => {
    it('should return all results for a tournament', async () => {
      const p1 = await createPlayer(createPlayerInput());
      const p2 = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createResult(createResultInput(p1.id, tournament.id, { position: 1 }));
      await createResult(createResultInput(p2.id, tournament.id, { position: 2 }));

      const results = await getTournamentResults(tournament.id);

      expect(results).toHaveLength(2);
    });

    it('should include player relation', async () => {
      const player = await createPlayer(createPlayerInput({ name: 'Test Player' }));
      const tournament = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, tournament.id));

      const results = await getTournamentResults(tournament.id);

      expect(results[0].player).toBeDefined();
      expect(results[0].player.name).toBe('Test Player');
    });

    it('should order by position ascending', async () => {
      const p1 = await createPlayer(createPlayerInput());
      const p2 = await createPlayer(createPlayerInput());
      const p3 = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createResult(createResultInput(p1.id, tournament.id, { position: 3 }));
      await createResult(createResultInput(p2.id, tournament.id, { position: 1 }));
      await createResult(createResultInput(p3.id, tournament.id, { position: 2 }));

      const results = await getTournamentResults(tournament.id);

      expect(results[0].position).toBe(1);
      expect(results[1].position).toBe(2);
      expect(results[2].position).toBe(3);
    });

    it('should support additional options', async () => {
      const tournament = await createTournament(createTournamentInput());
      for (let i = 0; i < 5; i++) {
        const player = await createPlayer(createPlayerInput());
        await createResult(createResultInput(player.id, tournament.id, { position: i + 1 }));
      }

      const results = await getTournamentResults(tournament.id, { take: 2 });

      expect(results).toHaveLength(2);
    });
  });

  describe('getPlayerTopFinishes', () => {
    it('should return top finishes by decayedPoints descending', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      const t3 = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, t1.id, { decayedPoints: 50 }));
      await createResult(createResultInput(player.id, t2.id, { decayedPoints: 100 }));
      await createResult(createResultInput(player.id, t3.id, { decayedPoints: 75 }));

      const results = await getPlayerTopFinishes(player.id);

      expect(results[0].decayedPoints).toBe(100);
      expect(results[1].decayedPoints).toBe(75);
      expect(results[2].decayedPoints).toBe(50);
    });

    it('should use default limit of 15', async () => {
      const player = await createPlayer(createPlayerInput());
      for (let i = 0; i < 20; i++) {
        const tournament = await createTournament(createTournamentInput());
        await createResult(createResultInput(player.id, tournament.id));
      }

      const results = await getPlayerTopFinishes(player.id);

      expect(results).toHaveLength(15);
    });

    it('should respect custom limit', async () => {
      const player = await createPlayer(createPlayerInput());
      for (let i = 0; i < 10; i++) {
        const tournament = await createTournament(createTournamentInput());
        await createResult(createResultInput(player.id, tournament.id));
      }

      const results = await getPlayerTopFinishes(player.id, 5);

      expect(results).toHaveLength(5);
    });

    it('should include tournament relation', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput({ name: 'Top Finish' }));
      await createResult(createResultInput(player.id, tournament.id));

      const results = await getPlayerTopFinishes(player.id);

      expect(results[0].tournament).toBeDefined();
      expect(results[0].tournament.name).toBe('Top Finish');
    });
  });

  describe('updateResult', () => {
    it('should update a single field', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      const result = await createResult(createResultInput(player.id, tournament.id, { position: 1 }));

      const updated = await updateResult(result.id, { position: 2 });

      expect(updated.position).toBe(2);
    });

    it('should update multiple fields', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      const result = await createResult(createResultInput(player.id, tournament.id));

      const updated = await updateResult(result.id, {
        position: 5,
        totalPoints: 200,
        efficiency: 0.99,
      });

      expect(updated.position).toBe(5);
      expect(updated.totalPoints).toBe(200);
      expect(updated.efficiency).toBe(0.99);
    });
  });

  describe('updateResultPoints', () => {
    it('should update points and calculate decay for events less than 1 year old', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput({ date: daysAgo(100) }));
      const result = await createResult(createResultInput(player.id, tournament.id));

      const updated = await updateResultPoints(result.id, 40, 60, 100);

      expect(updated.linearPoints).toBe(40);
      expect(updated.dynamicPoints).toBe(60);
      expect(updated.totalPoints).toBe(100);
      expect(updated.decayMultiplier).toBe(1.0);
      expect(updated.decayedPoints).toBe(100);
      expect(updated.ageInDays).toBeGreaterThanOrEqual(99);
      expect(updated.ageInDays).toBeLessThanOrEqual(101);
    });

    it('should apply 75% decay for events 1-2 years old', async () => {
      const player = await createPlayer(createPlayerInput());
      // ~1.5 years = ~547 days
      const tournament = await createTournament(createTournamentInput({ date: dateWithAgeInDays(547) }));
      const result = await createResult(createResultInput(player.id, tournament.id));

      const updated = await updateResultPoints(result.id, 40, 60, 100);

      expect(updated.decayMultiplier).toBe(0.75);
      expect(updated.decayedPoints).toBe(75);
    });

    it('should apply 50% decay for events 2-3 years old', async () => {
      const player = await createPlayer(createPlayerInput());
      // ~2.5 years = ~912 days
      const tournament = await createTournament(createTournamentInput({ date: dateWithAgeInDays(912) }));
      const result = await createResult(createResultInput(player.id, tournament.id));

      const updated = await updateResultPoints(result.id, 40, 60, 100);

      expect(updated.decayMultiplier).toBe(0.5);
      expect(updated.decayedPoints).toBe(50);
    });

    it('should apply 0% decay for events 3+ years old', async () => {
      const player = await createPlayer(createPlayerInput());
      // ~4 years = ~1460 days
      const tournament = await createTournament(createTournamentInput({ date: dateWithAgeInDays(1460) }));
      const result = await createResult(createResultInput(player.id, tournament.id));

      const updated = await updateResultPoints(result.id, 40, 60, 100);

      expect(updated.decayMultiplier).toBe(0);
      expect(updated.decayedPoints).toBe(0);
    });

    it('should handle boundary at exactly 1 year', async () => {
      const player = await createPlayer(createPlayerInput());
      // Exactly 365 days - should be 0.75 (1+ years)
      const tournament = await createTournament(createTournamentInput({ date: dateWithAgeInDays(365) }));
      const result = await createResult(createResultInput(player.id, tournament.id));

      const updated = await updateResultPoints(result.id, 40, 60, 100);

      expect(updated.decayMultiplier).toBe(0.75);
    });

    it('should handle boundary at exactly 2 years', async () => {
      const player = await createPlayer(createPlayerInput());
      // Exactly 730 days - should be 0.5 (2+ years)
      const tournament = await createTournament(createTournamentInput({ date: dateWithAgeInDays(730) }));
      const result = await createResult(createResultInput(player.id, tournament.id));

      const updated = await updateResultPoints(result.id, 40, 60, 100);

      expect(updated.decayMultiplier).toBe(0.5);
    });

    it('should handle boundary at exactly 3 years', async () => {
      const player = await createPlayer(createPlayerInput());
      // Exactly 1095 days - should be 0 (3+ years)
      const tournament = await createTournament(createTournamentInput({ date: dateWithAgeInDays(1095) }));
      const result = await createResult(createResultInput(player.id, tournament.id));

      const updated = await updateResultPoints(result.id, 40, 60, 100);

      expect(updated.decayMultiplier).toBe(0);
    });

    it('should throw error for non-existent result', async () => {
      await expect(updateResultPoints('non-existent-id', 40, 60, 100)).rejects.toThrow(
        'Result with id non-existent-id not found',
      );
    });

    it('should calculate ageInDays correctly', async () => {
      const player = await createPlayer(createPlayerInput());
      const daysOld = 50;
      const tournament = await createTournament(createTournamentInput({ date: dateWithAgeInDays(daysOld) }));
      const result = await createResult(createResultInput(player.id, tournament.id));

      const updated = await updateResultPoints(result.id, 40, 60, 100);

      expect(updated.ageInDays).toBeGreaterThanOrEqual(daysOld - 1);
      expect(updated.ageInDays).toBeLessThanOrEqual(daysOld + 1);
    });
  });

  describe('deleteResult', () => {
    it('should delete an existing result', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      const result = await createResult(createResultInput(player.id, tournament.id));

      const deleted = await deleteResult(result.id);

      expect(deleted.id).toBe(result.id);

      const found = await findResultById(result.id);
      expect(found).toBeNull();
    });
  });

  describe('deleteResultsByTournament', () => {
    it('should delete all results for a tournament', async () => {
      const p1 = await createPlayer(createPlayerInput());
      const p2 = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createResult(createResultInput(p1.id, tournament.id));
      await createResult(createResultInput(p2.id, tournament.id));

      const result = await deleteResultsByTournament(tournament.id);

      expect(result.count).toBe(2);

      const count = await countResults({ tournamentId: tournament.id });
      expect(count).toBe(0);
    });

    it('should return count of 0 when no results exist', async () => {
      const tournament = await createTournament(createTournamentInput());

      const result = await deleteResultsByTournament(tournament.id);

      expect(result.count).toBe(0);
    });
  });

  describe('countResults', () => {
    it('should count all results', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, t1.id));
      await createResult(createResultInput(player.id, t2.id));

      const count = await countResults();

      expect(count).toBe(2);
    });

    it('should count with filter', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, t1.id, { position: 1 }));
      await createResult(createResultInput(player.id, t2.id, { position: 2 }));

      const count = await countResults({ position: 1 });

      expect(count).toBe(1);
    });

    it('should return 0 for no matches', async () => {
      const count = await countResults();

      expect(count).toBe(0);
    });
  });

  describe('getPlayerStats', () => {
    it('should return null when player has no results', async () => {
      const player = await createPlayer(createPlayerInput());

      const stats = await getPlayerStats(player.id);

      expect(stats).toBeNull();
    });

    it('should calculate correct stats with results', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());

      await createResult(createResultInput(player.id, t1.id, {
        position: 1,
        totalPoints: 100,
        decayedPoints: 100,
        efficiency: 0.9,
      }));
      await createResult(createResultInput(player.id, t2.id, {
        position: 3,
        totalPoints: 50,
        decayedPoints: 40,
        efficiency: 0.7,
      }));

      const stats = await getPlayerStats(player.id);

      expect(stats).not.toBeNull();
      expect(stats!.totalEvents).toBe(2);
      expect(stats!.totalPoints).toBe(150);
      expect(stats!.totalDecayedPoints).toBe(140);
      expect(stats!.averagePoints).toBe(75);
      expect(stats!.averagePosition).toBe(2);
      expect(stats!.averageFinish).toBe(2);
      expect(stats!.averageEfficiency).toBe(0.8);
      expect(stats!.firstPlaceFinishes).toBe(1);
      expect(stats!.topThreeFinishes).toBe(2);
      expect(stats!.bestFinish).toBe(1);
      expect(stats!.highestPoints).toBe(100);
    });

    it('should handle null totalPoints and efficiency', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      await createResult({
        playerId: player.id,
        tournamentId: tournament.id,
        position: 2,
      });

      const stats = await getPlayerStats(player.id);

      expect(stats!.totalPoints).toBe(0);
      expect(stats!.averageEfficiency).toBe(0);
    });

    it('should count first place finishes correctly', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      const t3 = await createTournament(createTournamentInput());

      await createResult(createResultInput(player.id, t1.id, { position: 1 }));
      await createResult(createResultInput(player.id, t2.id, { position: 1 }));
      await createResult(createResultInput(player.id, t3.id, { position: 2 }));

      const stats = await getPlayerStats(player.id);

      expect(stats!.firstPlaceFinishes).toBe(2);
    });

    it('should count top three finishes correctly', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournaments = await Promise.all([
        createTournament(createTournamentInput()),
        createTournament(createTournamentInput()),
        createTournament(createTournamentInput()),
        createTournament(createTournamentInput()),
      ]);

      await createResult(createResultInput(player.id, tournaments[0].id, { position: 1 }));
      await createResult(createResultInput(player.id, tournaments[1].id, { position: 2 }));
      await createResult(createResultInput(player.id, tournaments[2].id, { position: 3 }));
      await createResult(createResultInput(player.id, tournaments[3].id, { position: 4 }));

      const stats = await getPlayerStats(player.id);

      expect(stats!.topThreeFinishes).toBe(3);
    });

    it('should find best finish', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      const t3 = await createTournament(createTournamentInput());

      await createResult(createResultInput(player.id, t1.id, { position: 5 }));
      await createResult(createResultInput(player.id, t2.id, { position: 2 }));
      await createResult(createResultInput(player.id, t3.id, { position: 10 }));

      const stats = await getPlayerStats(player.id);

      expect(stats!.bestFinish).toBe(2);
    });

    it('should find highest points', async () => {
      const player = await createPlayer(createPlayerInput());
      const t1 = await createTournament(createTournamentInput());
      const t2 = await createTournament(createTournamentInput());
      const t3 = await createTournament(createTournamentInput());

      await createResult(createResultInput(player.id, t1.id, { totalPoints: 50 }));
      await createResult(createResultInput(player.id, t2.id, { totalPoints: 150 }));
      await createResult(createResultInput(player.id, t3.id, { totalPoints: 75 }));

      const stats = await getPlayerStats(player.id);

      expect(stats!.highestPoints).toBe(150);
    });
  });

  describe('recalculateTimeDecay', () => {
    it('should recalculate decay for all results', async () => {
      const player = await createPlayer(createPlayerInput());
      const recentTournament = await createTournament(createTournamentInput({ date: daysAgo(30) }));
      const oldTournament = await createTournament(createTournamentInput({ date: dateWithAgeInDays(547) }));

      await createResult(createResultInput(player.id, recentTournament.id, { totalPoints: 100 }));
      await createResult(createResultInput(player.id, oldTournament.id, { totalPoints: 100 }));

      const updated = await recalculateTimeDecay();

      expect(updated).toHaveLength(2);

      const recentResult = updated.find((r) => r.tournamentId === recentTournament.id);
      const oldResult = updated.find((r) => r.tournamentId === oldTournament.id);

      expect(recentResult!.decayMultiplier).toBe(1.0);
      expect(recentResult!.decayedPoints).toBe(100);
      expect(oldResult!.decayMultiplier).toBe(0.75);
      expect(oldResult!.decayedPoints).toBe(75);
    });

    it('should apply correct decay tiers', async () => {
      const player = await createPlayer(createPlayerInput());

      // Create tournaments in different age tiers
      const tier0 = await createTournament(createTournamentInput({ date: daysAgo(100) })); // < 1 year
      const tier1 = await createTournament(createTournamentInput({ date: dateWithAgeInDays(500) })); // 1-2 years
      const tier2 = await createTournament(createTournamentInput({ date: dateWithAgeInDays(900) })); // 2-3 years
      const tier3 = await createTournament(createTournamentInput({ date: dateWithAgeInDays(1200) })); // 3+ years

      await createResult(createResultInput(player.id, tier0.id, { totalPoints: 100 }));
      await createResult(createResultInput(player.id, tier1.id, { totalPoints: 100 }));
      await createResult(createResultInput(player.id, tier2.id, { totalPoints: 100 }));
      await createResult(createResultInput(player.id, tier3.id, { totalPoints: 100 }));

      const updated = await recalculateTimeDecay();

      const result0 = updated.find((r) => r.tournamentId === tier0.id);
      const result1 = updated.find((r) => r.tournamentId === tier1.id);
      const result2 = updated.find((r) => r.tournamentId === tier2.id);
      const result3 = updated.find((r) => r.tournamentId === tier3.id);

      expect(result0!.decayMultiplier).toBe(1.0);
      expect(result0!.decayedPoints).toBe(100);

      expect(result1!.decayMultiplier).toBe(0.75);
      expect(result1!.decayedPoints).toBe(75);

      expect(result2!.decayMultiplier).toBe(0.5);
      expect(result2!.decayedPoints).toBe(50);

      expect(result3!.decayMultiplier).toBe(0);
      expect(result3!.decayedPoints).toBe(0);
    });

    it('should use default reference date of now', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput({ date: daysAgo(30) }));
      await createResult(createResultInput(player.id, tournament.id, { totalPoints: 100 }));

      const updated = await recalculateTimeDecay();

      expect(updated[0].ageInDays).toBeGreaterThanOrEqual(29);
      expect(updated[0].ageInDays).toBeLessThanOrEqual(31);
    });

    it('should use custom reference date when provided', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput({ date: new Date('2024-01-01') }));
      await createResult(createResultInput(player.id, tournament.id, { totalPoints: 100 }));

      const referenceDate = new Date('2024-01-31');
      const updated = await recalculateTimeDecay(referenceDate);

      expect(updated[0].ageInDays).toBe(30);
    });

    it('should handle null totalPoints', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput({ date: daysAgo(30) }));
      await createResult({
        playerId: player.id,
        tournamentId: tournament.id,
        position: 1,
      });

      const updated = await recalculateTimeDecay();

      expect(updated[0].decayedPoints).toBe(0);
    });

    it('should return empty array when no results exist', async () => {
      const updated = await recalculateTimeDecay();

      expect(updated).toHaveLength(0);
    });

    it('should update ageInDays for all results', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput({ date: dateWithAgeInDays(100) }));
      await createResult(createResultInput(player.id, tournament.id));

      const updated = await recalculateTimeDecay();

      expect(updated[0].ageInDays).toBeGreaterThanOrEqual(99);
      expect(updated[0].ageInDays).toBeLessThanOrEqual(101);
    });
  });
});
