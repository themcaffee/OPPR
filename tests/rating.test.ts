import { describe, it, expect } from 'vitest';
import {
  updateRating,
  applyRDDecay,
  simulateTournamentMatches,
  createNewPlayerRating,
  isProvisionalRating,
} from '../src/rating.js';
import type { RatingUpdate, PlayerResult, Player } from '../src/types.js';
import { RATING } from '../src/constants.js';

describe('updateRating', () => {
  it('should return unchanged rating when no results', () => {
    const update: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [],
    };

    const result = updateRating(update);
    expect(result.newRating).toBe(1500);
    expect(result.newRD).toBe(100);
  });

  it('should increase rating after a win against equal opponent', () => {
    const update: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [
        {
          opponentRating: 1500,
          opponentRD: 100,
          score: 1, // Win
        },
      ],
    };

    const result = updateRating(update);
    expect(result.newRating).toBeGreaterThan(1500);
  });

  it('should decrease rating after a loss against equal opponent', () => {
    const update: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [
        {
          opponentRating: 1500,
          opponentRD: 100,
          score: 0, // Loss
        },
      ],
    };

    const result = updateRating(update);
    expect(result.newRating).toBeLessThan(1500);
  });

  it('should barely change rating after draw against equal opponent', () => {
    const update: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [
        {
          opponentRating: 1500,
          opponentRD: 100,
          score: 0.5, // Draw
        },
      ],
    };

    const result = updateRating(update);
    // Draw against equal opponent should result in minimal change
    expect(Math.abs(result.newRating - 1500)).toBeLessThan(5);
  });

  it('should increase rating more when beating stronger opponent', () => {
    const weakerWin: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [{ opponentRating: 1400, opponentRD: 100, score: 1 }],
    };

    const strongerWin: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [{ opponentRating: 1600, opponentRD: 100, score: 1 }],
    };

    const weakerResult = updateRating(weakerWin);
    const strongerResult = updateRating(strongerWin);

    expect(strongerResult.newRating - 1500).toBeGreaterThan(weakerResult.newRating - 1500);
  });

  it('should decrease rating less when losing to stronger opponent', () => {
    const weakerLoss: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [{ opponentRating: 1400, opponentRD: 100, score: 0 }],
    };

    const strongerLoss: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [{ opponentRating: 1600, opponentRD: 100, score: 0 }],
    };

    const weakerResult = updateRating(weakerLoss);
    const strongerResult = updateRating(strongerLoss);

    expect(1500 - weakerResult.newRating).toBeGreaterThan(1500 - strongerResult.newRating);
  });

  it('should handle multiple results', () => {
    const update: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [
        { opponentRating: 1600, opponentRD: 80, score: 1 }, // Win vs stronger
        { opponentRating: 1550, opponentRD: 90, score: 0 }, // Loss vs similar
        { opponentRating: 1450, opponentRD: 85, score: 1 }, // Win vs weaker
      ],
    };

    const result = updateRating(update);
    // Should increase overall (2 wins, 1 loss)
    expect(result.newRating).toBeGreaterThan(1500);
    expect(result.newRating).toBeLessThan(1600); // Reasonable bound
  });

  it('should decrease RD (increase certainty) after playing', () => {
    const update: RatingUpdate = {
      currentRating: 1500,
      currentRD: 150,
      results: [
        { opponentRating: 1500, opponentRD: 100, score: 1 },
        { opponentRating: 1450, opponentRD: 100, score: 1 },
      ],
    };

    const result = updateRating(update);
    expect(result.newRD).toBeLessThan(150);
  });

  it('should clamp RD to MIN_RD', () => {
    const update: RatingUpdate = {
      currentRating: 1500,
      currentRD: 15, // Already very low
      results: [
        { opponentRating: 1500, opponentRD: 10, score: 1 },
        { opponentRating: 1500, opponentRD: 10, score: 1 },
        { opponentRating: 1500, opponentRD: 10, score: 1 },
      ],
    };

    const result = updateRating(update);
    expect(result.newRD).toBeGreaterThanOrEqual(RATING.MIN_RD);
  });

  it('should clamp RD to MAX_RD', () => {
    const update: RatingUpdate = {
      currentRating: 1500,
      currentRD: RATING.MAX_RD,
      results: [{ opponentRating: 1500, opponentRD: RATING.MAX_RD, score: 1 }],
    };

    const result = updateRating(update);
    expect(result.newRD).toBeLessThanOrEqual(RATING.MAX_RD);
  });

  it('should round rating to 2 decimal places', () => {
    const update: RatingUpdate = {
      currentRating: 1500.123456,
      currentRD: 100,
      results: [{ opponentRating: 1500, opponentRD: 100, score: 1 }],
    };

    const result = updateRating(update);
    const decimalPlaces = (result.newRating.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  it('should handle extreme rating differences', () => {
    const update: RatingUpdate = {
      currentRating: 1000,
      currentRD: 100,
      results: [
        { opponentRating: 2000, opponentRD: 50, score: 0 }, // Loss to much stronger
      ],
    };

    const result = updateRating(update);
    // Should change very little (expected result)
    expect(result.newRating).toBeGreaterThan(900);
    expect(result.newRating).toBeLessThan(1100);
  });

  it('should handle opponent with high RD (uncertain rating)', () => {
    const certainOpponent: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [{ opponentRating: 1600, opponentRD: 10, score: 1 }],
    };

    const uncertainOpponent: RatingUpdate = {
      currentRating: 1500,
      currentRD: 100,
      results: [{ opponentRating: 1600, opponentRD: 200, score: 1 }],
    };

    const certainResult = updateRating(certainOpponent);
    const uncertainResult = updateRating(uncertainOpponent);

    // Win against certain opponent should change rating more
    expect(certainResult.newRating - 1500).toBeGreaterThan(uncertainResult.newRating - 1500);
  });
});

