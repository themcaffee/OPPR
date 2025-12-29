import { describe, it, expect } from 'vitest';
import {
  calculateLinearPoints,
  calculateDynamicPoints,
  calculatePlayerPoints,
  distributePoints,
  getPointsForPosition,
} from '../src/point-distribution.js';
import type { PlayerResult } from '../src/types.js';

describe('calculateLinearPoints', () => {
  it('should calculate linear distribution for first place', () => {
    const points = calculateLinearPoints(1, 10, 100);
    expect(points).toBeCloseTo(10, 2); // (10 + 1 - 1) * 0.1 * (100/10)
  });

  it('should calculate linear distribution for last place', () => {
    const points = calculateLinearPoints(10, 10, 100);
    expect(points).toBeCloseTo(1, 2); // (10 + 1 - 10) * 0.1 * (100/10)
  });

  it('should decrease with lower finishing position', () => {
    const first = calculateLinearPoints(1, 10, 100);
    const fifth = calculateLinearPoints(5, 10, 100);
    expect(first).toBeGreaterThan(fifth);
  });
});

describe('calculateDynamicPoints', () => {
  it('should award most points to first place', () => {
    const firstPlace = calculateDynamicPoints(1, 20, 100);
    const secondPlace = calculateDynamicPoints(2, 20, 100);
    expect(firstPlace).toBeGreaterThan(secondPlace);
  });

  it('should return 0 for positions outside dynamic range', () => {
    // Dynamic range is min(ratedPlayerCount/2, 64)
    // With 20 rated players, range is 10
    const points = calculateDynamicPoints(15, 20, 100);
    expect(points).toBe(0);
  });

  it('should cap dynamic range at 64 players', () => {
    // With 200 rated players, dynamic range caps at 64
    const points64 = calculateDynamicPoints(64, 200, 100);
    const points65 = calculateDynamicPoints(65, 200, 100);
    expect(points64).toBeGreaterThan(0);
    expect(points65).toBe(0);
  });

  it('should give ~90% of points to first place', () => {
    const points = calculateDynamicPoints(1, 20, 100);
    expect(points).toBeCloseTo(90, 1);
  });
});

describe('distributePoints', () => {
  it('should distribute points to all players', () => {
    const results: PlayerResult[] = [
      {
        player: { id: '1', rating: 1800, ranking: 5, isRated: true },
        position: 1,
      },
      {
        player: { id: '2', rating: 1700, ranking: 10, isRated: true },
        position: 2,
      },
      {
        player: { id: '3', rating: 1600, ranking: 20, isRated: true },
        position: 3,
      },
    ];

    const distributions = distributePoints(results, 50);
    expect(distributions).toHaveLength(3);
    expect(distributions[0].totalPoints).toBeGreaterThan(distributions[1].totalPoints);
    expect(distributions[1].totalPoints).toBeGreaterThan(distributions[2].totalPoints);
  });

  it('should filter out opted-out players', () => {
    const results: PlayerResult[] = [
      {
        player: { id: '1', rating: 1800, ranking: 5, isRated: true },
        position: 1,
      },
      {
        player: { id: '2', rating: 1700, ranking: 10, isRated: true },
        position: 2,
        optedOut: true,
      },
    ];

    const distributions = distributePoints(results, 50);
    expect(distributions).toHaveLength(1);
    expect(distributions[0].player.id).toBe('1');
  });

  it('should sum linear and dynamic points correctly', () => {
    const results: PlayerResult[] = [
      {
        player: { id: '1', rating: 1800, ranking: 5, isRated: true },
        position: 1,
      },
    ];

    const distributions = distributePoints(results, 100);
    expect(distributions[0].totalPoints).toBe(
      distributions[0].linearPoints + distributions[0].dynamicPoints
    );
  });
});

describe('getPointsForPosition', () => {
  it('should return total points for a position', () => {
    const points = getPointsForPosition(1, 10, 10, 100);
    const linearPoints = calculateLinearPoints(1, 10, 100);
    const dynamicPoints = calculateDynamicPoints(1, 10, 100);
    expect(points).toBeCloseTo(linearPoints + dynamicPoints, 2);
  });
});
