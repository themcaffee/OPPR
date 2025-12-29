import { describe, it, expect } from 'vitest';
import {
  calculatePlayerRatingContribution,
  calculateRatingTVA,
  ratingContributesToTVA,
  getTopRatedPlayers,
} from '../src/tva-rating.js';
import type { Player } from '../src/types.js';

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
      { id: '1', rating: 2000, ranking: 1, isRated: true },
      { id: '2', rating: 1800, ranking: 5, isRated: true },
      { id: '3', rating: 1600, ranking: 10, isRated: true },
    ];

    const tva = calculateRatingTVA(players);
    expect(tva).toBeGreaterThan(0);
    expect(tva).toBeLessThanOrEqual(25);
  });

  it('should cap at maximum of 25 points', () => {
    // Create 64 perfect players
    const players: Player[] = Array.from({ length: 64 }, (_, i) => ({
      id: `${i}`,
      rating: 2000,
      ranking: i + 1,
      isRated: true,
    }));

    const tva = calculateRatingTVA(players);
    expect(tva).toBeCloseTo(25, 1);
  });

  it('should only consider top 64 players', () => {
    // Create 100 players, first 64 with rating 2000, rest with 1500
    const players: Player[] = [
      ...Array.from({ length: 64 }, (_, i) => ({
        id: `top${i}`,
        rating: 2000,
        ranking: i + 1,
        isRated: true,
      })),
      ...Array.from({ length: 36 }, (_, i) => ({
        id: `bottom${i}`,
        rating: 1500,
        ranking: i + 65,
        isRated: true,
      })),
    ];

    const tva = calculateRatingTVA(players);
    expect(tva).toBeCloseTo(25, 1);
  });

  it('should return 0 for players all below threshold', () => {
    const players: Player[] = [
      { id: '1', rating: 1200, ranking: 100, isRated: true },
      { id: '2', rating: 1100, ranking: 200, isRated: true },
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
      { id: '1', rating: 1500, ranking: 50, isRated: true },
      { id: '2', rating: 1800, ranking: 10, isRated: true },
      { id: '3', rating: 1600, ranking: 30, isRated: true },
    ];

    const topPlayers = getTopRatedPlayers(players, 2);
    expect(topPlayers).toHaveLength(2);
    expect(topPlayers[0].rating).toBe(1800);
    expect(topPlayers[1].rating).toBe(1600);
  });

  it('should return all players if count exceeds array length', () => {
    const players: Player[] = [
      { id: '1', rating: 1500, ranking: 50, isRated: true },
      { id: '2', rating: 1800, ranking: 10, isRated: true },
    ];

    const topPlayers = getTopRatedPlayers(players, 10);
    expect(topPlayers).toHaveLength(2);
  });
});
