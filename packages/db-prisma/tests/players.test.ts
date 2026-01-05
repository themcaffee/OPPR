import { describe, it, expect, beforeEach } from 'vitest';
import {
  createPlayer,
  findPlayerById,
  findPlayerByExternalId,
  findPlayerByPlayerNumber,
  findPlayerByUserEmail,
  findPlayers,
  updatePlayer,
  deletePlayer,
  countPlayers,
  getPlayerWithResults,
  searchPlayers,
} from '../src/players.js';
import { createTournament } from '../src/tournaments.js';
import { createStanding } from '../src/standings.js';
import { prisma } from '../src/client.js';
import { createPlayerInput, resetPlayerCounter } from './factories/player.factory.js';
import { createTournamentInput, resetTournamentCounter } from './factories/tournament.factory.js';
import { createStandingInput } from './factories/result.factory.js';

beforeEach(() => {
  resetPlayerCounter();
  resetTournamentCounter();
});

describe('players', () => {
  describe('createPlayer', () => {
    it('should create a player with minimal data', async () => {
      const player = await createPlayer({});

      expect(player.id).toBeDefined();
      expect(player.createdAt).toBeInstanceOf(Date);
      expect(player.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a player with all fields', async () => {
      const input = createPlayerInput({
        eventCount: 3,
      });

      const player = await createPlayer(input);

      expect(player.externalId).toBe(input.externalId);
      expect(player.name).toBe(input.name);
      expect(player.eventCount).toBe(3);
    });

    it('should auto-generate playerNumber when not provided', async () => {
      const player = await createPlayer({ name: 'Test' });

      expect(player.playerNumber).toBeDefined();
      expect(player.playerNumber).toBeGreaterThanOrEqual(10000);
      expect(player.playerNumber).toBeLessThanOrEqual(99999);
    });

    it('should use provided playerNumber', async () => {
      const player = await createPlayer(createPlayerInput({ playerNumber: 12345 }));

      expect(player.playerNumber).toBe(12345);
    });

    it('should reject duplicate playerNumber', async () => {
      await createPlayer(createPlayerInput({ playerNumber: 11111 }));

      await expect(createPlayer(createPlayerInput({ playerNumber: 11111 }))).rejects.toThrow();
    });
  });

  describe('findPlayerById', () => {
    it('should find an existing player by ID', async () => {
      const created = await createPlayer(createPlayerInput());

      const found = await findPlayerById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.name).toBe(created.name);
    });

    it('should return null for non-existent ID', async () => {
      const found = await findPlayerById('non-existent-id');

      expect(found).toBeNull();
    });

    it('should support include option for relations', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createStanding(createStandingInput(player.id, tournament.id));

      const found = await findPlayerById(player.id, { standings: true });

      expect(found).not.toBeNull();
      expect(found!.standings).toBeDefined();
      expect(found!.standings).toHaveLength(1);
    });
  });

  describe('findPlayerByExternalId', () => {
    it('should find a player by external ID', async () => {
      const input = createPlayerInput({ externalId: 'unique-external-id' });
      const created = await createPlayer(input);

      const found = await findPlayerByExternalId('unique-external-id');

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent external ID', async () => {
      const found = await findPlayerByExternalId('non-existent-external-id');

      expect(found).toBeNull();
    });

    it('should support include option', async () => {
      const player = await createPlayer(createPlayerInput());

      const found = await findPlayerByExternalId(player.externalId!, { standings: true });

      expect(found).not.toBeNull();
      expect(found!.standings).toBeDefined();
    });
  });

  describe('findPlayerByPlayerNumber', () => {
    it('should find a player by player number', async () => {
      const input = createPlayerInput({ playerNumber: 54321 });
      const created = await createPlayer(input);

      const found = await findPlayerByPlayerNumber(54321);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.playerNumber).toBe(54321);
    });

    it('should return null for non-existent player number', async () => {
      const found = await findPlayerByPlayerNumber(99998);

      expect(found).toBeNull();
    });

    it('should support include option', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createStanding(createStandingInput(player.id, tournament.id));

      const found = await findPlayerByPlayerNumber(player.playerNumber, { standings: true });

      expect(found).not.toBeNull();
      expect(found!.standings).toBeDefined();
      expect(found!.standings).toHaveLength(1);
    });
  });

  describe('findPlayerByUserEmail', () => {
    it('should find a player through their linked user email', async () => {
      const player = await createPlayer(createPlayerInput());
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hash',
          playerId: player.id,
        },
      });

      const found = await findPlayerByUserEmail('test@example.com');

      expect(found).not.toBeNull();
      expect(found!.id).toBe(player.id);
    });

    it('should return null for non-existent email', async () => {
      const found = await findPlayerByUserEmail('nonexistent@email.com');

      expect(found).toBeNull();
    });

    it('should return null for user without linked player', async () => {
      await prisma.user.create({
        data: {
          email: 'nolinkedplayer@example.com',
          passwordHash: 'hash',
        },
      });

      const found = await findPlayerByUserEmail('nolinkedplayer@example.com');

      expect(found).toBeNull();
    });
  });

  describe('findPlayers', () => {
    it('should return all players with empty options', async () => {
      await createPlayer(createPlayerInput());
      await createPlayer(createPlayerInput());
      await createPlayer(createPlayerInput());

      const players = await findPlayers();

      expect(players).toHaveLength(3);
    });

    it('should support take/skip pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await createPlayer(createPlayerInput());
      }

      const page1 = await findPlayers({ take: 2, skip: 0 });
      const page2 = await findPlayers({ take: 2, skip: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
    });

    it('should support where filter', async () => {
      await createPlayer(createPlayerInput({ eventCount: 5 }));
      await createPlayer(createPlayerInput({ eventCount: 0 }));

      const activePlayers = await findPlayers({ where: { eventCount: { gte: 5 } } });

      expect(activePlayers).toHaveLength(1);
      expect(activePlayers[0].eventCount).toBe(5);
    });

    it('should support orderBy', async () => {
      await createPlayer(createPlayerInput({ eventCount: 3 }));
      await createPlayer(createPlayerInput({ eventCount: 10 }));
      await createPlayer(createPlayerInput({ eventCount: 5 }));

      const players = await findPlayers({ orderBy: { eventCount: 'desc' } });

      expect(players[0].eventCount).toBe(10);
      expect(players[1].eventCount).toBe(5);
      expect(players[2].eventCount).toBe(3);
    });

    it('should support include option', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createStanding(createStandingInput(player.id, tournament.id));

      const players = await findPlayers({ include: { standings: true } });

      expect(players[0].standings).toBeDefined();
    });
  });

  describe('updatePlayer', () => {
    it('should update a single field', async () => {
      const player = await createPlayer(createPlayerInput({ name: 'Original Name' }));

      const updated = await updatePlayer(player.id, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
      expect(updated.externalId).toBe(player.externalId);
    });

    it('should update multiple fields', async () => {
      const player = await createPlayer(createPlayerInput());

      const updated = await updatePlayer(player.id, {
        name: 'Updated Name',
        eventCount: 10,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.eventCount).toBe(10);
    });

    it('should update timestamps', async () => {
      const player = await createPlayer(createPlayerInput());
      const originalUpdatedAt = player.updatedAt;

      // Small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await updatePlayer(player.id, { name: 'New Name' });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('deletePlayer', () => {
    it('should delete an existing player', async () => {
      const player = await createPlayer(createPlayerInput());

      const deleted = await deletePlayer(player.id);

      expect(deleted.id).toBe(player.id);

      const found = await findPlayerById(player.id);
      expect(found).toBeNull();
    });

    it('should cascade delete standings', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createStanding(createStandingInput(player.id, tournament.id));

      await deletePlayer(player.id);

      const found = await findPlayerById(player.id);
      expect(found).toBeNull();
    });
  });

  describe('countPlayers', () => {
    it('should count all players', async () => {
      await createPlayer(createPlayerInput());
      await createPlayer(createPlayerInput());
      await createPlayer(createPlayerInput());

      const count = await countPlayers();

      expect(count).toBe(3);
    });

    it('should count with filter', async () => {
      await createPlayer(createPlayerInput({ eventCount: 5 }));
      await createPlayer(createPlayerInput({ eventCount: 0 }));
      await createPlayer(createPlayerInput({ eventCount: 10 }));

      const count = await countPlayers({ eventCount: { gte: 5 } });

      expect(count).toBe(2);
    });

    it('should return 0 for no matches', async () => {
      await createPlayer(createPlayerInput({ eventCount: 0 }));

      const count = await countPlayers({ eventCount: { gte: 5 } });

      expect(count).toBe(0);
    });
  });

  describe('getPlayerWithResults', () => {
    it('should return player with tournament results', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament1 = await createTournament(createTournamentInput({ date: new Date('2024-01-01') }));
      const tournament2 = await createTournament(createTournamentInput({ date: new Date('2024-06-01') }));
      await createStanding(createStandingInput(player.id, tournament1.id, { position: 1 }));
      await createStanding(createStandingInput(player.id, tournament2.id, { position: 2 }));

      const result = await getPlayerWithResults(player.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(player.id);
      expect(result!.results).toBeDefined();
      expect(result!.results).toHaveLength(2);
    });

    it('should order results by tournament date descending', async () => {
      const player = await createPlayer(createPlayerInput());
      const oldTournament = await createTournament(createTournamentInput({ date: new Date('2023-01-01') }));
      const newTournament = await createTournament(createTournamentInput({ date: new Date('2024-06-01') }));
      await createStanding(createStandingInput(player.id, oldTournament.id));
      await createStanding(createStandingInput(player.id, newTournament.id));

      const result = await getPlayerWithResults(player.id);

      expect(result!.results[0].tournament.date.getTime()).toBeGreaterThan(
        result!.results[1].tournament.date.getTime(),
      );
    });

    it('should return null for non-existent player', async () => {
      const result = await getPlayerWithResults('non-existent-id');

      expect(result).toBeNull();
    });

    it('should include tournament data in results', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput({ name: 'Test Tournament' }));
      await createStanding(createStandingInput(player.id, tournament.id));

      const result = await getPlayerWithResults(player.id);

      expect(result!.results[0].tournament).toBeDefined();
      expect(result!.results[0].tournament.name).toBe('Test Tournament');
    });

    it('should map standings to results property', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createStanding(createStandingInput(player.id, tournament.id));

      const result = await getPlayerWithResults(player.id);

      expect(result!.results).toBeDefined();
      expect(result!.standings).toBeDefined();
      expect(result!.results).toEqual(result!.standings);
    });
  });

  describe('searchPlayers', () => {
    it('should find players by name (case-insensitive)', async () => {
      await createPlayer(createPlayerInput({ name: 'John Doe' }));
      await createPlayer(createPlayerInput({ name: 'Jane Smith' }));

      const results = await searchPlayers('john');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('John Doe');
    });

    it('should match partial strings', async () => {
      await createPlayer(createPlayerInput({ name: 'John Doe' }));
      await createPlayer(createPlayerInput({ name: 'Johnny Appleseed' }));

      const results = await searchPlayers('john');

      expect(results).toHaveLength(2);
    });

    it('should use default limit of 20', async () => {
      for (let i = 0; i < 25; i++) {
        await createPlayer(createPlayerInput({ name: `Player ${i}` }));
      }

      const results = await searchPlayers('Player');

      expect(results).toHaveLength(20);
    });

    it('should respect custom limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createPlayer(createPlayerInput({ name: `Player ${i}` }));
      }

      const results = await searchPlayers('Player', 5);

      expect(results).toHaveLength(5);
    });

    it('should return empty array for no matches', async () => {
      await createPlayer(createPlayerInput({ name: 'John Doe' }));

      const results = await searchPlayers('xyz');

      expect(results).toHaveLength(0);
    });
  });
});
