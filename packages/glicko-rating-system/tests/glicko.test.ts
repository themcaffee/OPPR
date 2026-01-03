import { describe, it, expect, beforeEach } from 'vitest';
import { GlickoRatingSystem } from '../src/glicko.js';
import { DEFAULT_GLICKO_CONFIG } from '../src/constants.js';
import type { GlickoRatingData } from '../src/types.js';
import type { MatchResult, PlayerRatingResult } from '@opprs/rating-system-base';

describe('GlickoRatingSystem', () => {
  let glicko: GlickoRatingSystem;

  beforeEach(() => {
    glicko = new GlickoRatingSystem(DEFAULT_GLICKO_CONFIG);
  });

  describe('constructor', () => {
    it('should use default config when not provided', () => {
      const system = new GlickoRatingSystem();
      expect(system.id).toBe('glicko');
      expect(system.name).toBe('Glicko Rating System');
    });

    it('should accept custom config', () => {
      const customConfig = { ...DEFAULT_GLICKO_CONFIG, DEFAULT_RATING: 1500 };
      const system = new GlickoRatingSystem(customConfig);
      const newRating = system.createNewRating();
      expect(newRating.value).toBe(1500);
    });
  });

  describe('createNewRating', () => {
    it('should return default rating and max RD', () => {
      const newRating = glicko.createNewRating();
      expect(newRating.value).toBe(DEFAULT_GLICKO_CONFIG.DEFAULT_RATING);
      expect(newRating.ratingDeviation).toBe(DEFAULT_GLICKO_CONFIG.MAX_RD);
    });

    it('should return consistent values on multiple calls', () => {
      const rating1 = glicko.createNewRating();
      const rating2 = glicko.createNewRating();
      expect(rating1.value).toBe(rating2.value);
      expect(rating1.ratingDeviation).toBe(rating2.ratingDeviation);
    });

    it('should match expected default constants', () => {
      const newRating = glicko.createNewRating();
      expect(newRating.value).toBe(1300);
      expect(newRating.ratingDeviation).toBe(200);
    });
  });

  describe('getRatingValue', () => {
    it('should return the value from rating data', () => {
      const rating: GlickoRatingData = { value: 1650, ratingDeviation: 75 };
      expect(glicko.getRatingValue(rating)).toBe(1650);
    });
  });

  describe('isProvisional', () => {
    const rating: GlickoRatingData = { value: 1500, ratingDeviation: 100 };

    it('should return true for players with fewer than 5 events', () => {
      expect(glicko.isProvisional(rating, 0)).toBe(true);
      expect(glicko.isProvisional(rating, 1)).toBe(true);
      expect(glicko.isProvisional(rating, 4)).toBe(true);
    });

    it('should return false for players with 5 or more events', () => {
      expect(glicko.isProvisional(rating, 5)).toBe(false);
      expect(glicko.isProvisional(rating, 10)).toBe(false);
      expect(glicko.isProvisional(rating, 100)).toBe(false);
    });
  });

  describe('updateRating', () => {
    it('should return unchanged rating when no results', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 100 };
      const result = glicko.updateRating(current, []);

      expect(result.newRating.value).toBe(1500);
      expect(result.newRating.ratingDeviation).toBe(100);
    });

    it('should increase rating after a win against equal opponent', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 100 };
      const results: MatchResult<GlickoRatingData>[] = [
        {
          opponentRating: { value: 1500, ratingDeviation: 100 },
          score: 1,
        },
      ];

      const result = glicko.updateRating(current, results);
      expect(result.newRating.value).toBeGreaterThan(1500);
      expect(result.change).toBeGreaterThan(0);
    });

    it('should decrease rating after a loss against equal opponent', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 100 };
      const results: MatchResult<GlickoRatingData>[] = [
        {
          opponentRating: { value: 1500, ratingDeviation: 100 },
          score: 0,
        },
      ];

      const result = glicko.updateRating(current, results);
      expect(result.newRating.value).toBeLessThan(1500);
      expect(result.change).toBeLessThan(0);
    });

    it('should barely change rating after draw against equal opponent', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 100 };
      const results: MatchResult<GlickoRatingData>[] = [
        {
          opponentRating: { value: 1500, ratingDeviation: 100 },
          score: 0.5,
        },
      ];

      const result = glicko.updateRating(current, results);
      expect(Math.abs(result.newRating.value - 1500)).toBeLessThan(5);
    });

    it('should increase rating more when beating stronger opponent', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 100 };

      const weakerWinResults: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1400, ratingDeviation: 100 }, score: 1 },
      ];
      const strongerWinResults: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1600, ratingDeviation: 100 }, score: 1 },
      ];

      const weakerResult = glicko.updateRating(current, weakerWinResults);
      const strongerResult = glicko.updateRating(current, strongerWinResults);

      expect(strongerResult.newRating.value - 1500).toBeGreaterThan(
        weakerResult.newRating.value - 1500
      );
    });

    it('should decrease rating less when losing to stronger opponent', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 100 };

      const weakerLossResults: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1400, ratingDeviation: 100 }, score: 0 },
      ];
      const strongerLossResults: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1600, ratingDeviation: 100 }, score: 0 },
      ];

      const weakerResult = glicko.updateRating(current, weakerLossResults);
      const strongerResult = glicko.updateRating(current, strongerLossResults);

      expect(1500 - weakerResult.newRating.value).toBeGreaterThan(
        1500 - strongerResult.newRating.value
      );
    });

    it('should handle multiple results', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 100 };
      const results: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1600, ratingDeviation: 80 }, score: 1 },
        { opponentRating: { value: 1550, ratingDeviation: 90 }, score: 0 },
        { opponentRating: { value: 1450, ratingDeviation: 85 }, score: 1 },
      ];

      const result = glicko.updateRating(current, results);
      expect(result.newRating.value).toBeGreaterThan(1500);
      expect(result.newRating.value).toBeLessThan(1600);
    });

    it('should decrease RD (increase certainty) after playing', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 150 };
      const results: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1500, ratingDeviation: 100 }, score: 1 },
        { opponentRating: { value: 1450, ratingDeviation: 100 }, score: 1 },
      ];

      const result = glicko.updateRating(current, results);
      expect(result.newRating.ratingDeviation).toBeLessThan(150);
    });

    it('should clamp RD to MIN_RD', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 15 };
      const results: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1500, ratingDeviation: 10 }, score: 1 },
        { opponentRating: { value: 1500, ratingDeviation: 10 }, score: 1 },
        { opponentRating: { value: 1500, ratingDeviation: 10 }, score: 1 },
      ];

      const result = glicko.updateRating(current, results);
      expect(result.newRating.ratingDeviation).toBeGreaterThanOrEqual(DEFAULT_GLICKO_CONFIG.MIN_RD);
    });

    it('should clamp RD to MAX_RD', () => {
      const current: GlickoRatingData = {
        value: 1500,
        ratingDeviation: DEFAULT_GLICKO_CONFIG.MAX_RD,
      };
      const results: MatchResult<GlickoRatingData>[] = [
        {
          opponentRating: { value: 1500, ratingDeviation: DEFAULT_GLICKO_CONFIG.MAX_RD },
          score: 1,
        },
      ];

      const result = glicko.updateRating(current, results);
      expect(result.newRating.ratingDeviation).toBeLessThanOrEqual(DEFAULT_GLICKO_CONFIG.MAX_RD);
    });

    it('should round rating to 2 decimal places', () => {
      const current: GlickoRatingData = { value: 1500.123456, ratingDeviation: 100 };
      const results: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1500, ratingDeviation: 100 }, score: 1 },
      ];

      const result = glicko.updateRating(current, results);
      const decimalPlaces = (result.newRating.value.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should handle extreme rating differences', () => {
      const current: GlickoRatingData = { value: 1000, ratingDeviation: 100 };
      const results: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 2000, ratingDeviation: 50 }, score: 0 },
      ];

      const result = glicko.updateRating(current, results);
      expect(result.newRating.value).toBeGreaterThan(900);
      expect(result.newRating.value).toBeLessThan(1100);
    });

    it('should handle opponent with high RD (uncertain rating)', () => {
      const current: GlickoRatingData = { value: 1500, ratingDeviation: 100 };

      const certainOpponentResults: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1600, ratingDeviation: 10 }, score: 1 },
      ];
      const uncertainOpponentResults: MatchResult<GlickoRatingData>[] = [
        { opponentRating: { value: 1600, ratingDeviation: 200 }, score: 1 },
      ];

      const certainResult = glicko.updateRating(current, certainOpponentResults);
      const uncertainResult = glicko.updateRating(current, uncertainOpponentResults);

      expect(certainResult.newRating.value - 1500).toBeGreaterThan(
        uncertainResult.newRating.value - 1500
      );
    });
  });

  describe('applyInactivityDecay', () => {
    it('should increase RD with inactivity', () => {
      const rating: GlickoRatingData = { value: 1500, ratingDeviation: 50 };
      const decayed = glicko.applyInactivityDecay(rating, 100);
      expect(decayed.ratingDeviation).toBeGreaterThan(50);
    });

    it('should increase RD by exactly RD_DECAY_PER_DAY per day', () => {
      const rating: GlickoRatingData = { value: 1500, ratingDeviation: 50 };
      const days = 10;

      const decayed = glicko.applyInactivityDecay(rating, days);
      expect(decayed.ratingDeviation).toBe(50 + days * DEFAULT_GLICKO_CONFIG.RD_DECAY_PER_DAY);
    });

    it('should return same RD for zero days inactive', () => {
      const rating: GlickoRatingData = { value: 1500, ratingDeviation: 100 };
      const decayed = glicko.applyInactivityDecay(rating, 0);
      expect(decayed.ratingDeviation).toBe(100);
    });

    it('should cap RD at MAX_RD', () => {
      const rating: GlickoRatingData = { value: 1500, ratingDeviation: 150 };
      const decayed = glicko.applyInactivityDecay(rating, 1000);
      expect(decayed.ratingDeviation).toBe(DEFAULT_GLICKO_CONFIG.MAX_RD);
    });

    it('should not modify the original rating object', () => {
      const rating: GlickoRatingData = { value: 1500, ratingDeviation: 100 };
      glicko.applyInactivityDecay(rating, 50);
      expect(rating.ratingDeviation).toBe(100);
    });

    it('should preserve the rating value', () => {
      const rating: GlickoRatingData = { value: 1650, ratingDeviation: 100 };
      const decayed = glicko.applyInactivityDecay(rating, 50);
      expect(decayed.value).toBe(1650);
    });
  });

  describe('simulateTournamentMatches', () => {
    const createRating = (value: number, rd = 100): GlickoRatingData => ({
      value,
      ratingDeviation: rd,
    });

    it('should create wins for players below and losses for players above', () => {
      const results: PlayerRatingResult<GlickoRatingData>[] = [
        { position: 1, rating: createRating(1800) },
        { position: 2, rating: createRating(1700) },
        { position: 3, rating: createRating(1600) },
      ];

      const matches = glicko.simulateTournamentMatches(2, results);

      expect(matches).toHaveLength(2);
      expect(matches.find((m) => m.opponentRating.value === 1800)?.score).toBe(0); // Loss
      expect(matches.find((m) => m.opponentRating.value === 1600)?.score).toBe(1); // Win
    });

    it('should handle ties correctly', () => {
      const results: PlayerRatingResult<GlickoRatingData>[] = [
        { position: 1, rating: createRating(1800) },
        { position: 2, rating: createRating(1700) },
        { position: 2, rating: createRating(1600) }, // Tied for 2nd
      ];

      const matches = glicko.simulateTournamentMatches(2, results);
      expect(matches.some((m) => m.score === 0.5)).toBe(true);
    });

    it('should limit to OPPONENTS_RANGE above and below', () => {
      const results: PlayerRatingResult<GlickoRatingData>[] = [];
      for (let i = 1; i <= 100; i++) {
        results.push({ position: i, rating: createRating(1500) });
      }

      const matches = glicko.simulateTournamentMatches(50, results);
      expect(matches.length).toBeLessThanOrEqual(DEFAULT_GLICKO_CONFIG.OPPONENTS_RANGE * 2);
    });

    it('should not include self in matches', () => {
      const results: PlayerRatingResult<GlickoRatingData>[] = [
        { position: 1, rating: createRating(1800) },
        { position: 2, rating: createRating(1700) },
        { position: 3, rating: createRating(1600) },
      ];

      const matches = glicko.simulateTournamentMatches(2, results);
      expect(matches.every((m) => m.opponentRating.value !== 1700)).toBe(true);
    });

    it('should return empty array if player position not found', () => {
      const results: PlayerRatingResult<GlickoRatingData>[] = [
        { position: 1, rating: createRating(1800) },
        { position: 2, rating: createRating(1700) },
      ];

      const matches = glicko.simulateTournamentMatches(99, results);
      expect(matches).toEqual([]);
    });

    it('should handle first place player (all wins)', () => {
      const results: PlayerRatingResult<GlickoRatingData>[] = [
        { position: 1, rating: createRating(1800) },
        { position: 2, rating: createRating(1700) },
        { position: 3, rating: createRating(1600) },
      ];

      const matches = glicko.simulateTournamentMatches(1, results);
      expect(matches.every((m) => m.score === 1)).toBe(true);
      expect(matches).toHaveLength(2);
    });

    it('should handle last place player (all losses)', () => {
      const results: PlayerRatingResult<GlickoRatingData>[] = [
        { position: 1, rating: createRating(1800) },
        { position: 2, rating: createRating(1700) },
        { position: 3, rating: createRating(1600) },
      ];

      const matches = glicko.simulateTournamentMatches(3, results);
      expect(matches.every((m) => m.score === 0)).toBe(true);
      expect(matches).toHaveLength(2);
    });

    it('should handle custom opponents range', () => {
      const results: PlayerRatingResult<GlickoRatingData>[] = [];
      for (let i = 1; i <= 100; i++) {
        results.push({ position: i, rating: createRating(1500) });
      }

      const matches = glicko.simulateTournamentMatches(50, results, { opponentsRange: 5 });
      expect(matches.length).toBeLessThanOrEqual(10); // 5 above + 5 below
    });

    it('should correctly order unsorted results', () => {
      const results: PlayerRatingResult<GlickoRatingData>[] = [
        { position: 3, rating: createRating(1600) },
        { position: 1, rating: createRating(1800) },
        { position: 2, rating: createRating(1700) },
      ];

      const matches = glicko.simulateTournamentMatches(2, results);
      expect(matches.find((m) => m.opponentRating.value === 1800)?.score).toBe(0); // Loss
      expect(matches.find((m) => m.opponentRating.value === 1600)?.score).toBe(1); // Win
    });
  });
});
