import { describe, it, expect } from 'vitest';
import {
  createStanding,
  createManyStandings,
  findStandingById,
  findStandingByPlayerAndTournament,
  findStandings,
  getPlayerStandings,
  getTournamentStandings,
  getQualifyingStandings,
  getFinalsStandings,
  getMergedStandings,
  getPlayerTopFinishes,
  updateStanding,
  updateStandingPoints,
  deleteStanding,
  deleteStandingsByTournament,
  countStandings,
  getPlayerStats,
  recalculateTimeDecay,
} from '../src/standings.js';
import { createTournament } from '../src/tournaments.js';
import { createPlayer } from '../src/players.js';
import { createTournamentInput } from './factories/tournament.factory.js';
import { createPlayerInput } from './factories/player.factory.js';

describe('standings', () => {
  describe('createStanding', () => {
    it('should create a qualifying standing', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      const standing = await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
        isFinals: false,
        totalPoints: 100,
      });

      expect(standing.id).toBeDefined();
      expect(standing.tournamentId).toBe(tournament.id);
      expect(standing.playerId).toBe(player.id);
      expect(standing.position).toBe(1);
      expect(standing.isFinals).toBe(false);
      expect(standing.totalPoints).toBe(100);
    });

    it('should create a finals standing', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      const standing = await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
        isFinals: true,
      });

      expect(standing.isFinals).toBe(true);
    });

    it('should default isFinals to false', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      const standing = await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
      });

      expect(standing.isFinals).toBe(false);
    });

    it('should set decayedPoints from totalPoints if not provided', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      const standing = await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
        totalPoints: 150,
      });

      expect(standing.decayedPoints).toBe(150);
    });
  });

  describe('createManyStandings', () => {
    it('should create multiple standings at once', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());

      const result = await createManyStandings([
        { tournamentId: tournament.id, playerId: player1.id, position: 1 },
        { tournamentId: tournament.id, playerId: player2.id, position: 2 },
      ]);

      expect(result.count).toBe(2);
    });
  });

  describe('findStandingById', () => {
    it('should find a standing by ID', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const created = await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
      });

      const found = await findStandingById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent ID', async () => {
      const found = await findStandingById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findStandingByPlayerAndTournament', () => {
    it('should find by player, tournament, and isFinals', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
        isFinals: false,
      });

      const found = await findStandingByPlayerAndTournament(player.id, tournament.id, false);
      expect(found).not.toBeNull();
      expect(found!.isFinals).toBe(false);
    });

    it('should distinguish between qualifying and finals', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 5,
        isFinals: false,
      });
      await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 2,
        isFinals: true,
      });

      const qualifying = await findStandingByPlayerAndTournament(player.id, tournament.id, false);
      const finals = await findStandingByPlayerAndTournament(player.id, tournament.id, true);

      expect(qualifying!.position).toBe(5);
      expect(finals!.position).toBe(2);
    });
  });

  describe('findStandings', () => {
    it('should find standings with filters', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
      });

      const standings = await findStandings({
        where: { tournamentId: tournament.id },
      });

      expect(standings).toHaveLength(1);
    });

    it('should support pagination', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());
      const player3 = await createPlayer(createPlayerInput());

      await createStanding({ tournamentId: tournament.id, playerId: player1.id, position: 1 });
      await createStanding({ tournamentId: tournament.id, playerId: player2.id, position: 2 });
      await createStanding({ tournamentId: tournament.id, playerId: player3.id, position: 3 });

      const standings = await findStandings({
        where: { tournamentId: tournament.id },
        take: 2,
        skip: 1,
        orderBy: { position: 'asc' },
      });

      expect(standings).toHaveLength(2);
      expect(standings[0].position).toBe(2);
    });
  });

  describe('getPlayerStandings', () => {
    it('should get all standings for a player', async () => {
      const tournament1 = await createTournament(createTournamentInput());
      const tournament2 = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      await createStanding({ tournamentId: tournament1.id, playerId: player.id, position: 1 });
      await createStanding({ tournamentId: tournament2.id, playerId: player.id, position: 3 });

      const standings = await getPlayerStandings(player.id);
      expect(standings).toHaveLength(2);
    });
  });

  describe('getTournamentStandings', () => {
    it('should get all standings for a tournament', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());

      await createStanding({ tournamentId: tournament.id, playerId: player1.id, position: 1 });
      await createStanding({ tournamentId: tournament.id, playerId: player2.id, position: 2 });

      const standings = await getTournamentStandings(tournament.id);
      expect(standings).toHaveLength(2);
      expect(standings[0].position).toBe(1);
    });
  });

  describe('getQualifyingStandings', () => {
    it('should only get qualifying standings', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());

      await createStanding({
        tournamentId: tournament.id,
        playerId: player1.id,
        position: 1,
        isFinals: false,
      });
      await createStanding({
        tournamentId: tournament.id,
        playerId: player2.id,
        position: 1,
        isFinals: true,
      });

      const standings = await getQualifyingStandings(tournament.id);
      expect(standings).toHaveLength(1);
      expect(standings[0].isFinals).toBe(false);
    });
  });

  describe('getFinalsStandings', () => {
    it('should only get finals standings', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());

      await createStanding({
        tournamentId: tournament.id,
        playerId: player1.id,
        position: 1,
        isFinals: false,
      });
      await createStanding({
        tournamentId: tournament.id,
        playerId: player2.id,
        position: 1,
        isFinals: true,
      });

      const standings = await getFinalsStandings(tournament.id);
      expect(standings).toHaveLength(1);
      expect(standings[0].isFinals).toBe(true);
    });
  });

  describe('getMergedStandings', () => {
    it('should merge qualifying and finals standings correctly', async () => {
      const tournament = await createTournament(createTournamentInput());
      const finalist1 = await createPlayer(createPlayerInput());
      const finalist2 = await createPlayer(createPlayerInput());
      const nonFinalist = await createPlayer(createPlayerInput());

      // Qualifying standings
      await createStanding({
        tournamentId: tournament.id,
        playerId: finalist1.id,
        position: 1,
        isFinals: false,
      });
      await createStanding({
        tournamentId: tournament.id,
        playerId: finalist2.id,
        position: 2,
        isFinals: false,
      });
      await createStanding({
        tournamentId: tournament.id,
        playerId: nonFinalist.id,
        position: 3,
        isFinals: false,
      });

      // Finals standings (only finalist1 and finalist2 made finals)
      await createStanding({
        tournamentId: tournament.id,
        playerId: finalist2.id,
        position: 1,
        isFinals: true,
      });
      await createStanding({
        tournamentId: tournament.id,
        playerId: finalist1.id,
        position: 2,
        isFinals: true,
      });

      const merged = await getMergedStandings(tournament.id);

      // Finalists get finals position, non-finalist gets finalistCount + 1
      expect(merged).toHaveLength(3);

      const finalist2Merged = merged.find((s) => s.playerId === finalist2.id);
      const finalist1Merged = merged.find((s) => s.playerId === finalist1.id);
      const nonFinalistMerged = merged.find((s) => s.playerId === nonFinalist.id);

      expect(finalist2Merged!.mergedPosition).toBe(1);
      expect(finalist2Merged!.isFinalist).toBe(true);

      expect(finalist1Merged!.mergedPosition).toBe(2);
      expect(finalist1Merged!.isFinalist).toBe(true);

      expect(nonFinalistMerged!.mergedPosition).toBe(3); // 2 finalists + 1
      expect(nonFinalistMerged!.isFinalist).toBe(false);
    });
  });

  describe('getPlayerTopFinishes', () => {
    it('should get top finishes ordered by decayed points', async () => {
      const tournament1 = await createTournament(createTournamentInput());
      const tournament2 = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      await createStanding({
        tournamentId: tournament1.id,
        playerId: player.id,
        position: 1,
        totalPoints: 100,
        decayedPoints: 100,
      });
      await createStanding({
        tournamentId: tournament2.id,
        playerId: player.id,
        position: 2,
        totalPoints: 80,
        decayedPoints: 60,
      });

      const topFinishes = await getPlayerTopFinishes(player.id, 2);
      expect(topFinishes).toHaveLength(2);
      expect(topFinishes[0].decayedPoints).toBe(100);
    });
  });

  describe('updateStanding', () => {
    it('should update standing properties', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const standing = await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 2,
      });

      const updated = await updateStanding(standing.id, {
        position: 1,
        totalPoints: 150,
      });

      expect(updated.position).toBe(1);
      expect(updated.totalPoints).toBe(150);
    });
  });

  describe('updateStandingPoints', () => {
    it('should update points and calculate decay', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const standing = await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
      });

      const updated = await updateStandingPoints(standing.id, 20, 80, 100);

      expect(updated.linearPoints).toBe(20);
      expect(updated.dynamicPoints).toBe(80);
      expect(updated.totalPoints).toBe(100);
      expect(updated.ageInDays).toBeDefined();
      expect(updated.decayMultiplier).toBeDefined();
      expect(updated.decayedPoints).toBeDefined();
    });

    it('should throw error for non-existent standing', async () => {
      await expect(updateStandingPoints('non-existent-id', 20, 80, 100)).rejects.toThrow(
        'Standing with id non-existent-id not found',
      );
    });
  });

  describe('deleteStanding', () => {
    it('should delete a standing', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());
      const standing = await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
      });

      await deleteStanding(standing.id);
      const found = await findStandingById(standing.id);
      expect(found).toBeNull();
    });
  });

  describe('deleteStandingsByTournament', () => {
    it('should delete all standings for a tournament', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());

      await createStanding({ tournamentId: tournament.id, playerId: player1.id, position: 1 });
      await createStanding({ tournamentId: tournament.id, playerId: player2.id, position: 2 });

      const result = await deleteStandingsByTournament(tournament.id);
      expect(result.count).toBe(2);
    });
  });

  describe('countStandings', () => {
    it('should count standings', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player1 = await createPlayer(createPlayerInput());
      const player2 = await createPlayer(createPlayerInput());

      await createStanding({ tournamentId: tournament.id, playerId: player1.id, position: 1 });
      await createStanding({ tournamentId: tournament.id, playerId: player2.id, position: 2 });

      const count = await countStandings({ tournamentId: tournament.id });
      expect(count).toBe(2);
    });
  });

  describe('getPlayerStats', () => {
    it('should calculate player statistics', async () => {
      const tournament1 = await createTournament(createTournamentInput());
      const tournament2 = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      await createStanding({
        tournamentId: tournament1.id,
        playerId: player.id,
        position: 1,
        totalPoints: 100,
        decayedPoints: 100,
        efficiency: 0.9,
      });
      await createStanding({
        tournamentId: tournament2.id,
        playerId: player.id,
        position: 3,
        totalPoints: 60,
        decayedPoints: 45,
        efficiency: 0.7,
      });

      const stats = await getPlayerStats(player.id);
      expect(stats).not.toBeNull();
      expect(stats!.totalEvents).toBe(2);
      expect(stats!.totalPoints).toBe(160);
      expect(stats!.totalDecayedPoints).toBe(145);
      expect(stats!.averagePoints).toBe(80);
      expect(stats!.averagePosition).toBe(2);
      expect(stats!.firstPlaceFinishes).toBe(1);
      expect(stats!.topThreeFinishes).toBe(2);
      expect(stats!.bestFinish).toBe(1);
      expect(stats!.highestPoints).toBe(100);
    });

    it('should return null for player with no standings', async () => {
      const player = await createPlayer(createPlayerInput());
      const stats = await getPlayerStats(player.id);
      expect(stats).toBeNull();
    });
  });

  describe('recalculateTimeDecay', () => {
    it('should recalculate decay for all standings', async () => {
      const tournament = await createTournament(createTournamentInput());
      const player = await createPlayer(createPlayerInput());

      await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
        totalPoints: 100,
      });

      const updated = await recalculateTimeDecay();
      expect(updated.length).toBeGreaterThan(0);
      expect(updated[0].ageInDays).toBeDefined();
      expect(updated[0].decayMultiplier).toBeDefined();
    });

    it('should use reference date for decay calculation', async () => {
      const oldDate = new Date('2022-01-01');
      const tournament = await createTournament(
        createTournamentInput({
          date: oldDate,
        }),
      );
      const player = await createPlayer(createPlayerInput());

      await createStanding({
        tournamentId: tournament.id,
        playerId: player.id,
        position: 1,
        totalPoints: 100,
      });

      // Reference date 4 years after tournament
      const referenceDate = new Date('2026-01-01');
      const updated = await recalculateTimeDecay(referenceDate);

      // Tournament is > 3 years old, so decay should be 0
      const standing = updated.find((s) => s.tournamentId === tournament.id);
      expect(standing!.decayMultiplier).toBe(0);
      expect(standing!.decayedPoints).toBe(0);
    });
  });
});
