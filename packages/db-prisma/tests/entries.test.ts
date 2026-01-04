import { describe, it, expect } from 'vitest';
import {
  createEntry,
  createManyEntries,
  findEntryById,
  findEntryByMatchAndPlayer,
  findEntries,
  getMatchEntries,
  getPlayerEntries,
  getPlayerTournamentEntries,
  updateEntry,
  deleteEntry,
  deleteEntriesByMatch,
  countEntries,
  getPlayerEntryStats,
} from '../src/entries.js';
import { createMatch } from '../src/matches.js';
import { createRound } from '../src/rounds.js';
import { createTournament } from '../src/tournaments.js';
import { createPlayer } from '../src/players.js';
import { createTournamentInput } from './factories/tournament.factory.js';
import { createPlayerInput } from './factories/player.factory.js';

describe('entries', () => {
  describe('createEntry', () => {
    it('should create an entry with WIN result', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });

      const entry = await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'WIN',
        position: 1,
      });

      expect(entry.id).toBeDefined();
      expect(entry.matchId).toBe(match.id);
      expect(entry.playerId).toBe(player.id);
      expect(entry.result).toBe('WIN');
      expect(entry.position).toBe(1);
    });

    it('should create an entry with LOSS result', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });

      const entry = await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'LOSS',
        position: 2,
      });

      expect(entry.result).toBe('LOSS');
    });

    it('should create an entry with TIE result', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });

      const entry = await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'TIE',
      });

      expect(entry.result).toBe('TIE');
    });
  });

  describe('createManyEntries', () => {
    it('should create multiple entries at once', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });

      const result = await createManyEntries([
        { matchId: match.id, playerId: player1.id, result: 'WIN', position: 1 },
        { matchId: match.id, playerId: player2.id, result: 'LOSS', position: 2 },
      ]);

      expect(result.count).toBe(2);
    });
  });

  describe('findEntryById', () => {
    it('should find an entry by ID', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });
      const created = await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'WIN',
      });

      const found = await findEntryById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent ID', async () => {
      const found = await findEntryById('non-existent-id');
      expect(found).toBeNull();
    });

    it('should include related data when requested', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });
      const created = await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'WIN',
      });

      const found = await findEntryById(created.id, { player: true, match: true });
      expect((found as any).player).toBeDefined();
      expect((found as any).match).toBeDefined();
    });
  });

  describe('findEntryByMatchAndPlayer', () => {
    it('should find entry by match and player', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });
      await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'WIN',
      });

      const found = await findEntryByMatchAndPlayer(match.id, player.id);
      expect(found).not.toBeNull();
      expect(found!.playerId).toBe(player.id);
      expect(found!.matchId).toBe(match.id);
    });

    it('should return null for non-existent combination', async () => {
      const found = await findEntryByMatchAndPlayer('match-id', 'player-id');
      expect(found).toBeNull();
    });
  });

  describe('findEntries', () => {
    it('should find entries with filters', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });
      await createEntry({ matchId: match.id, playerId: player.id, result: 'WIN' });

      const entries = await findEntries({
        where: { playerId: player.id },
      });

      expect(entries).toHaveLength(1);
    });

    it('should support pagination', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match1 = await createMatch({ tournamentId: tournament.id, number: 1 });
      const match2 = await createMatch({ tournamentId: tournament.id, number: 2 });
      const match3 = await createMatch({ tournamentId: tournament.id, number: 3 });

      await createEntry({ matchId: match1.id, playerId: player.id, result: 'WIN' });
      await createEntry({ matchId: match2.id, playerId: player.id, result: 'LOSS' });
      await createEntry({ matchId: match3.id, playerId: player.id, result: 'WIN' });

      const entries = await findEntries({
        where: { playerId: player.id },
        take: 2,
        skip: 1,
      });

      expect(entries).toHaveLength(2);
    });
  });

  describe('getMatchEntries', () => {
    it('should get all entries for a match', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });

      await createEntry({ matchId: match.id, playerId: player1.id, result: 'WIN', position: 1 });
      await createEntry({ matchId: match.id, playerId: player2.id, result: 'LOSS', position: 2 });

      const entries = await getMatchEntries(match.id);
      expect(entries).toHaveLength(2);
      expect(entries[0].position).toBe(1);
    });
  });

  describe('getPlayerEntries', () => {
    it('should get all entries for a player', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match1 = await createMatch({ tournamentId: tournament.id, number: 1 });
      const match2 = await createMatch({ tournamentId: tournament.id, number: 2 });

      await createEntry({ matchId: match1.id, playerId: player.id, result: 'WIN' });
      await createEntry({ matchId: match2.id, playerId: player.id, result: 'LOSS' });

      const entries = await getPlayerEntries(player.id);
      expect(entries).toHaveLength(2);
    });
  });

  describe('getPlayerTournamentEntries', () => {
    it('should get player entries in a specific tournament', async () => {
      const tournament1 = await createTournament(createTournamentInput());
      const tournament2 = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      const match1 = await createMatch({ tournamentId: tournament1.id, number: 1 });
      const match2 = await createMatch({ tournamentId: tournament2.id, number: 1 });

      await createEntry({ matchId: match1.id, playerId: player.id, result: 'WIN' });
      await createEntry({ matchId: match2.id, playerId: player.id, result: 'LOSS' });

      const entries = await getPlayerTournamentEntries(player.id, tournament1.id);
      expect(entries).toHaveLength(1);
    });
  });

  describe('updateEntry', () => {
    it('should update entry properties', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });
      const entry = await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'LOSS',
        position: 2,
      });

      const updated = await updateEntry(entry.id, {
        result: 'WIN',
        position: 1,
      });

      expect(updated.result).toBe('WIN');
      expect(updated.position).toBe(1);
    });
  });

  describe('deleteEntry', () => {
    it('should delete an entry', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });
      const entry = await createEntry({
        matchId: match.id,
        playerId: player.id,
        result: 'WIN',
      });

      await deleteEntry(entry.id);
      const found = await findEntryById(entry.id);
      expect(found).toBeNull();
    });
  });

  describe('deleteEntriesByMatch', () => {
    it('should delete all entries for a match', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });

      await createEntry({ matchId: match.id, playerId: player1.id, result: 'WIN' });
      await createEntry({ matchId: match.id, playerId: player2.id, result: 'LOSS' });

      const result = await deleteEntriesByMatch(match.id);
      expect(result.count).toBe(2);
    });
  });

  describe('countEntries', () => {
    it('should count entries', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match = await createMatch({ tournamentId: tournament.id, number: 1 });

      await createEntry({ matchId: match.id, playerId: player.id, result: 'WIN' });

      const count = await countEntries({ playerId: player.id });
      expect(count).toBe(1);
    });
  });

  describe('getPlayerEntryStats', () => {
    it('should calculate player statistics from entries', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const match1 = await createMatch({ tournamentId: tournament.id, number: 1 });
      const match2 = await createMatch({ tournamentId: tournament.id, number: 2 });
      const match3 = await createMatch({ tournamentId: tournament.id, number: 3 });
      const match4 = await createMatch({ tournamentId: tournament.id, number: 4 });

      await createEntry({ matchId: match1.id, playerId: player.id, result: 'WIN' });
      await createEntry({ matchId: match2.id, playerId: player.id, result: 'WIN' });
      await createEntry({ matchId: match3.id, playerId: player.id, result: 'LOSS' });
      await createEntry({ matchId: match4.id, playerId: player.id, result: 'TIE' });

      const stats = await getPlayerEntryStats(player.id);
      expect(stats).not.toBeNull();
      expect(stats!.totalMatches).toBe(4);
      expect(stats!.wins).toBe(2);
      expect(stats!.losses).toBe(1);
      expect(stats!.ties).toBe(1);
      expect(stats!.winRate).toBe(0.5);
    });

    it('should return null for player with no entries', async () => {
      const player = await createPlayer(createPlayerInput());
      const stats = await getPlayerEntryStats(player.id);
      expect(stats).toBeNull();
    });
  });
});
