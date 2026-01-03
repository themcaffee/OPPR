import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePlayerRatingContribution,
  calculateRatingTVA,
  ratingContributesToTVA,
  getTopRatedPlayers,
} from '../src/tva-rating.js';
import { resetConfig, configureOPPR } from '../src/config.js';
import type { Player } from '../src/types.js';
import { createPlayer, getGlickoRating } from './test-helpers.js';

beforeEach(() => {
  resetConfig();
});

describe('calculatePlayerRatingContribution', () => {
  it('should calculate contribution for perfect player (2000 rating)', () => {
    const contribution = calculatePlayerRatingContribution(2000);
    expect(contribution).toBeCloseTo(0.39, 2);
  });

  it('should return 0 for players below threshold (1285.71)', () => {
    const contribution = calculatePlayerRatingContribution(1200);
    expect(contribution).toBe(0);
  });

  it('should return positive value for players above threshold', () => {
    const contribution = calculatePlayerRatingContribution(1500);
    expect(contribution).toBeGreaterThan(0);
  });

  it('should increase with higher ratings', () => {
    const low = calculatePlayerRatingContribution(1400);
    const high = calculatePlayerRatingContribution(1800);
    expect(high).toBeGreaterThan(low);
  });
});

describe('calculateRatingTVA', () => {
  it('should calculate TVA for multiple players', () => {
    const players: Player[] = [
      createPlayer('1', 2000, 1, true),
      createPlayer('2', 1800, 5, true),
      createPlayer('3', 1600, 10, true),
    ];

    const tva = calculateRatingTVA(players);
    expect(tva).toBeGreaterThan(0);
    expect(tva).toBeLessThanOrEqual(25);
  });

  it('should cap at maximum of 25 points', () => {
    // Create 64 perfect players
    const players: Player[] = Array.from({ length: 64 }, (_, i) =>
      createPlayer(`${i}`, 2000, i + 1, true)
    );

    const tva = calculateRatingTVA(players);
    expect(tva).toBeCloseTo(25, 1);
  });

  it('should only consider top 64 players', () => {
    // Create 100 players, first 64 with rating 2000, rest with 1500
    const players: Player[] = [
      ...Array.from({ length: 64 }, (_, i) => createPlayer(`top${i}`, 2000, i + 1, true)),
      ...Array.from({ length: 36 }, (_, i) => createPlayer(`bottom${i}`, 1500, i + 65, true)),
    ];

    const tva = calculateRatingTVA(players);
    expect(tva).toBeCloseTo(25, 1);
  });

  it('should return 0 for players all below threshold', () => {
    const players: Player[] = [
      createPlayer('1', 1200, 100, true),
      createPlayer('2', 1100, 200, true),
    ];

    const tva = calculateRatingTVA(players);
    expect(tva).toBe(0);
  });
});

describe('ratingContributesToTVA', () => {
  it('should return true for ratings above threshold', () => {
    expect(ratingContributesToTVA(1300)).toBe(true);
    expect(ratingContributesToTVA(1500)).toBe(true);
    expect(ratingContributesToTVA(2000)).toBe(true);
  });

  it('should return false for ratings at or below threshold', () => {
    expect(ratingContributesToTVA(1285)).toBe(false);
    expect(ratingContributesToTVA(1200)).toBe(false);
    expect(ratingContributesToTVA(1000)).toBe(false);
  });
});

describe('getTopRatedPlayers', () => {
  it('should return top rated players sorted by rating', () => {
    const players: Player[] = [
      createPlayer('1', 1500, 50, true),
      createPlayer('2', 1800, 10, true),
      createPlayer('3', 1600, 30, true),
    ];

    const topPlayers = getTopRatedPlayers(players, 2);
    expect(topPlayers).toHaveLength(2);
    expect(getGlickoRating(topPlayers[0])).toBe(1800);
    expect(getGlickoRating(topPlayers[1])).toBe(1600);
  });

  it('should return all players if count exceeds array length', () => {
    const players: Player[] = [
      createPlayer('1', 1500, 50, true),
      createPlayer('2', 1800, 10, true),
    ];

    const topPlayers = getTopRatedPlayers(players, 10);
    expect(topPlayers).toHaveLength(2);
  });
});

