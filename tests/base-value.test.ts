import { describe, it, expect, beforeEach } from 'vitest';
import { calculateBaseValue, countRatedPlayers, isPlayerRated } from '../src/base-value.js';
import { resetConfig, configureOPPR } from '../src/config.js';
import type { Player } from '../src/types.js';

beforeEach(() => {
  resetConfig();
});

describe('calculateBaseValue', () => {
  it('should calculate base value for rated players', () => {
    const players: Player[] = [
      { id: '1', rating: 1500, ranking: 100, isRated: true },
      { id: '2', rating: 1400, ranking: 200, isRated: true },
    ];

    const baseValue = calculateBaseValue(players);
    expect(baseValue).toBe(1.0); // 2 players * 0.5
  });

  it('should ignore unrated players', () => {
    const players: Player[] = [
      { id: '1', rating: 1500, ranking: 100, isRated: true },
      { id: '2', rating: 1400, ranking: 200, isRated: false },
      { id: '3', rating: 1300, ranking: 300, isRated: false },
    ];

    const baseValue = calculateBaseValue(players);
    expect(baseValue).toBe(0.5); // Only 1 rated player
  });

  it('should cap at maximum base value of 32', () => {
    const players: Player[] = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      rating: 1500,
      ranking: i + 1,
      isRated: true,
    }));

    const baseValue = calculateBaseValue(players);
    expect(baseValue).toBe(32); // Capped at 32
  });

  it('should calculate exactly 32 for 64 players', () => {
    const players: Player[] = Array.from({ length: 64 }, (_, i) => ({
      id: `${i}`,
      rating: 1500,
      ranking: i + 1,
      isRated: true,
    }));

    const baseValue = calculateBaseValue(players);
    expect(baseValue).toBe(32);
  });

  it('should handle empty array', () => {
    const baseValue = calculateBaseValue([]);
    expect(baseValue).toBe(0);
  });

  it('should handle all unrated players', () => {
    const players: Player[] = [
      { id: '1', rating: 1500, ranking: 100, isRated: false },
      { id: '2', rating: 1400, ranking: 200, isRated: false },
    ];

    const baseValue = calculateBaseValue(players);
    expect(baseValue).toBe(0);
  });
});

describe('countRatedPlayers', () => {
  it('should count only rated players', () => {
    const players: Player[] = [
      { id: '1', rating: 1500, ranking: 100, isRated: true },
      { id: '2', rating: 1400, ranking: 200, isRated: true },
      { id: '3', rating: 1300, ranking: 300, isRated: false },
    ];

    const count = countRatedPlayers(players);
    expect(count).toBe(2);
  });

  it('should return 0 for empty array', () => {
    const count = countRatedPlayers([]);
    expect(count).toBe(0);
  });
});

describe('isPlayerRated', () => {
  it('should return true for 5 or more events', () => {
    expect(isPlayerRated(5)).toBe(true);
    expect(isPlayerRated(10)).toBe(true);
    expect(isPlayerRated(100)).toBe(true);
  });

  it('should return false for fewer than 5 events', () => {
    expect(isPlayerRated(0)).toBe(false);
    expect(isPlayerRated(1)).toBe(false);
    expect(isPlayerRated(4)).toBe(false);
  });
});

describe('Configuration Tests', () => {
  describe('calculateBaseValue with custom config', () => {
    it('should use custom POINTS_PER_PLAYER', () => {
      const players: Player[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        rating: 1500,
        ranking: i + 1,
        isRated: true,
      }));

      // Default behavior: 10 * 0.5 = 5
      expect(calculateBaseValue(players)).toBe(5);

      // Custom config: 10 * 1.0 = 10
      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });
      expect(calculateBaseValue(players)).toBe(10);
    });

    it('should use custom MAX_BASE_VALUE', () => {
      const players: Player[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        rating: 1500,
        ranking: i + 1,
        isRated: true,
      }));

      // Default: capped at 32
      expect(calculateBaseValue(players)).toBe(32);

      // Custom cap at 64
      configureOPPR({ BASE_VALUE: { MAX_BASE_VALUE: 64 } });
      expect(calculateBaseValue(players)).toBe(50); // 100 * 0.5 = 50, capped at 64
    });

    it('should combine custom POINTS_PER_PLAYER and MAX_BASE_VALUE', () => {
      const players: Player[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        rating: 1500,
        ranking: i + 1,
        isRated: true,
      }));

      configureOPPR({
        BASE_VALUE: {
          POINTS_PER_PLAYER: 1.0,
          MAX_BASE_VALUE: 80,
        },
      });

      // 100 * 1.0 = 100, capped at 80
      expect(calculateBaseValue(players)).toBe(80);
    });
  });

  describe('isPlayerRated with custom config', () => {
    it('should use custom RATED_PLAYER_THRESHOLD', () => {
      // Default threshold is 5
      expect(isPlayerRated(4)).toBe(false);
      expect(isPlayerRated(5)).toBe(true);

      // Custom threshold of 3
      configureOPPR({ BASE_VALUE: { RATED_PLAYER_THRESHOLD: 3 } });
      expect(isPlayerRated(2)).toBe(false);
      expect(isPlayerRated(3)).toBe(true);
      expect(isPlayerRated(4)).toBe(true);
    });

    it('should use custom threshold of 10', () => {
      configureOPPR({ BASE_VALUE: { RATED_PLAYER_THRESHOLD: 10 } });
      expect(isPlayerRated(9)).toBe(false);
      expect(isPlayerRated(10)).toBe(true);
    });
  });
});
