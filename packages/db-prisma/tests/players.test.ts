import { describe, it, expect, beforeEach } from 'vitest';
import {
  createPlayer,
  findPlayerById,
  findPlayerByExternalId,
  findPlayerByEmail,
  findPlayers,
  getRatedPlayers,
  getTopPlayersByRating,
  getTopPlayersByRanking,
  updatePlayer,
  updatePlayerRating,
  deletePlayer,
  countPlayers,
  getPlayerWithResults,
  searchPlayers,
} from '../src/players.js';
import { createTournament } from '../src/tournaments.js';
import { createResult } from '../src/results.js';
import { createPlayerInput, createRatedPlayerInput, resetPlayerCounter } from './factories/player.factory.js';
import { createTournamentInput, resetTournamentCounter } from './factories/tournament.factory.js';
import { createResultInput } from './factories/result.factory.js';

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
        ranking: 10,
      });

      const player = await createPlayer(input);

      expect(player.externalId).toBe(input.externalId);
      expect(player.name).toBe(input.name);
      expect(player.email).toBe(input.email);
      expect(player.rating).toBe(input.rating);
      expect(player.ratingDeviation).toBe(input.ratingDeviation);
      expect(player.ranking).toBe(10);
      expect(player.isRated).toBe(false);
      expect(player.eventCount).toBe(0);
    });

    it('should create a rated player', async () => {
      const input = createRatedPlayerInput();

      const player = await createPlayer(input);

      expect(player.isRated).toBe(true);
      expect(player.eventCount).toBe(5);
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
      await createResult(createResultInput(player.id, tournament.id));

      const found = await findPlayerById(player.id, { tournamentResults: true });

      expect(found).not.toBeNull();
      expect(found!.tournamentResults).toBeDefined();
      expect(found!.tournamentResults).toHaveLength(1);
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

      const found = await findPlayerByExternalId(player.externalId!, { tournamentResults: true });

      expect(found).not.toBeNull();
      expect(found!.tournamentResults).toBeDefined();
    });
  });

  describe('findPlayerByEmail', () => {
    it('should find a player by email', async () => {
      const input = createPlayerInput({ email: 'unique@email.com' });
      const created = await createPlayer(input);

      const found = await findPlayerByEmail('unique@email.com');

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent email', async () => {
      const found = await findPlayerByEmail('nonexistent@email.com');

      expect(found).toBeNull();
    });

    it('should support include option', async () => {
      const player = await createPlayer(createPlayerInput());

      const found = await findPlayerByEmail(player.email!, { tournamentResults: true });

      expect(found).not.toBeNull();
      expect(found!.tournamentResults).toBeDefined();
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
      await createPlayer(createPlayerInput({ isRated: true }));
      await createPlayer(createPlayerInput({ isRated: false }));

      const ratedPlayers = await findPlayers({ where: { isRated: true } });

      expect(ratedPlayers).toHaveLength(1);
      expect(ratedPlayers[0].isRated).toBe(true);
    });

    it('should support orderBy', async () => {
      await createPlayer(createPlayerInput({ rating: 1400 }));
      await createPlayer(createPlayerInput({ rating: 1600 }));
      await createPlayer(createPlayerInput({ rating: 1500 }));

      const players = await findPlayers({ orderBy: { rating: 'desc' } });

      expect(players[0].rating).toBe(1600);
      expect(players[1].rating).toBe(1500);
      expect(players[2].rating).toBe(1400);
    });

    it('should support include option', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, tournament.id));

      const players = await findPlayers({ include: { tournamentResults: true } });

      expect(players[0].tournamentResults).toBeDefined();
    });
  });

  describe('getRatedPlayers', () => {
    it('should return only rated players', async () => {
      await createPlayer(createRatedPlayerInput());
      await createPlayer(createPlayerInput({ isRated: false }));
      await createPlayer(createRatedPlayerInput());

      const ratedPlayers = await getRatedPlayers();

      expect(ratedPlayers).toHaveLength(2);
      ratedPlayers.forEach((p) => expect(p.isRated).toBe(true));
    });

    it('should return empty array when no rated players exist', async () => {
      await createPlayer(createPlayerInput({ isRated: false }));

      const ratedPlayers = await getRatedPlayers();

      expect(ratedPlayers).toHaveLength(0);
    });

    it('should respect pagination options', async () => {
      for (let i = 0; i < 5; i++) {
        await createPlayer(createRatedPlayerInput());
      }

      const players = await getRatedPlayers({ take: 2 });

      expect(players).toHaveLength(2);
    });
  });

  describe('getTopPlayersByRating', () => {
    it('should return players ordered by rating descending', async () => {
      await createPlayer(createRatedPlayerInput({ rating: 1400 }));
      await createPlayer(createRatedPlayerInput({ rating: 1700 }));
      await createPlayer(createRatedPlayerInput({ rating: 1500 }));

      const players = await getTopPlayersByRating();

      expect(players[0].rating).toBe(1700);
      expect(players[1].rating).toBe(1500);
      expect(players[2].rating).toBe(1400);
    });

    it('should use default limit of 50', async () => {
      for (let i = 0; i < 60; i++) {
        await createPlayer(createRatedPlayerInput({ rating: 1500 + i }));
      }

      const players = await getTopPlayersByRating();

      expect(players).toHaveLength(50);
    });

    it('should respect custom limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createPlayer(createRatedPlayerInput());
      }

      const players = await getTopPlayersByRating(5);

      expect(players).toHaveLength(5);
    });

    it('should only return rated players', async () => {
      await createPlayer(createPlayerInput({ rating: 2000, isRated: false }));
      await createPlayer(createRatedPlayerInput({ rating: 1500 }));

      const players = await getTopPlayersByRating();

      expect(players).toHaveLength(1);
      expect(players[0].rating).toBe(1500);
    });
  });

  describe('getTopPlayersByRanking', () => {
    it('should return players ordered by ranking ascending', async () => {
      await createPlayer(createRatedPlayerInput({ ranking: 10 }));
      await createPlayer(createRatedPlayerInput({ ranking: 1 }));
      await createPlayer(createRatedPlayerInput({ ranking: 5 }));

      const players = await getTopPlayersByRanking();

      expect(players[0].ranking).toBe(1);
      expect(players[1].ranking).toBe(5);
      expect(players[2].ranking).toBe(10);
    });

    it('should use default limit of 50', async () => {
      for (let i = 0; i < 60; i++) {
        await createPlayer(createRatedPlayerInput({ ranking: i + 1 }));
      }

      const players = await getTopPlayersByRanking();

      expect(players).toHaveLength(50);
    });

    it('should respect custom limit', async () => {
      for (let i = 0; i < 10; i++) {
        await createPlayer(createRatedPlayerInput({ ranking: i + 1 }));
      }

      const players = await getTopPlayersByRanking(3);

      expect(players).toHaveLength(3);
    });

    it('should exclude players with null ranking', async () => {
      await createPlayer(createRatedPlayerInput({ ranking: null }));
      await createPlayer(createRatedPlayerInput({ ranking: 5 }));
      await createPlayer(createRatedPlayerInput({ ranking: 10 }));

      const players = await getTopPlayersByRanking();

      expect(players).toHaveLength(2);
      players.forEach((p) => expect(p.ranking).not.toBeNull());
    });

    it('should only return rated players', async () => {
      await createPlayer(createPlayerInput({ ranking: 1, isRated: false }));
      await createPlayer(createRatedPlayerInput({ ranking: 5 }));

      const players = await getTopPlayersByRanking();

      expect(players).toHaveLength(1);
      expect(players[0].ranking).toBe(5);
    });
  });

  describe('updatePlayer', () => {
    it('should update a single field', async () => {
      const player = await createPlayer(createPlayerInput({ name: 'Original Name' }));

      const updated = await updatePlayer(player.id, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
      expect(updated.email).toBe(player.email);
    });

    it('should update multiple fields', async () => {
      const player = await createPlayer(createPlayerInput());

      const updated = await updatePlayer(player.id, {
        name: 'Updated Name',
        rating: 1800,
        ratingDeviation: 150,
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.rating).toBe(1800);
      expect(updated.ratingDeviation).toBe(150);
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

  describe('updatePlayerRating', () => {
    it('should update rating and ratingDeviation', async () => {
      const player = await createPlayer(createPlayerInput({ rating: 1500, ratingDeviation: 200 }));

      const updated = await updatePlayerRating(player.id, 1600, 150);

      expect(updated.rating).toBe(1600);
      expect(updated.ratingDeviation).toBe(150);
    });

    it('should set lastRatingUpdate and lastEventDate', async () => {
      const player = await createPlayer(createPlayerInput());
      const beforeUpdate = new Date();

      const updated = await updatePlayerRating(player.id, 1600, 150);

      expect(updated.lastRatingUpdate).not.toBeNull();
      expect(updated.lastRatingUpdate!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(updated.lastEventDate).not.toBeNull();
      expect(updated.lastEventDate!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
    });

    it('should not update eventCount or isRated when eventCount is undefined', async () => {
      const player = await createPlayer(createPlayerInput({ isRated: false, eventCount: 3 }));

      const updated = await updatePlayerRating(player.id, 1700, 120);

      expect(updated.isRated).toBe(false);
      expect(updated.eventCount).toBe(3);
    });

    it('should set isRated=false when eventCount < 5', async () => {
      const player = await createPlayer(createPlayerInput());

      const updated = await updatePlayerRating(player.id, 1600, 150, 4);

      expect(updated.isRated).toBe(false);
      expect(updated.eventCount).toBe(4);
    });

    it('should set isRated=true when eventCount = 5', async () => {
      const player = await createPlayer(createPlayerInput());

      const updated = await updatePlayerRating(player.id, 1600, 150, 5);

      expect(updated.isRated).toBe(true);
      expect(updated.eventCount).toBe(5);
    });

    it('should set isRated=true when eventCount > 5', async () => {
      const player = await createPlayer(createPlayerInput());

      const updated = await updatePlayerRating(player.id, 1600, 150, 10);

      expect(updated.isRated).toBe(true);
      expect(updated.eventCount).toBe(10);
    });

    it('should handle eventCount = 0', async () => {
      const player = await createPlayer(createPlayerInput({ eventCount: 5, isRated: true }));

      const updated = await updatePlayerRating(player.id, 1500, 200, 0);

      expect(updated.isRated).toBe(false);
      expect(updated.eventCount).toBe(0);
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

    it('should cascade delete tournament results', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, tournament.id));

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
      await createPlayer(createPlayerInput({ isRated: true }));
      await createPlayer(createPlayerInput({ isRated: false }));
      await createPlayer(createPlayerInput({ isRated: true }));

      const count = await countPlayers({ isRated: true });

      expect(count).toBe(2);
    });

    it('should return 0 for no matches', async () => {
      await createPlayer(createPlayerInput({ isRated: false }));

      const count = await countPlayers({ isRated: true });

      expect(count).toBe(0);
    });
  });

  describe('getPlayerWithResults', () => {
    it('should return player with tournament results', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament1 = await createTournament(createTournamentInput({ date: new Date('2024-01-01') }));
      const tournament2 = await createTournament(createTournamentInput({ date: new Date('2024-06-01') }));
      await createResult(createResultInput(player.id, tournament1.id, { position: 1 }));
      await createResult(createResultInput(player.id, tournament2.id, { position: 2 }));

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
      await createResult(createResultInput(player.id, oldTournament.id));
      await createResult(createResultInput(player.id, newTournament.id));

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
      await createResult(createResultInput(player.id, tournament.id));

      const result = await getPlayerWithResults(player.id);

      expect(result!.results[0].tournament).toBeDefined();
      expect(result!.results[0].tournament.name).toBe('Test Tournament');
    });

    it('should map tournamentResults to results property', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());
      await createResult(createResultInput(player.id, tournament.id));

      const result = await getPlayerWithResults(player.id);

      expect(result!.results).toBeDefined();
      expect(result!.tournamentResults).toBeDefined();
      expect(result!.results).toEqual(result!.tournamentResults);
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

    it('should find players by email (case-insensitive)', async () => {
      await createPlayer(createPlayerInput({ email: 'john@example.com' }));
      await createPlayer(createPlayerInput({ email: 'jane@example.com' }));

      const results = await searchPlayers('JOHN@');

      expect(results).toHaveLength(1);
      expect(results[0].email).toBe('john@example.com');
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

    it('should search across both name and email', async () => {
      await createPlayer(createPlayerInput({ name: 'John', email: 'jane@example.com' }));

      const nameResults = await searchPlayers('John');
      const emailResults = await searchPlayers('jane@');

      expect(nameResults).toHaveLength(1);
      expect(emailResults).toHaveLength(1);
      expect(nameResults[0].id).toBe(emailResults[0].id);
    });
  });
});
