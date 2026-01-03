import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateBaseValue,
  calculateRatingTVA,
  calculateRankingTVA,
  calculateTGP,
  getEventBoosterMultiplier,
  distributePoints,
  type Player,
  type TGPConfig,
  type PlayerResult,
} from '../src/index.js';
import { resetConfig, configureOPPR } from '../src/config.js';
import { createPlayer } from './test-helpers.js';

beforeEach(() => {
  resetConfig();
});

describe('Full Tournament Calculation Integration', () => {
  it('should calculate complete tournament value and distribute points', () => {
    // Setup: 20 player tournament with mixed ratings and rankings
    const players: Player[] = [
      createPlayer('1', 1900, 1, true),
      createPlayer('2', 1850, 2, true),
      createPlayer('3', 1800, 5, true),
      createPlayer('4', 1750, 10, true),
      createPlayer('5', 1700, 15, true),
      createPlayer('6', 1650, 20, true),
      createPlayer('7', 1600, 25, true),
      createPlayer('8', 1550, 30, true),
      createPlayer('9', 1500, 40, true),
      createPlayer('10', 1450, 50, true),
      createPlayer('11', 1400, 60, true),
      createPlayer('12', 1350, 80, true),
      createPlayer('13', 1300, 100, true),
      createPlayer('14', 1300, 120, true),
      createPlayer('15', 1300, 150, true),
      createPlayer('16', 1300, 180, true),
      createPlayer('17', 1300, 200, true),
      createPlayer('18', 1300, 250, true),
      createPlayer('19', 1300, 300, true),
      createPlayer('20', 1300, 500, true),
    ];

    // Step 1: Calculate Base Value
    const baseValue = calculateBaseValue(players);
    expect(baseValue).toBe(10); // 20 rated players * 0.5

    // Step 2: Calculate TVA from ratings
    const ratingTVA = calculateRatingTVA(players);
    expect(ratingTVA).toBeGreaterThan(0);
    expect(ratingTVA).toBeLessThanOrEqual(25);

    // Step 3: Calculate TVA from rankings
    const rankingTVA = calculateRankingTVA(players);
    expect(rankingTVA).toBeGreaterThan(0);
    expect(rankingTVA).toBeLessThanOrEqual(50);

    // Step 4: Calculate TGP (PAPA-style qualifying + 4-player group finals)
    const tgpConfig: TGPConfig = {
      qualifying: {
        type: 'limited',
        meaningfulGames: 7, // 7 qualifying games
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12, // 3 rounds * 4 games
        fourPlayerGroups: true, // 2X multiplier
      },
    };

    const tgp = calculateTGP(tgpConfig);
    // Qualifying: 7 * 4% = 28%
    // Finals: 12 * 4% * 2 = 96%
    // Total: 124%
    expect(tgp).toBeCloseTo(1.24, 2);

    // Step 5: Apply event booster (normal event = 1.0)
    const boosterMultiplier = getEventBoosterMultiplier('none');
    expect(boosterMultiplier).toBe(1.0);

    // Step 6: Calculate final first place value
    const firstPlaceValue = (baseValue + ratingTVA + rankingTVA) * tgp * boosterMultiplier;
    expect(firstPlaceValue).toBeGreaterThan(baseValue);

    // Step 7: Distribute points to all players
    const results: PlayerResult[] = players.map((player, index) => ({
      player,
      position: index + 1, // Positions 1-20
    }));

    const distributions = distributePoints(results, firstPlaceValue);
    expect(distributions).toHaveLength(20);

    // Verify first place gets most points
    expect(distributions[0].totalPoints).toBeGreaterThan(distributions[1].totalPoints);
    expect(distributions[0].totalPoints).toBeGreaterThan(distributions[19].totalPoints);

    // Verify total includes both linear and dynamic
    distributions.forEach((dist) => {
      expect(dist.totalPoints).toBe(dist.linearPoints + dist.dynamicPoints);
    });
  });

  it('should handle Major championship with high TGP', () => {
    // Pinburgh-style tournament
    const players: Player[] = Array.from({ length: 400 }, (_, i) =>
      createPlayer(`${i + 1}`, 1800 - i * 2, i + 1, true)
    );

    const baseValue = calculateBaseValue(players);
    expect(baseValue).toBe(32); // Maxed out

    const ratingTVA = calculateRatingTVA(players);
    const rankingTVA = calculateRankingTVA(players);

    // Pinburgh TGP: 10 rounds of qualifying (40 games with 2X multiplier) + finals
    const tgpConfig: TGPConfig = {
      qualifying: {
        type: 'limited',
        meaningfulGames: 40,
        fourPlayerGroups: true, // 2X for qualifying
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
        fourPlayerGroups: true, // 2X for finals
      },
    };

    const tgp = calculateTGP(tgpConfig);
    // Should be high TGP, capped at 2.0
    expect(tgp).toBeCloseTo(2.0, 2);

    // Major booster
    const boosterMultiplier = getEventBoosterMultiplier('major');
    expect(boosterMultiplier).toBe(2.0);

    const firstPlaceValue = (baseValue + ratingTVA + rankingTVA) * tgp * boosterMultiplier;
    expect(firstPlaceValue).toBeGreaterThan(100); // Should be a very valuable tournament
  });

  it('should handle small local tournament correctly', () => {
    // 8 player local tournament
    const players: Player[] = [
      createPlayer('1', 1600, 50, true),
      createPlayer('2', 1550, 75, true),
      createPlayer('3', 1500, 100, true),
      createPlayer('4', 1450, 150, true),
      createPlayer('5', 1400, 200, true),
      createPlayer('6', 1350, 300, true),
      createPlayer('7', 1300, 400, false), // Unrated
      createPlayer('8', 1300, 500, false), // Unrated
    ];

    const baseValue = calculateBaseValue(players);
    expect(baseValue).toBe(3); // 6 rated players * 0.5

    const ratingTVA = calculateRatingTVA(players);
    const rankingTVA = calculateRankingTVA(players);

    // Simple 3-strike format
    const tgpConfig: TGPConfig = {
      qualifying: {
        type: 'none',
        meaningfulGames: 0,
      },
      finals: {
        formatType: 'strike-format',
        meaningfulGames: 6, // ~6 expected games for winner
      },
    };

    const tgp = calculateTGP(tgpConfig);
    expect(tgp).toBeCloseTo(0.24, 2); // 6 * 4% = 24%, capped at 100%

    const firstPlaceValue = (baseValue + ratingTVA + rankingTVA) * tgp * 1.0;
    expect(firstPlaceValue).toBeGreaterThan(0);
    expect(firstPlaceValue).toBeLessThan(10); // Small local tournament
  });

  it('should calculate tournament with custom configuration', () => {
    // 20 player tournament
    const players: Player[] = Array.from({ length: 20 }, (_, i) =>
      createPlayer(`${i}`, 1800 - i * 20, i + 1, true)
    );

    // Configure higher tournament values
    configureOPPR({
      BASE_VALUE: {
        POINTS_PER_PLAYER: 1.0, // Double the base value
        MAX_BASE_VALUE: 64,
      },
      TVA: {
        RATING: { MAX_VALUE: 50 }, // Double rating TVA
        RANKING: { MAX_VALUE: 100 }, // Double ranking TVA
      },
      TIME_DECAY: {
        YEAR_1_TO_2: 0.9, // Slower decay
      },
    });

    // Calculate with custom config
    const baseValue = calculateBaseValue(players);
    expect(baseValue).toBe(20); // 20 players * 1.0 = 20

    const ratingTVA = calculateRatingTVA(players);
    const rankingTVA = calculateRankingTVA(players);

    const tgpConfig: TGPConfig = {
      qualifying: {
        type: 'limited',
        meaningfulGames: 10,
      },
      finals: {
        formatType: 'match-play',
        meaningfulGames: 12,
      },
    };

    const tgp = calculateTGP(tgpConfig);
    const firstPlaceValue = (baseValue + ratingTVA + rankingTVA) * tgp;

    // With custom config, should get higher values
    expect(firstPlaceValue).toBeGreaterThan(20);

    // Distribute points
    const playerResults: PlayerResult[] = players.map((player, i) => ({
      player,
      position: i + 1,
    }));

    const distribution = distributePoints(playerResults, firstPlaceValue);

    // Verify distribution uses custom config
    expect(distribution[0].totalPoints).toBeCloseTo(firstPlaceValue, 0); // First place gets ~100%
    expect(distribution[0].totalPoints).toBeGreaterThan(20);
  });
});
