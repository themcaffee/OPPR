import { describe, it, expect } from 'vitest';
import {
  createRound,
  createManyRounds,
  findRoundById,
  findRoundByTournamentAndNumber,
  findRounds,
  getTournamentRounds,
  getQualifyingRounds,
  getFinalsRounds,
  updateRound,
  deleteRound,
  deleteRoundsByTournament,
  countRounds,
  getRoundWithMatches,
} from '../src/rounds.js';
import { createTournament } from '../src/tournaments.js';
import { createMatch } from '../src/matches.js';
import { createPlayer } from '../src/players.js';
import { createEntry } from '../src/entries.js';
import { createTournamentInput } from './factories/tournament.factory.js';
import { createPlayerInput } from './factories/player.factory.js';

describe('rounds', () => {
  describe('createRound', () => {
    it('should create a qualifying round', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({
        tournamentId: tournament.id,
        number: 1,
        name: 'Round 1',
        isFinals: false,
      });

      expect(round.id).toBeDefined();
      expect(round.tournamentId).toBe(tournament.id);
      expect(round.number).toBe(1);
      expect(round.name).toBe('Round 1');
      expect(round.isFinals).toBe(false);
    });

    it('should create a finals round', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({
        tournamentId: tournament.id,
        number: 1,
        name: 'Quarterfinals',
        isFinals: true,
      });

      expect(round.isFinals).toBe(true);
      expect(round.name).toBe('Quarterfinals');
    });

    it('should default isFinals to false', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({
        tournamentId: tournament.id,
        number: 1,
      });

      expect(round.isFinals).toBe(false);
    });
  });

  describe('createManyRounds', () => {
    it('should create multiple rounds at once', async () => {
      const tournament = await createTournament(createTournamentInput());
      const result = await createManyRounds([
        { tournamentId: tournament.id, number: 1 },
        { tournamentId: tournament.id, number: 2 },
        { tournamentId: tournament.id, number: 3 },
      ]);

      expect(result.count).toBe(3);
    });
  });

  describe('findRoundById', () => {
    it('should find a round by ID', async () => {
      const tournament = await createTournament(createTournamentInput());
      const created = await createRound({
        tournamentId: tournament.id,
        number: 1,
        name: 'Test Round',
      });

      const found = await findRoundById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe('Test Round');
    });

    it('should return null for non-existent ID', async () => {
      const found = await findRoundById('non-existent-id');
      expect(found).toBeNull();
    });

    it('should include related data when requested', async () => {
      const tournament = await createTournament(createTournamentInput());
      const created = await createRound({
        tournamentId: tournament.id,
        number: 1,
      });

      const found = await findRoundById(created.id, { tournament: true });
      expect(found).not.toBeNull();
      expect((found as any).tournament).toBeDefined();
    });
  });

  describe('findRoundByTournamentAndNumber', () => {
    it('should find by tournament, number, and isFinals', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createRound({
        tournamentId: tournament.id,
        number: 1,
        isFinals: false,
      });

      const found = await findRoundByTournamentAndNumber(tournament.id, 1, false);
      expect(found).not.toBeNull();
      expect(found!.number).toBe(1);
      expect(found!.isFinals).toBe(false);
    });

    it('should distinguish between qualifying and finals', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createRound({
        tournamentId: tournament.id,
        number: 1,
        isFinals: false,
      });
      await createRound({
        tournamentId: tournament.id,
        number: 1,
        isFinals: true,
      });

      const qualifying = await findRoundByTournamentAndNumber(tournament.id, 1, false);
      const finals = await findRoundByTournamentAndNumber(tournament.id, 1, true);

      expect(qualifying!.isFinals).toBe(false);
      expect(finals!.isFinals).toBe(true);
    });
  });

  describe('findRounds', () => {
    it('should find rounds with filters', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createRound({ tournamentId: tournament.id, number: 1 });
      await createRound({ tournamentId: tournament.id, number: 2 });

      const rounds = await findRounds({
        where: { tournamentId: tournament.id },
        orderBy: { number: 'asc' },
      });

      expect(rounds).toHaveLength(2);
      expect(rounds[0].number).toBe(1);
      expect(rounds[1].number).toBe(2);
    });

    it('should support pagination', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createManyRounds([
        { tournamentId: tournament.id, number: 1 },
        { tournamentId: tournament.id, number: 2 },
        { tournamentId: tournament.id, number: 3 },
      ]);

      const rounds = await findRounds({
        where: { tournamentId: tournament.id },
        take: 2,
        skip: 1,
        orderBy: { number: 'asc' },
      });

      expect(rounds).toHaveLength(2);
      expect(rounds[0].number).toBe(2);
    });
  });

  describe('getTournamentRounds', () => {
    it('should get all rounds for a tournament', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createRound({ tournamentId: tournament.id, number: 1, isFinals: false });
      await createRound({ tournamentId: tournament.id, number: 2, isFinals: false });
      await createRound({ tournamentId: tournament.id, number: 1, isFinals: true });

      const rounds = await getTournamentRounds(tournament.id);
      expect(rounds).toHaveLength(3);
    });
  });

  describe('getQualifyingRounds', () => {
    it('should only get qualifying rounds', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createRound({ tournamentId: tournament.id, number: 1, isFinals: false });
      await createRound({ tournamentId: tournament.id, number: 2, isFinals: false });
      await createRound({ tournamentId: tournament.id, number: 1, isFinals: true });

      const rounds = await getQualifyingRounds(tournament.id);
      expect(rounds).toHaveLength(2);
      expect(rounds.every((r) => r.isFinals === false)).toBe(true);
    });
  });

  describe('getFinalsRounds', () => {
    it('should only get finals rounds', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createRound({ tournamentId: tournament.id, number: 1, isFinals: false });
      await createRound({ tournamentId: tournament.id, number: 1, isFinals: true });
      await createRound({ tournamentId: tournament.id, number: 2, isFinals: true });

      const rounds = await getFinalsRounds(tournament.id);
      expect(rounds).toHaveLength(2);
      expect(rounds.every((r) => r.isFinals === true)).toBe(true);
    });
  });

  describe('updateRound', () => {
    it('should update round properties', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({
        tournamentId: tournament.id,
        number: 1,
        name: 'Original Name',
      });

      const updated = await updateRound(round.id, {
        name: 'Updated Name',
        number: 5,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.number).toBe(5);
    });
  });

  describe('deleteRound', () => {
    it('should delete a round', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({
        tournamentId: tournament.id,
        number: 1,
      });

      await deleteRound(round.id);
      const found = await findRoundById(round.id);
      expect(found).toBeNull();
    });
  });

  describe('deleteRoundsByTournament', () => {
    it('should delete all rounds for a tournament', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createManyRounds([
        { tournamentId: tournament.id, number: 1 },
        { tournamentId: tournament.id, number: 2 },
      ]);

      const result = await deleteRoundsByTournament(tournament.id);
      expect(result.count).toBe(2);

      const remaining = await getTournamentRounds(tournament.id);
      expect(remaining).toHaveLength(0);
    });
  });

  describe('countRounds', () => {
    it('should count all rounds', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createManyRounds([
        { tournamentId: tournament.id, number: 1 },
        { tournamentId: tournament.id, number: 2 },
      ]);

      const count = await countRounds({ tournamentId: tournament.id });
      expect(count).toBe(2);
    });

    it('should count with filters', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createRound({ tournamentId: tournament.id, number: 1, isFinals: false });
      await createRound({ tournamentId: tournament.id, number: 1, isFinals: true });

      const finalsCount = await countRounds({ tournamentId: tournament.id, isFinals: true });
      expect(finalsCount).toBe(1);
    });
  });

  describe('getRoundWithMatches', () => {
    it('should get round with matches and entries', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const round = await createRound({
        tournamentId: tournament.id,
        number: 1,
      });
      const match = await createMatch({
        tournamentId: tournament.id,
        roundId: round.id,
        number: 1,
      });
      await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'WIN',
        position: 1,
      });

      const result = await getRoundWithMatches(round.id);
      expect(result).not.toBeNull();
      expect(result!.matches).toHaveLength(1);
      expect(result!.matches[0].entries).toHaveLength(1);
      expect(result!.matches[0].entries[0].player).toBeDefined();
    });

    it('should return null for non-existent round', async () => {
      const result = await getRoundWithMatches('non-existent-id');
      expect(result).toBeNull();
    });
  });
});