describe('applyRDDecay', () => {
  it('should increase RD with inactivity', () => {
    const currentRD = 50;
    const daysSinceLastEvent = 100;

    const newRD = applyRDDecay(currentRD, daysSinceLastEvent);
    expect(newRD).toBeGreaterThan(currentRD);
  });

  it('should increase RD by exactly RD_DECAY_PER_DAY per day', () => {
    const currentRD = 50;
    const days = 10;

    const newRD = applyRDDecay(currentRD, days);
    expect(newRD).toBe(currentRD + days * RATING.RD_DECAY_PER_DAY);
  });

  it('should return same RD for zero days inactive', () => {
    const currentRD = 100;
    const newRD = applyRDDecay(currentRD, 0);
    expect(newRD).toBe(currentRD);
  });

  it('should cap RD at MAX_RD', () => {
    const currentRD = 150;
    const days = 1000; // Very long time

    const newRD = applyRDDecay(currentRD, days);
    expect(newRD).toBe(RATING.MAX_RD);
  });

  it('should reach MAX_RD exactly', () => {
    const currentRD = 100;
    const daysToMax = (RATING.MAX_RD - currentRD) / RATING.RD_DECAY_PER_DAY;

    const newRD = applyRDDecay(currentRD, daysToMax);
    expect(newRD).toBe(RATING.MAX_RD);
  });

  it('should not exceed MAX_RD even with extra days', () => {
    const currentRD = 100;
    const daysToMax = (RATING.MAX_RD - currentRD) / RATING.RD_DECAY_PER_DAY;
    const extraDays = 100;

    const newRD = applyRDDecay(currentRD, daysToMax + extraDays);
    expect(newRD).toBe(RATING.MAX_RD);
  });

  it('should handle already maxed RD', () => {
    const newRD = applyRDDecay(RATING.MAX_RD, 100);
    expect(newRD).toBe(RATING.MAX_RD);
  });

  it('should handle decimal days', () => {
    const currentRD = 50;
    const days = 10.5;

    const newRD = applyRDDecay(currentRD, days);
    expect(newRD).toBe(currentRD + days * RATING.RD_DECAY_PER_DAY);
  });
});

