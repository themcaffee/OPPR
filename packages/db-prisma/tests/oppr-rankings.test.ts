import { describe, it, expect, beforeEach } from 'vitest';
import {
  getOrCreateOpprPlayerRanking,
  createOpprPlayerRanking,
  findOpprPlayerRankingById,
  findOpprPlayerRankingByPlayerId,
  findOpprPlayerRankings,
  getTopPlayersByOpprRating,
  getTopPlayersByOpprRanking,
  getRatedOpprPlayers,
  updateOpprPlayerRanking,
  updateOpprRatingAfterTournament,
  updateWorldRankings,
  applyRDDecayForInactivePlayers,
  deleteOpprPlayerRanking,
  countOpprPlayerRankings,
  createOpprRankingHistory,
  getOpprRankingHistory,
  getOpprRankingHistoryByDateRange,
  getLatestOpprRankingHistory,
  countOpprRankingHistory,
} from '../src/oppr-rankings.js';
import { createPlayer } from '../src/players.js';
import { createTournament } from '../src/tournaments.js';
import { createPlayerInput, resetPlayerCounter } from './factories/player.factory.js';
import { createTournamentInput, resetTournamentCounter } from './factories/tournament.factory.js';
import {
  createOpprPlayerRankingInput,
  createRatedOpprPlayerRankingInput,
} from './factories/oppr-ranking.factory.js';

beforeEach(() => {
  resetPlayerCounter();
  resetTournamentCounter();
});

