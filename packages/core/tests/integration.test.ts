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

beforeEach(() => {
  resetConfig();
});

describe('Full Tournament Calculation Integration', () => {
  it('should calculate complete tournament value and distribute points', () => {
    // Setup: 20 player tournament with mixed ratings and rankings
    const players: Player[] = [
      { id: '1', rating: 1900, ranking: 1, isRated: true },
      { id: '2', rating: 1850, ranking: 2, isRated: true },
      { id: '3', rating: 1800, ranking: 5, isRated: true },
      { id: '4', rating: 1750, ranking: 10, isRated: true },
      { id: '5', rating: 1700, ranking: 15, isRated: true },
      { id: '6', rating: 1650, ranking: 20, isRated: true },
      { id: '7', rating: 1600, ranking: 25, isRated: true },
      { id: '8', rating: 1550, ranking: 30, isRated: true },
      { id: '9', rating: 1500, ranking: 40, isRated: true },
      { id: '10', rating: 1450, ranking: 50, isRated: true },
      { id: '11', rating: 1400, ranking: 60, isRated: true },
      { id: '12', rating: 1350, ranking: 80, isRated: true },
      { id: '13', rating: 1300, ranking: 100, isRated: true },
      { id: '14', rating: 1300, ranking: 120, isRated: true },
      { id: '15', rating: 1300, ranking: 150, isRated: true },
      { id: '16', rating: 1300, ranking: 180, isRated: true },
      { id: '17', rating: 1300, ranking: 200, isRated: true },
      { id: '18', rating: 1300, ranking: 250, isRated: true },
      { id: '19', rating: 1300, ranking: 300, isRated: true },
      { id: '20', rating: 1300, ranking: 500, isRated: true },
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
    const players: Player[] = Array.from({ length: 400 }, (_, i) => ({
      id: `${i + 1}`,
      rating: 1800 - i * 2,
      ranking: i + 1,
      isRated: true,
    }));

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
      { id: '1', rating: 1600, ranking: 50, isRated: true },
      { id: '2', rating: 1550, ranking: 75, isRated: true },
      { id: '3', rating: 1500, ranking: 100, isRated: true },
      { id: '4', rating: 1450, ranking: 150, isRated: true },
      { id: '5', rating: 1400, ranking: 200, isRated: true },
      { id: '6', rating: 1350, ranking: 300, isRated: true },
      { id: '7', rating: 1300, ranking: 400, isRated: false }, // Unrated
      { id: '8', rating: 1300, ranking: 500, isRated: false }, // Unrated
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
    const players: Player[] = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      rating: 1800 - i * 20,
      ranking: i + 1,
      isRated: true,
    }));

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