describe('Configuration Tests', () => {
  describe('calculatePlayerRatingContribution with custom config', () => {
    it('should use custom COEFFICIENT', () => {
      // Default: 2000 * 0.000546875 - 0.703125 = 0.39
      const defaultContribution = calculatePlayerRatingContribution(2000);
      expect(defaultContribution).toBeCloseTo(0.39, 2);

      // Custom: 2000 * 0.001 - 0.703125 = 1.297
      configureOPPR({ TVA: { RATING: { COEFFICIENT: 0.001 } } });
      const customContribution = calculatePlayerRatingContribution(2000);
      expect(customContribution).toBeCloseTo(1.297, 2);
    });

    it('should use custom OFFSET', () => {
      // Default: 1500 * 0.000546875 - 0.703125 = 0.117
      const defaultContribution = calculatePlayerRatingContribution(1500);
      expect(defaultContribution).toBeCloseTo(0.117, 2);

      // Custom: 1500 * 0.000546875 - 0.5 = 0.320
      configureOPPR({ TVA: { RATING: { OFFSET: 0.5 } } });
      const customContribution = calculatePlayerRatingContribution(1500);
      expect(customContribution).toBeCloseTo(0.32, 2);
    });

    it('should combine custom COEFFICIENT and OFFSET', () => {
      configureOPPR({
        TVA: {
          RATING: {
            COEFFICIENT: 0.001,
            OFFSET: 1.0,
          },
        },
      });

      // 2000 * 0.001 - 1.0 = 1.0
      const contribution = calculatePlayerRatingContribution(2000);
      expect(contribution).toBeCloseTo(1.0, 2);
    });
  });

  describe('calculateRatingTVA with custom config', () => {
    it('should use custom MAX_VALUE', () => {
      // Create 64 perfect players (2000 rating each)
      const players: Player[] = Array.from({ length: 64 }, (_, i) =>
        createPlayer(`${i}`, 2000, i + 1, true)
      );

      // Default: MAX_VALUE = 25
      const defaultTVA = calculateRatingTVA(players);
      expect(defaultTVA).toBe(25);

      // Custom: MAX_VALUE = 50
      configureOPPR({ TVA: { RATING: { MAX_VALUE: 50 } } });
      const customTVA = calculateRatingTVA(players);
      expect(customTVA).toBeCloseTo(25, 0); // 64 * 0.39 ≈ 25
    });

    it('should use custom MAX_PLAYERS_CONSIDERED', () => {
      // Create 100 players with rating 2000
      const players: Player[] = Array.from({ length: 100 }, (_, i) =>
        createPlayer(`${i}`, 2000, i + 1, true)
      );

      // Default: considers top 64 players
      const defaultTVA = calculateRatingTVA(players);

      // Custom: considers top 32 players
      configureOPPR({ TVA: { MAX_PLAYERS_CONSIDERED: 32 } });
      const customTVA = calculateRatingTVA(players);

      // Custom should be approximately half of default
      expect(customTVA).toBeLessThan(defaultTVA);
      expect(customTVA).toBeCloseTo(defaultTVA / 2, 0);
    });

    it('should combine multiple custom values', () => {
      const players: Player[] = Array.from({ length: 100 }, (_, i) =>
        createPlayer(`${i}`, 2000, i + 1, true)
      );

      configureOPPR({
        TVA: {
          RATING: {
            COEFFICIENT: 0.001,
            OFFSET: 1.0,
            MAX_VALUE: 100,
          },
          MAX_PLAYERS_CONSIDERED: 50,
        },
      });

      // 50 players * (2000 * 0.001 - 1.0) = 50 * 1.0 = 50
      const tva = calculateRatingTVA(players);
      expect(tva).toBeCloseTo(50, 0);
    });
  });

  describe('ratingContributesToTVA with custom config', () => {
    it('should use custom MIN_EFFECTIVE_RATING', () => {
      // Default: MIN_EFFECTIVE_RATING = 1285.71
      expect(ratingContributesToTVA(1285)).toBe(false);
      expect(ratingContributesToTVA(1286)).toBe(true);

      // Custom: MIN_EFFECTIVE_RATING = 1500
      configureOPPR({ TVA: { RATING: { MIN_EFFECTIVE_RATING: 1500 } } });
      expect(ratingContributesToTVA(1499)).toBe(false);
      expect(ratingContributesToTVA(1500)).toBe(false); // Must be GREATER than
      expect(ratingContributesToTVA(1501)).toBe(true);
    });

    it('should match calculatePlayerRatingContribution behavior', () => {
      configureOPPR({ TVA: { RATING: { MIN_EFFECTIVE_RATING: 1500 } } });

      // Rating 1500 should not contribute
      expect(ratingContributesToTVA(1500)).toBe(false);
      expect(calculatePlayerRatingContribution(1500)).toBeGreaterThanOrEqual(0);

      // Rating 1501 should contribute
      expect(ratingContributesToTVA(1501)).toBe(true);
      expect(calculatePlayerRatingContribution(1501)).toBeGreaterThan(0);
    });
  });
});
