import { describe, it, expect } from 'vitest';
import {
  createMatch,
  createManyMatches,
  findMatchById,
  findMatches,
  getTournamentMatches,
  getRoundMatches,
  updateMatch,
  deleteMatch,
  deleteMatchesByTournament,
  deleteMatchesByRound,
  countMatches,
  getMatchWithEntries,
  getPlayerTournamentMatches,
} from '../src/matches.js';
import { createRound } from '../src/rounds.js';
import { createTournament } from '../src/tournaments.js';
import { createPlayer } from '../src/players.js';
import { createEntry } from '../src/entries.js';
import { createTournamentInput } from './factories/tournament.factory.js';
import { createPlayerInput } from './factories/player.factory.js';

describe('matches', () => {
  describe('createMatch', () => {
    it('should create a match without a round', async () => {
      const tournament = await createTournament(createTournamentInput());
      const match = await createMatch({
        tournamentId: tournament.id,
        number: 1,
        machineName: 'Attack From Mars',
      });

      expect(match.id).toBeDefined();
      expect(match.tournamentId).toBe(tournament.id);
      expect(match.number).toBe(1);
      expect(match.machineName).toBe('Attack From Mars');
      expect(match.roundId).toBeNull();
    });

    it('should create a match with a round', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({
        tournamentId: tournament.id,
        number: 1,
      });
      const match = await createMatch({
        tournamentId: tournament.id,
        roundId: round.id,
        number: 1,
      });

      expect(match.roundId).toBe(round.id);
    });
  });

  describe('createManyMatches', () => {
    it('should create multiple matches at once', async () => {
      const tournament = await createTournament(createTournamentInput());
      const result = await createManyMatches([
        { tournamentId: tournament.id, number: 1 },
        { tournamentId: tournament.id, number: 2 },
        { tournamentId: tournament.id, number: 3 },
      ]);

      expect(result.count).toBe(3);
    });
  });

  describe('findMatchById', () => {
    it('should find a match by ID', async () => {
      const tournament = await createTournament(createTournamentInput());
      const created = await createMatch({
        tournamentId: tournament.id,
        number: 1,
        machineName: 'Test Machine',
      });

      const found = await findMatchById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.machineName).toBe('Test Machine');
    });

    it('should return null for non-existent ID', async () => {
      const found = await findMatchById('non-existent-id');
      expect(found).toBeNull();
    });

    it('should include related data when requested', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({ tournamentId: tournament.id, number: 1 });
      const created = await createMatch({
        tournamentId: tournament.id,
        roundId: round.id,
        number: 1,
      });

      const found = await findMatchById(created.id, { round: true, tournament: true });
      expect((found as any).round).toBeDefined();
      expect((found as any).tournament).toBeDefined();
    });
  });

  describe('findMatches', () => {
    it('should find matches with filters', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createMatch({ tournamentId: tournament.id, number: 1 });
      await createMatch({ tournamentId: tournament.id, number: 2 });

      const matches = await findMatches({
        where: { tournamentId: tournament.id },
        orderBy: { number: 'asc' },
      });

      expect(matches).toHaveLength(2);
      expect(matches[0].number).toBe(1);
    });

    it('should support pagination', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createManyMatches([
        { tournamentId: tournament.id, number: 1 },
        { tournamentId: tournament.id, number: 2 },
        { tournamentId: tournament.id, number: 3 },
      ]);

      const matches = await findMatches({
        where: { tournamentId: tournament.id },
        take: 2,
        skip: 1,
        orderBy: { number: 'asc' },
      });

      expect(matches).toHaveLength(2);
      expect(matches[0].number).toBe(2);
    });
  });

  describe('getTournamentMatches', () => {
    it('should get all matches for a tournament', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createManyMatches([
        { tournamentId: tournament.id, number: 1 },
        { tournamentId: tournament.id, number: 2 },
      ]);

      const matches = await getTournamentMatches(tournament.id);
      expect(matches).toHaveLength(2);
    });
  });

  describe('getRoundMatches', () => {
    it('should get all matches for a round', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({ tournamentId: tournament.id, number: 1 });
      await createMatch({ tournamentId: tournament.id, roundId: round.id, number: 1 });
      await createMatch({ tournamentId: tournament.id, roundId: round.id, number: 2 });
      await createMatch({ tournamentId: tournament.id, number: 3 }); // No round

      const matches = await getRoundMatches(round.id);
      expect(matches).toHaveLength(2);
    });
  });

  describe('updateMatch', () => {
    it('should update match properties', async () => {
      const tournament = await createTournament(createTournamentInput());
      const match = await createMatch({
        tournamentId: tournament.id,
        number: 1,
        machineName: 'Original Machine',
      });

      const updated = await updateMatch(match.id, {
        machineName: 'Updated Machine',
        number: 5,
      });

      expect(updated.machineName).toBe('Updated Machine');
      expect(updated.number).toBe(5);
    });

    it('should update round association', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({ tournamentId: tournament.id, number: 1 });
      const match = await createMatch({
        tournamentId: tournament.id,
        number: 1,
      });

      const updated = await updateMatch(match.id, { roundId: round.id });
      expect(updated.roundId).toBe(round.id);
    });
  });

  describe('deleteMatch', () => {
    it('should delete a match', async () => {
      const tournament = await createTournament(createTournamentInput());
      const match = await createMatch({
        tournamentId: tournament.id,
        number: 1,
      });

      await deleteMatch(match.id);
      const found = await findMatchById(match.id);
      expect(found).toBeNull();
    });
  });

  describe('deleteMatchesByTournament', () => {
    it('should delete all matches for a tournament', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createManyMatches([
        { tournamentId: tournament.id, number: 1 },
        { tournamentId: tournament.id, number: 2 },
      ]);

      const result = await deleteMatchesByTournament(tournament.id);
      expect(result.count).toBe(2);
    });
  });

  describe('deleteMatchesByRound', () => {
    it('should delete all matches for a round', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({ tournamentId: tournament.id, number: 1 });
      await createMatch({ tournamentId: tournament.id, roundId: round.id, number: 1 });
      await createMatch({ tournamentId: tournament.id, roundId: round.id, number: 2 });

      const result = await deleteMatchesByRound(round.id);
      expect(result.count).toBe(2);
    });
  });

  describe('countMatches', () => {
    it('should count matches', async () => {
      const tournament = await createTournament(createTournamentInput());
      await createManyMatches([
        { tournamentId: tournament.id, number: 1 },
        { tournamentId: tournament.id, number: 2 },
      ]);

      const count = await countMatches({ tournamentId: tournament.id });
      expect(count).toBe(2);
    });
  });

  describe('getMatchWithEntries', () => {
    it('should get match with entries and player details', async () => {
      const tournament = await createTournament(createTournamentInput());
      const round = await createRound({ tournamentId: tournament.id, number: 1 });
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const match = await createMatch({
        tournamentId: tournament.id,
        roundId: round.id,
        number: 1,
      });
      await createEntry({ matchId: match.id, playerId: player1.id, result: 'WIN', position: 1 });
      await createEntry({ matchId: match.id, playerId: player2.id, result: 'LOSS', position: 2 });

      const result = await getMatchWithEntries(match.id);
      expect(result).not.toBeNull();
      expect(result!.entries).toHaveLength(2);
      expect(result!.entries[0].player).toBeDefined();
      expect(result!.round).toBeDefined();
    });

    it('should return null for non-existent match', async () => {
      const result = await getMatchWithEntries('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getPlayerTournamentMatches', () => {
    it('should get all matches for a player in a tournament', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const otherPlayer = await createPlayer(createPlayerInput());

      const match1 = await createMatch({ tournamentId: tournament.id, number: 1 });
      const match2 = await createMatch({ tournamentId: tournament.id, number: 2 });
      const match3 = await createMatch({ tournamentId: tournament.id, number: 3 });

      await createEntry({ matchId: match1.id, playerId: player.id, result: 'WIN' });
      await createEntry({ matchId: match2.id, playerId: player.id, result: 'LOSS' });
      await createEntry({ matchId: match3.id, playerId: otherPlayer.id, result: 'WIN' }); // Different player

      const matches = await getPlayerTournamentMatches(player.id, tournament.id);
      expect(matches).toHaveLength(2);
    });
  });
});