describe('simulateTournamentMatches', () => {
  const createPlayer = (id: string, rating: number, rd = 100): Player => ({
    id,
    rating,
    ranking: parseInt(id),
    isRated: true,
    ratingDeviation: rd,
  });

  it('should create wins for players below and losses for players above', () => {
    const results: PlayerResult[] = [
      { player: createPlayer('1', 1800), position: 1 },
      { player: createPlayer('2', 1700), position: 2 },
      { player: createPlayer('3', 1600), position: 3 },
    ];

    const matches = simulateTournamentMatches(2, results);

    // Player in 2nd should have: 1 loss (to 1st), 1 win (vs 3rd)
    expect(matches).toHaveLength(2);
    expect(matches.find((m) => m.opponentRating === 1800)?.score).toBe(0); // Loss
    expect(matches.find((m) => m.opponentRating === 1600)?.score).toBe(1); // Win
  });

  it('should handle ties correctly', () => {
    const results: PlayerResult[] = [
      { player: createPlayer('1', 1800), position: 1 },
      { player: createPlayer('2', 1700), position: 2 },
      { player: createPlayer('3', 1600), position: 2 }, // Tied for 2nd
    ];

    const matches = simulateTournamentMatches(2, results);

    // Should have tie (score 0.5) with other 2nd place player
    expect(matches.some((m) => m.score === 0.5)).toBe(true);
  });

  it('should limit to OPPONENTS_RANGE above and below', () => {
    const results: PlayerResult[] = [];
    // Create 100 players
    for (let i = 1; i <= 100; i++) {
      results.push({ player: createPlayer(i.toString(), 1500), position: i });
    }

    const matches = simulateTournamentMatches(50, results);

    // Should have at most 32 + 32 = 64 opponents (excluding self)
    expect(matches.length).toBeLessThanOrEqual(RATING.OPPONENTS_RANGE * 2);
  });

  it('should not include self in matches', () => {
    const player = createPlayer('2', 1700);
    const results: PlayerResult[] = [
      { player: createPlayer('1', 1800), position: 1 },
      { player, position: 2 },
      { player: createPlayer('3', 1600), position: 3 },
    ];

    const matches = simulateTournamentMatches(2, results);

    // Should not have a match against self
    expect(matches.every((m) => m.opponentRating !== 1700)).toBe(true);
  });

  it('should return empty array if player position not found', () => {
    const results: PlayerResult[] = [
      { player: createPlayer('1', 1800), position: 1 },
      { player: createPlayer('2', 1700), position: 2 },
    ];

    const matches = simulateTournamentMatches(99, results);
    expect(matches).toEqual([]);
  });

  it('should handle first place player (all wins)', () => {
    const results: PlayerResult[] = [
      { player: createPlayer('1', 1800), position: 1 },
      { player: createPlayer('2', 1700), position: 2 },
      { player: createPlayer('3', 1600), position: 3 },
    ];

    const matches = simulateTournamentMatches(1, results);

    // All matches should be wins (score = 1)
    expect(matches.every((m) => m.score === 1)).toBe(true);
    expect(matches).toHaveLength(2);
  });

  it('should handle last place player (all losses)', () => {
    const results: PlayerResult[] = [
      { player: createPlayer('1', 1800), position: 1 },
      { player: createPlayer('2', 1700), position: 2 },
      { player: createPlayer('3', 1600), position: 3 },
    ];

    const matches = simulateTournamentMatches(3, results);

    // All matches should be losses (score = 0)
    expect(matches.every((m) => m.score === 0)).toBe(true);
    expect(matches).toHaveLength(2);
  });

  it('should use DEFAULT_RATING for RD if not provided', () => {
    const playerWithoutRD: Player = {
      id: '1',
      rating: 1500,
      ranking: 1,
      isRated: true,
      // ratingDeviation not set
    };

    const results: PlayerResult[] = [
      { player: playerWithoutRD, position: 1 },
      { player: createPlayer('2', 1600), position: 2 },
    ];

    const matches = simulateTournamentMatches(2, results);
    expect(matches[0].opponentRD).toBe(RATING.DEFAULT_RATING);
  });

  it('should handle small tournament (< OPPONENTS_RANGE)', () => {
    const results: PlayerResult[] = [
      { player: createPlayer('1', 1800), position: 1 },
      { player: createPlayer('2', 1700), position: 2 },
      { player: createPlayer('3', 1600), position: 3 },
      { player: createPlayer('4', 1500), position: 4 },
      { player: createPlayer('5', 1400), position: 5 },
    ];

    const matches = simulateTournamentMatches(3, results);

    // Should include all other players (4 opponents)
    expect(matches).toHaveLength(4);
  });

  it('should correctly order unsorted results', () => {
    const results: PlayerResult[] = [
      { player: createPlayer('3', 1600), position: 3 },
      { player: createPlayer('1', 1800), position: 1 },
      { player: createPlayer('2', 1700), position: 2 },
    ];

    const matches = simulateTournamentMatches(2, results);

    // Should still correctly identify wins and losses
    expect(matches.find((m) => m.opponentRating === 1800)?.score).toBe(0); // Loss
    expect(matches.find((m) => m.opponentRating === 1600)?.score).toBe(1); // Win
  });
});

describe('createNewPlayerRating', () => {
  it('should return default rating and max RD', () => {
    const newPlayer = createNewPlayerRating();
    expect(newPlayer.rating).toBe(RATING.DEFAULT_RATING);
    expect(newPlayer.rd).toBe(RATING.MAX_RD);
  });

  it('should return object with rating and rd properties', () => {
    const newPlayer = createNewPlayerRating();
    expect(newPlayer).toHaveProperty('rating');
    expect(newPlayer).toHaveProperty('rd');
  });

  it('should return consistent values on multiple calls', () => {
    const player1 = createNewPlayerRating();
    const player2 = createNewPlayerRating();
    expect(player1.rating).toBe(player2.rating);
    expect(player1.rd).toBe(player2.rd);
  });

  it('should match expected constants', () => {
    const newPlayer = createNewPlayerRating();
    expect(newPlayer.rating).toBe(1300);
    expect(newPlayer.rd).toBe(200);
  });
});

describe('isProvisionalRating', () => {
  it('should return true for players with fewer than 5 events', () => {
    expect(isProvisionalRating(0)).toBe(true);
    expect(isProvisionalRating(1)).toBe(true);
    expect(isProvisionalRating(2)).toBe(true);
    expect(isProvisionalRating(3)).toBe(true);
    expect(isProvisionalRating(4)).toBe(true);
  });

  it('should return false for players with 5 or more events', () => {
    expect(isProvisionalRating(5)).toBe(false);
    expect(isProvisionalRating(6)).toBe(false);
    expect(isProvisionalRating(10)).toBe(false);
    expect(isProvisionalRating(100)).toBe(false);
  });

  it('should handle edge case at threshold', () => {
    expect(isProvisionalRating(4)).toBe(true);
    expect(isProvisionalRating(5)).toBe(false);
  });

  it('should handle large event counts', () => {
    expect(isProvisionalRating(1000)).toBe(false);
  });
});
