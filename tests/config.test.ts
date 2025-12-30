import { describe, it, expect, beforeEach } from 'vitest';
import { configureOPPR, resetConfig, getConfig, getDefaultConfig } from '../src/config.js';
import { DEFAULT_CONSTANTS } from '../src/constants.js';

describe('Configuration System', () => {
  beforeEach(() => {
    resetConfig(); // Ensure clean state between tests
  });

  describe('getDefaultConfig', () => {
    it('should return default constants', () => {
      const defaults = getDefaultConfig();
      expect(defaults).toEqual(DEFAULT_CONSTANTS);
    });

    it('should return same reference as DEFAULT_CONSTANTS', () => {
      const defaults = getDefaultConfig();
      expect(defaults).toBe(DEFAULT_CONSTANTS);
    });

    it('should not be affected by user configuration', () => {
      const defaultsBefore = getDefaultConfig();

      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
      });

      const defaultsAfter = getDefaultConfig();
      expect(defaultsAfter).toEqual(defaultsBefore);
      expect(defaultsAfter.BASE_VALUE.POINTS_PER_PLAYER).toBe(0.5);
    });

    it('should match expected default values', () => {
      const defaults = getDefaultConfig();
      expect(defaults.BASE_VALUE.POINTS_PER_PLAYER).toBe(0.5);
      expect(defaults.BASE_VALUE.MAX_BASE_VALUE).toBe(32);
      expect(defaults.TIME_DECAY.YEAR_1_TO_2).toBe(0.75);
      expect(defaults.TVA.RATING.MAX_VALUE).toBe(25);
      expect(defaults.TGP.BASE_GAME_VALUE).toBe(0.04);
    });
  });

  describe('getConfig', () => {
    it('should return default config when no overrides', () => {
      const config = getConfig();
      expect(config).toEqual(DEFAULT_CONSTANTS);
    });

    it('should cache results for performance', () => {
      const config1 = getConfig();
      const config2 = getConfig();
      expect(config1).toBe(config2); // Same reference = cached
    });

    it('should return new config after configuration change', () => {
      const config1 = getConfig();

      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });

      const config2 = getConfig();
      expect(config2).not.toBe(config1); // Different reference = cache invalidated
      expect(config2.BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0);
    });

    it('should return new config after reset', () => {
      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });
      const config1 = getConfig();

      resetConfig();

      const config2 = getConfig();
      expect(config2).not.toBe(config1); // Cache invalidated
      expect(config2.BASE_VALUE.POINTS_PER_PLAYER).toBe(0.5);
    });

    it('should cache again after configuration change', () => {
      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });
      const config1 = getConfig();
      const config2 = getConfig();
      expect(config1).toBe(config2); // Cached after config change
    });
  });

  describe('configureOPPR', () => {
    it('should override single value while keeping others default', () => {
      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
      });

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0);
      expect(config.BASE_VALUE.MAX_BASE_VALUE).toBe(32); // Unchanged
      expect(config.BASE_VALUE.MAX_PLAYER_COUNT).toBe(64); // Unchanged
      expect(config.BASE_VALUE.RATED_PLAYER_THRESHOLD).toBe(5); // Unchanged
    });

    it('should override multiple values in same group', () => {
      configureOPPR({
        BASE_VALUE: {
          POINTS_PER_PLAYER: 1.0,
          MAX_BASE_VALUE: 64,
        },
      });

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0);
      expect(config.BASE_VALUE.MAX_BASE_VALUE).toBe(64);
      expect(config.BASE_VALUE.MAX_PLAYER_COUNT).toBe(64); // Unchanged
    });

    it('should override values in different groups', () => {
      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
        TIME_DECAY: { YEAR_1_TO_2: 0.8 },
      });

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0);
      expect(config.TIME_DECAY.YEAR_1_TO_2).toBe(0.8);
      expect(config.TIME_DECAY.YEAR_2_TO_3).toBe(0.5); // Unchanged
    });

    it('should handle deep nested overrides', () => {
      configureOPPR({
        TVA: {
          RATING: { MAX_VALUE: 30 },
        },
      });

      const config = getConfig();
      expect(config.TVA.RATING.MAX_VALUE).toBe(30);
      expect(config.TVA.RATING.COEFFICIENT).toBe(0.000546875); // Unchanged
      expect(config.TVA.RANKING.MAX_VALUE).toBe(50); // Unchanged
    });

    it('should handle multiple deep nested overrides', () => {
      configureOPPR({
        TVA: {
          RATING: { MAX_VALUE: 30, COEFFICIENT: 0.001 },
          RANKING: { MAX_VALUE: 100 },
        },
      });

      const config = getConfig();
      expect(config.TVA.RATING.MAX_VALUE).toBe(30);
      expect(config.TVA.RATING.COEFFICIENT).toBe(0.001);
      expect(config.TVA.RANKING.MAX_VALUE).toBe(100);
      expect(config.TVA.MAX_PLAYERS_CONSIDERED).toBe(64); // Unchanged
    });

    it('should accumulate configuration from multiple calls', () => {
      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
      });

      configureOPPR({
        TIME_DECAY: { YEAR_1_TO_2: 0.8 },
      });

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0); // From first call
      expect(config.TIME_DECAY.YEAR_1_TO_2).toBe(0.8); // From second call
    });

    it('should override previous configuration with newer values', () => {
      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
      });

      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.5 },
      });

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(1.5);
    });

    it('should handle TGP multipliers override', () => {
      configureOPPR({
        TGP: {
          MULTIPLIERS: {
            FOUR_PLAYER_GROUPS: 2.5,
            HYBRID_BEST_GAME: 4.0,
          },
        },
      });

      const config = getConfig();
      expect(config.TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS).toBe(2.5);
      expect(config.TGP.MULTIPLIERS.HYBRID_BEST_GAME).toBe(4.0);
      expect(config.TGP.MULTIPLIERS.THREE_PLAYER_GROUPS).toBe(1.5); // Unchanged
    });

    it('should handle event booster values', () => {
      configureOPPR({
        EVENT_BOOSTERS: {
          CERTIFIED: 1.5,
          MAJOR: 3.0,
        },
      });

      const config = getConfig();
      expect(config.EVENT_BOOSTERS.CERTIFIED).toBe(1.5);
      expect(config.EVENT_BOOSTERS.MAJOR).toBe(3.0);
      expect(config.EVENT_BOOSTERS.NONE).toBe(1.0); // Unchanged
    });

    it('should invalidate cache on configuration change', () => {
      const config1 = getConfig();

      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });

      const config2 = getConfig();
      expect(config1).not.toBe(config2);
    });

    it('should not mutate default constants', () => {
      const originalValue = DEFAULT_CONSTANTS.BASE_VALUE.POINTS_PER_PLAYER;

      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 99.0 },
      });

      expect(DEFAULT_CONSTANTS.BASE_VALUE.POINTS_PER_PLAYER).toBe(originalValue);
      expect(DEFAULT_CONSTANTS.BASE_VALUE.POINTS_PER_PLAYER).toBe(0.5);
    });

    it('should handle all constant groups in one call', () => {
      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
        TVA: { RATING: { MAX_VALUE: 30 } },
        TGP: { BASE_GAME_VALUE: 0.05 },
        EVENT_BOOSTERS: { CERTIFIED: 1.5 },
        POINT_DISTRIBUTION: { LINEAR_PERCENTAGE: 0.2 },
        TIME_DECAY: { YEAR_1_TO_2: 0.8 },
        RANKING: { TOP_EVENTS_COUNT: 20 },
        RATING: { DEFAULT_RATING: 1400 },
        VALIDATION: { MIN_PLAYERS: 4 },
      });

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0);
      expect(config.TVA.RATING.MAX_VALUE).toBe(30);
      expect(config.TGP.BASE_GAME_VALUE).toBe(0.05);
      expect(config.EVENT_BOOSTERS.CERTIFIED).toBe(1.5);
      expect(config.POINT_DISTRIBUTION.LINEAR_PERCENTAGE).toBe(0.2);
      expect(config.TIME_DECAY.YEAR_1_TO_2).toBe(0.8);
      expect(config.RANKING.TOP_EVENTS_COUNT).toBe(20);
      expect(config.RATING.DEFAULT_RATING).toBe(1400);
      expect(config.VALIDATION.MIN_PLAYERS).toBe(4);
    });
  });

  describe('resetConfig', () => {
    it('should clear all user overrides', () => {
      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
        TIME_DECAY: { YEAR_1_TO_2: 0.8 },
      });

      resetConfig();

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(0.5);
      expect(config.TIME_DECAY.YEAR_1_TO_2).toBe(0.75);
    });

    it('should restore all defaults', () => {
      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
        TVA: { RATING: { MAX_VALUE: 30 } },
        TGP: { BASE_GAME_VALUE: 0.05 },
      });

      resetConfig();

      const config = getConfig();
      expect(config).toEqual(DEFAULT_CONSTANTS);
    });

    it('should invalidate cache', () => {
      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });
      const config1 = getConfig();

      resetConfig();

      const config2 = getConfig();
      expect(config1).not.toBe(config2);
    });

    it('should work after multiple configuration calls', () => {
      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });
      configureOPPR({ TIME_DECAY: { YEAR_1_TO_2: 0.8 } });
      configureOPPR({ TVA: { RATING: { MAX_VALUE: 30 } } });

      resetConfig();

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(0.5);
      expect(config.TIME_DECAY.YEAR_1_TO_2).toBe(0.75);
      expect(config.TVA.RATING.MAX_VALUE).toBe(25);
    });

    it('should allow reconfiguration after reset', () => {
      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });
      resetConfig();

      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 2.0 } });

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(2.0);
    });

    it('should be idempotent', () => {
      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });

      resetConfig();
      resetConfig();
      resetConfig();

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(0.5);
    });
  });

  describe('Deep Merge Behavior', () => {
    it('should merge nested objects without affecting siblings', () => {
      configureOPPR({
        TGP: {
          MULTIPLIERS: { FOUR_PLAYER_GROUPS: 2.5 },
        },
      });

      const config = getConfig();
      expect(config.TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS).toBe(2.5);
      expect(config.TGP.MULTIPLIERS.THREE_PLAYER_GROUPS).toBe(1.5);
      expect(config.TGP.BASE_GAME_VALUE).toBe(0.04); // Sibling unchanged
    });

    it('should preserve unspecified values at all levels', () => {
      configureOPPR({
        TVA: {
          RATING: { MAX_VALUE: 30 },
        },
      });

      const config = getConfig();
      expect(config.TVA.RATING.MAX_VALUE).toBe(30);
      expect(config.TVA.RATING.COEFFICIENT).toBe(0.000546875);
      expect(config.TVA.RATING.OFFSET).toBe(0.703125);
      expect(config.TVA.RATING.PERFECT_RATING).toBe(2000);
      expect(config.TVA.RANKING).toEqual(DEFAULT_CONSTANTS.TVA.RANKING);
      expect(config.TVA.MAX_PLAYERS_CONSIDERED).toBe(64);
    });

    it('should handle three-level deep nesting', () => {
      configureOPPR({
        TGP: {
          UNLIMITED_QUALIFYING: { PERCENT_PER_HOUR: 0.02 },
        },
      });

      const config = getConfig();
      expect(config.TGP.UNLIMITED_QUALIFYING.PERCENT_PER_HOUR).toBe(0.02);
      expect(config.TGP.UNLIMITED_QUALIFYING.MAX_BONUS).toBe(0.2); // Unchanged
      expect(config.TGP.UNLIMITED_QUALIFYING.MIN_HOURS_FOR_MULTIPLIER).toBe(20); // Unchanged
    });

    it('should not create references between config and defaults', () => {
      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
      });

      const config = getConfig();

      // Attempting to modify config should not affect defaults
      // (This is a read-only test, but verifies independence)
      expect(config.BASE_VALUE).not.toBe(DEFAULT_CONSTANTS.BASE_VALUE);
    });

    it('should handle multiple levels of nesting in one call', () => {
      configureOPPR({
        TGP: {
          MULTIPLIERS: { FOUR_PLAYER_GROUPS: 2.5 },
          BALL_ADJUSTMENTS: { ONE_BALL: 0.5 },
          UNLIMITED_QUALIFYING: { PERCENT_PER_HOUR: 0.02 },
        },
      });

      const config = getConfig();
      expect(config.TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS).toBe(2.5);
      expect(config.TGP.BALL_ADJUSTMENTS.ONE_BALL).toBe(0.5);
      expect(config.TGP.UNLIMITED_QUALIFYING.PERCENT_PER_HOUR).toBe(0.02);
    });
  });

  describe('README Examples', () => {
    it('should support example: Higher Tournament Values', () => {
      configureOPPR({
        BASE_VALUE: {
          POINTS_PER_PLAYER: 1.0,
          MAX_BASE_VALUE: 64,
        },
        TVA: {
          RATING: { MAX_VALUE: 50 },
          RANKING: { MAX_VALUE: 100 },
        },
      });

      const config = getConfig();
      expect(config.BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0);
      expect(config.BASE_VALUE.MAX_BASE_VALUE).toBe(64);
      expect(config.TVA.RATING.MAX_VALUE).toBe(50);
      expect(config.TVA.RANKING.MAX_VALUE).toBe(100);
    });

    it('should support example: Slower Time Decay', () => {
      configureOPPR({
        TIME_DECAY: {
          YEAR_0_TO_1: 1.0,
          YEAR_1_TO_2: 0.9,
          YEAR_2_TO_3: 0.7,
          YEAR_3_PLUS: 0.5,
        },
      });

      const config = getConfig();
      expect(config.TIME_DECAY.YEAR_0_TO_1).toBe(1.0);
      expect(config.TIME_DECAY.YEAR_1_TO_2).toBe(0.9);
      expect(config.TIME_DECAY.YEAR_2_TO_3).toBe(0.7);
      expect(config.TIME_DECAY.YEAR_3_PLUS).toBe(0.5);
    });

    it('should support example: Different TGP Scaling', () => {
      configureOPPR({
        TGP: {
          BASE_GAME_VALUE: 0.05,
          MAX_WITHOUT_FINALS: 1.5,
          MAX_WITH_FINALS: 2.5,
          MULTIPLIERS: { FOUR_PLAYER_GROUPS: 2.5 },
        },
      });

      const config = getConfig();
      expect(config.TGP.BASE_GAME_VALUE).toBe(0.05);
      expect(config.TGP.MAX_WITHOUT_FINALS).toBe(1.5);
      expect(config.TGP.MAX_WITH_FINALS).toBe(2.5);
      expect(config.TGP.MULTIPLIERS.FOUR_PLAYER_GROUPS).toBe(2.5);
    });

    it('should support resetting configuration', () => {
      configureOPPR({
        BASE_VALUE: { POINTS_PER_PLAYER: 1.0 },
      });

      expect(getConfig().BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0);

      resetConfig();

      expect(getConfig().BASE_VALUE.POINTS_PER_PLAYER).toBe(0.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty configuration object', () => {
      configureOPPR({});

      const config = getConfig();
      expect(config).toEqual(DEFAULT_CONSTANTS);
    });

    it('should handle zero values', () => {
      configureOPPR({
        TIME_DECAY: { YEAR_3_PLUS: 0 },
      });

      const config = getConfig();
      expect(config.TIME_DECAY.YEAR_3_PLUS).toBe(0);
    });

    it('should handle negative values', () => {
      configureOPPR({
        POINT_DISTRIBUTION: { LINEAR_PERCENTAGE: -0.1 },
      });

      const config = getConfig();
      expect(config.POINT_DISTRIBUTION.LINEAR_PERCENTAGE).toBe(-0.1);
    });

    it('should handle very large values', () => {
      configureOPPR({
        BASE_VALUE: { MAX_BASE_VALUE: 999999 },
      });

      const config = getConfig();
      expect(config.BASE_VALUE.MAX_BASE_VALUE).toBe(999999);
    });

    it('should handle decimal precision', () => {
      configureOPPR({
        TVA: { RATING: { COEFFICIENT: 0.000123456789 } },
      });

      const config = getConfig();
      expect(config.TVA.RATING.COEFFICIENT).toBe(0.000123456789);
    });
  });

  describe('Configuration Isolation', () => {
    it('should not affect other tests when reset in beforeEach', () => {
      // This test verifies that beforeEach is working
      const config = getConfig();
      expect(config).toEqual(DEFAULT_CONSTANTS);
    });

    it('should maintain configuration within a single test', () => {
      configureOPPR({ BASE_VALUE: { POINTS_PER_PLAYER: 1.0 } });
      expect(getConfig().BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0);

      configureOPPR({ TIME_DECAY: { YEAR_1_TO_2: 0.8 } });
      expect(getConfig().BASE_VALUE.POINTS_PER_PLAYER).toBe(1.0); // Still set
      expect(getConfig().TIME_DECAY.YEAR_1_TO_2).toBe(0.8);
    });
  });
});