describe('oppr-rankings', () => {
  describe('createOpprPlayerRanking', () => {
    it('should create a ranking with default values', async () => {
      const player = await createPlayer(createPlayerInput());

      const ranking = await createOpprPlayerRanking({ playerId: player.id });

      expect(ranking.id).toBeDefined();
      expect(ranking.playerId).toBe(player.id);
      expect(ranking.rating).toBe(1500);
      expect(ranking.ratingDeviation).toBe(200);
      expect(ranking.isRated).toBe(false);
      expect(ranking.ranking).toBeNull();
    });

    it('should create a ranking with custom values', async () => {
      const player = await createPlayer(createPlayerInput());
      const input = createRatedOpprPlayerRankingInput(player.id);

      const ranking = await createOpprPlayerRanking(input);

      expect(ranking.rating).toBe(1600);
      expect(ranking.ratingDeviation).toBe(100);
      expect(ranking.ranking).toBe(1);
      expect(ranking.isRated).toBe(true);
    });

    it('should reject duplicate playerId', async () => {
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player.id });

      await expect(createOpprPlayerRanking({ playerId: player.id })).rejects.toThrow();
    });
  });

  describe('getOrCreateOpprPlayerRanking', () => {
    it('should create ranking if it does not exist', async () => {
      const player = await createPlayer(createPlayerInput());

      const ranking = await getOrCreateOpprPlayerRanking(player.id);

      expect(ranking.playerId).toBe(player.id);
      expect(ranking.rating).toBe(1500);
    });

    it('should return existing ranking if it exists', async () => {
      const player = await createPlayer(createPlayerInput());
      const created = await createOpprPlayerRanking(
        createRatedOpprPlayerRankingInput(player.id, { rating: 1800 }),
      );

      const ranking = await getOrCreateOpprPlayerRanking(player.id);

      expect(ranking.id).toBe(created.id);
      expect(ranking.rating).toBe(1800);
    });
  });

  describe('findOpprPlayerRankingById', () => {
    it('should find ranking by ID', async () => {
      const player = await createPlayer(createPlayerInput());
      const created = await createOpprPlayerRanking({ playerId: player.id });

      const found = await findOpprPlayerRankingById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent ID', async () => {
      const found = await findOpprPlayerRankingById('non-existent-id');

      expect(found).toBeNull();
    });

    it('should support include option', async () => {
      const player = await createPlayer(createPlayerInput());
      const created = await createOpprPlayerRanking({ playerId: player.id });

      const found = await findOpprPlayerRankingById(created.id, { player: true });

      expect(found!.player).toBeDefined();
      expect(found!.player.id).toBe(player.id);
    });
  });

  describe('findOpprPlayerRankingByPlayerId', () => {
    it('should find ranking by player ID', async () => {
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player.id });

      const found = await findOpprPlayerRankingByPlayerId(player.id);

      expect(found).not.toBeNull();
      expect(found!.playerId).toBe(player.id);
    });

    it('should return null for non-existent player ID', async () => {
      const found = await findOpprPlayerRankingByPlayerId('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('findOpprPlayerRankings', () => {
    it('should return all rankings', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player1.id });
      await createOpprPlayerRanking({ playerId: player2.id });

      const rankings = await findOpprPlayerRankings();

      expect(rankings).toHaveLength(2);
    });

    it('should support pagination', async () => {
      for (let i = 0; i < 5; i++) {
        const player = await createPlayer(createPlayerInput());
        await createOpprPlayerRanking({ playerId: player.id });
      }

      const page1 = await findOpprPlayerRankings({ take: 2 });
      const page2 = await findOpprPlayerRankings({ take: 2, skip: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
    });

    it('should support where filter', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player1.id));
      await createOpprPlayerRanking(createOpprPlayerRankingInput(player2.id));

      const rated = await findOpprPlayerRankings({ where: { isRated: true } });

      expect(rated).toHaveLength(1);
    });
  });

  describe('getTopPlayersByOpprRating', () => {
    it('should return players ordered by rating descending', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const player3 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player1.id, { rating: 1400 }));
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player2.id, { rating: 1700 }));
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player3.id, { rating: 1500 }));

      const rankings = await getTopPlayersByOpprRating();

      expect(rankings[0].rating).toBe(1700);
      expect(rankings[1].rating).toBe(1500);
      expect(rankings[2].rating).toBe(1400);
    });

    it('should only return rated players', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player1.id));
      await createOpprPlayerRanking(createOpprPlayerRankingInput(player2.id, { rating: 2000 }));

      const rankings = await getTopPlayersByOpprRating();

      expect(rankings).toHaveLength(1);
      expect(rankings[0].isRated).toBe(true);
    });

    it('should respect limit', async () => {
      for (let i = 0; i < 10; i++) {
        const player = await createPlayer(createPlayerInput());
        await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player.id));
      }

      const rankings = await getTopPlayersByOpprRating(5);

      expect(rankings).toHaveLength(5);
    });

    it('should include player relation', async () => {
      const player = await createPlayer(createPlayerInput({ name: 'Test Player' }));
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player.id));

      const rankings = await getTopPlayersByOpprRating();

      expect(rankings[0].player).toBeDefined();
      expect(rankings[0].player.name).toBe('Test Player');
    });
  });

  describe('getTopPlayersByOpprRanking', () => {
    it('should return players ordered by ranking ascending', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const player3 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player1.id, { ranking: 10 }));
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player2.id, { ranking: 1 }));
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player3.id, { ranking: 5 }));

      const rankings = await getTopPlayersByOpprRanking();

      expect(rankings[0].ranking).toBe(1);
      expect(rankings[1].ranking).toBe(5);
      expect(rankings[2].ranking).toBe(10);
    });

    it('should exclude players with null ranking', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player1.id, { ranking: null }));
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player2.id, { ranking: 5 }));

      const rankings = await getTopPlayersByOpprRanking();

      expect(rankings).toHaveLength(1);
      expect(rankings[0].ranking).toBe(5);
    });

    it('should only return rated players', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking(
        createOpprPlayerRankingInput(player1.id, { ranking: 1, isRated: false }),
      );
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player2.id, { ranking: 5 }));

      const rankings = await getTopPlayersByOpprRanking();

      expect(rankings).toHaveLength(1);
      expect(rankings[0].ranking).toBe(5);
    });
  });

  describe('getRatedOpprPlayers', () => {
    it('should return only rated players', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player1.id));
      await createOpprPlayerRanking(createOpprPlayerRankingInput(player2.id));

      const rated = await getRatedOpprPlayers();

      expect(rated).toHaveLength(1);
      expect(rated[0].isRated).toBe(true);
    });

    it('should include player relation', async () => {
      const player = await createPlayer(createPlayerInput({ name: 'Rated Player' }));
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player.id));

      const rated = await getRatedOpprPlayers();

      expect(rated[0].player).toBeDefined();
      expect(rated[0].player.name).toBe('Rated Player');
    });
  });

  describe('updateOpprPlayerRanking', () => {
    it('should update rating fields', async () => {
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player.id });

      const updated = await updateOpprPlayerRanking(player.id, {
        rating: 1700,
        ratingDeviation: 150,
      });

      expect(updated.rating).toBe(1700);
      expect(updated.ratingDeviation).toBe(150);
    });

    it('should update ranking fields', async () => {
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player.id });

      const updated = await updateOpprPlayerRanking(player.id, {
        ranking: 10,
        isRated: true,
      });

      expect(updated.ranking).toBe(10);
      expect(updated.isRated).toBe(true);
    });

    it('should update lastRatingUpdate', async () => {
      const player = await createPlayer(createPlayerInput());
      const created = await createOpprPlayerRanking({ playerId: player.id });
      const originalUpdate = created.lastRatingUpdate;

      await new Promise((resolve) => setTimeout(resolve, 10));
      const updated = await updateOpprPlayerRanking(player.id, { rating: 1600 });

      expect(updated.lastRatingUpdate.getTime()).toBeGreaterThan(originalUpdate.getTime());
    });
  });

  describe('updateOpprRatingAfterTournament', () => {
    it('should update rating and create history record', async () => {
      const player = await createPlayer(createPlayerInput({ eventCount: 5 }));
      const tournament = await createTournament(createTournamentInput());
      await createOpprPlayerRanking({ playerId: player.id });

      const updated = await updateOpprRatingAfterTournament(
        player.id,
        1650,
        150,
        tournament.id,
        5,
      );

      expect(updated.rating).toBe(1650);
      expect(updated.ratingDeviation).toBe(150);
      expect(updated.isRated).toBe(true);

      const history = await getOpprRankingHistory(player.id);
      expect(history).toHaveLength(1);
      expect(history[0].changeType).toBe('TOURNAMENT_RESULT');
      expect(history[0].tournamentId).toBe(tournament.id);
    });

    it('should create ranking if it does not exist', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      const updated = await updateOpprRatingAfterTournament(player.id, 1600, 180, tournament.id);

      expect(updated.playerId).toBe(player.id);
      expect(updated.rating).toBe(1600);
    });

    it('should set isRated based on eventCount', async () => {
      const player = await createPlayer(createPlayerInput());
      const tournament = await createTournament(createTournamentInput());

      const updated4 = await updateOpprRatingAfterTournament(
        player.id,
        1600,
        180,
        tournament.id,
        4,
      );
      expect(updated4.isRated).toBe(false);

      const tournament2 = await createTournament(createTournamentInput());
      const updated5 = await updateOpprRatingAfterTournament(
        player.id,
        1650,
        170,
        tournament2.id,
        5,
      );
      expect(updated5.isRated).toBe(true);
    });
  });

  describe('updateWorldRankings', () => {
    it('should update rankings for multiple players', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player1.id });
      await createOpprPlayerRanking({ playerId: player2.id });

      await updateWorldRankings([
        { playerId: player1.id, ranking: 1 },
        { playerId: player2.id, ranking: 2 },
      ]);

      const ranking1 = await findOpprPlayerRankingByPlayerId(player1.id);
      const ranking2 = await findOpprPlayerRankingByPlayerId(player2.id);

      expect(ranking1!.ranking).toBe(1);
      expect(ranking2!.ranking).toBe(2);
    });

    it('should create history records for each update', async () => {
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player.id });

      await updateWorldRankings([{ playerId: player.id, ranking: 5 }]);

      const history = await getOpprRankingHistory(player.id);
      expect(history).toHaveLength(1);
      expect(history[0].changeType).toBe('RANKING_REFRESH');
      expect(history[0].ranking).toBe(5);
    });

    it('should skip non-existent players', async () => {
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player.id });

      await expect(
        updateWorldRankings([
          { playerId: player.id, ranking: 1 },
          { playerId: 'non-existent', ranking: 2 },
        ]),
      ).resolves.not.toThrow();

      const ranking = await findOpprPlayerRankingByPlayerId(player.id);
      expect(ranking!.ranking).toBe(1);
    });
  });

  describe('deleteOpprPlayerRanking', () => {
    it('should delete ranking', async () => {
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player.id });

      await deleteOpprPlayerRanking(player.id);

      const found = await findOpprPlayerRankingByPlayerId(player.id);
      expect(found).toBeNull();
    });

    it('should cascade delete history', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });
      await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1500,
        ratingDeviation: 200,
        isRated: false,
        changeType: 'INITIAL',
      });

      await deleteOpprPlayerRanking(player.id);

      const historyCount = await countOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
      });
      expect(historyCount).toBe(0);
    });
  });

  describe('countOpprPlayerRankings', () => {
    it('should count all rankings', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player1.id });
      await createOpprPlayerRanking({ playerId: player2.id });

      const count = await countOpprPlayerRankings();

      expect(count).toBe(2);
    });

    it('should count with filter', async () => {
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking(createRatedOpprPlayerRankingInput(player1.id));
      await createOpprPlayerRanking(createOpprPlayerRankingInput(player2.id));

      const count = await countOpprPlayerRankings({ isRated: true });

      expect(count).toBe(1);
    });
  });

  describe('createOpprRankingHistory', () => {
    it('should create history record', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });

      const history = await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1600,
        ratingDeviation: 150,
        isRated: true,
        changeType: 'TOURNAMENT_RESULT',
      });

      expect(history.id).toBeDefined();
      expect(history.rating).toBe(1600);
      expect(history.changeType).toBe('TOURNAMENT_RESULT');
    });

    it('should link to tournament', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });
      const tournament = await createTournament(createTournamentInput());

      const history = await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1600,
        ratingDeviation: 150,
        isRated: true,
        changeType: 'TOURNAMENT_RESULT',
        tournamentId: tournament.id,
      });

      expect(history.tournamentId).toBe(tournament.id);
    });

    it('should include notes', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });

      const history = await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1500,
        ratingDeviation: 200,
        isRated: false,
        changeType: 'MANUAL_ADJUSTMENT',
        notes: 'Admin correction',
      });

      expect(history.notes).toBe('Admin correction');
    });
  });

  describe('getOpprRankingHistory', () => {
    it('should return history ordered by createdAt descending', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });

      await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1500,
        ratingDeviation: 200,
        isRated: false,
        changeType: 'INITIAL',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1600,
        ratingDeviation: 180,
        isRated: true,
        changeType: 'TOURNAMENT_RESULT',
      });

      const history = await getOpprRankingHistory(player.id);

      expect(history).toHaveLength(2);
      expect(history[0].rating).toBe(1600); // Most recent first
      expect(history[1].rating).toBe(1500);
    });

    it('should respect limit', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });

      for (let i = 0; i < 5; i++) {
        await createOpprRankingHistory({
          opprPlayerRankingId: ranking.id,
          rating: 1500 + i * 10,
          ratingDeviation: 200,
          isRated: false,
          changeType: 'TOURNAMENT_RESULT',
        });
      }

      const history = await getOpprRankingHistory(player.id, 3);

      expect(history).toHaveLength(3);
    });

    it('should return empty array for non-existent player', async () => {
      const history = await getOpprRankingHistory('non-existent');

      expect(history).toHaveLength(0);
    });

    it('should include tournament relation', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });
      const tournament = await createTournament(createTournamentInput({ name: 'Test Tournament' }));

      await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1600,
        ratingDeviation: 150,
        isRated: true,
        changeType: 'TOURNAMENT_RESULT',
        tournamentId: tournament.id,
      });

      const history = await getOpprRankingHistory(player.id);

      expect(history[0].tournament).toBeDefined();
      expect(history[0].tournament!.name).toBe('Test Tournament');
    });
  });

  describe('getOpprRankingHistoryByDateRange', () => {
    it('should return history within date range', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1600,
        ratingDeviation: 150,
        isRated: true,
        changeType: 'TOURNAMENT_RESULT',
      });

      const history = await getOpprRankingHistoryByDateRange(player.id, oneHourAgo, oneHourFromNow);

      expect(history).toHaveLength(1);
    });

    it('should return empty for out of range', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });

      await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1600,
        ratingDeviation: 150,
        isRated: true,
        changeType: 'TOURNAMENT_RESULT',
      });

      const futureStart = new Date(Date.now() + 60 * 60 * 1000);
      const futureEnd = new Date(Date.now() + 2 * 60 * 60 * 1000);

      const history = await getOpprRankingHistoryByDateRange(player.id, futureStart, futureEnd);

      expect(history).toHaveLength(0);
    });

    it('should return empty for non-existent player', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const history = await getOpprRankingHistoryByDateRange('non-existent', oneHourAgo, oneHourFromNow);

      expect(history).toHaveLength(0);
    });
  });

  describe('getLatestOpprRankingHistory', () => {
    it('should return most recent history record', async () => {
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({ playerId: player.id });

      await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1500,
        ratingDeviation: 200,
        isRated: false,
        changeType: 'INITIAL',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await createOpprRankingHistory({
        opprPlayerRankingId: ranking.id,
        rating: 1700,
        ratingDeviation: 120,
        isRated: true,
        changeType: 'TOURNAMENT_RESULT',
      });

      const latest = await getLatestOpprRankingHistory(player.id);

      expect(latest).not.toBeNull();
      expect(latest!.rating).toBe(1700);
    });

    it('should return null for non-existent player', async () => {
      const latest = await getLatestOpprRankingHistory('non-existent');

      expect(latest).toBeNull();
    });

    it('should return null when no history exists', async () => {
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({ playerId: player.id });

      const latest = await getLatestOpprRankingHistory(player.id);

      expect(latest).toBeNull();
    });
  });

  describe('applyRDDecayForInactivePlayers', () => {
    it('should return 0 when no inactive players', async () => {
      // Create a player with recent rating update
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({
        playerId: player.id,
        rating: 1600,
        ratingDeviation: 100,
      });

      const updatedCount = await applyRDDecayForInactivePlayers(30);

      expect(updatedCount).toBe(0);
    });

    it('should apply RD decay to inactive players', async () => {
      // Create a player with old rating update
      const player = await createPlayer(createPlayerInput());
      const ranking = await createOpprPlayerRanking({
        playerId: player.id,
        rating: 1600,
        ratingDeviation: 100,
      });

      // Manually update lastRatingUpdate to 60 days ago
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      await updateOpprPlayerRanking(player.id, {
        lastRatingUpdate: sixtyDaysAgo,
      });

      const updatedCount = await applyRDDecayForInactivePlayers(30, 0.3, 200);

      expect(updatedCount).toBe(1);

      // Verify RD was increased
      const updatedRanking = await findOpprPlayerRankingByPlayerId(player.id);
      expect(updatedRanking!.ratingDeviation).toBeGreaterThan(100);

      // Verify history was created
      const history = await getOpprRankingHistory(player.id);
      expect(history.length).toBe(1);
      expect(history[0].changeType).toBe('RD_DECAY');
    });

    it('should not exceed maxRD when applying decay', async () => {
      // Create a player with RD close to max
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({
        playerId: player.id,
        rating: 1600,
        ratingDeviation: 190,
      });

      // Set lastRatingUpdate to 100 days ago
      const hundredDaysAgo = new Date();
      hundredDaysAgo.setDate(hundredDaysAgo.getDate() - 100);
      await updateOpprPlayerRanking(player.id, {
        lastRatingUpdate: hundredDaysAgo,
      });

      await applyRDDecayForInactivePlayers(30, 0.3, 200);

      const updatedRanking = await findOpprPlayerRankingByPlayerId(player.id);
      expect(updatedRanking!.ratingDeviation).toBe(200);
    });

    it('should not apply decay to players already at maxRD', async () => {
      // Create a player already at max RD
      const player = await createPlayer(createPlayerInput());
      await createOpprPlayerRanking({
        playerId: player.id,
        rating: 1600,
        ratingDeviation: 200,
      });

      // Set lastRatingUpdate to 60 days ago
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      await updateOpprPlayerRanking(player.id, {
        lastRatingUpdate: sixtyDaysAgo,
      });

      const updatedCount = await applyRDDecayForInactivePlayers(30, 0.3, 200);

      expect(updatedCount).toBe(0);
    });
  });
});
