import { describe, it, expect } from 'vitest';
import {
  calculateLinearPoints,
  calculateDynamicPoints,
  calculatePlayerPoints,
  distributePoints,
  getPointsForPosition,
  calculatePositionPercentage,
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

describe('calculatePositionPercentage', () => {
  it('should return 1.0 for first place (100%)', () => {
    const percentage = calculatePositionPercentage(1, 10, 10);
    expect(percentage).toBeCloseTo(1.0, 2);
  });

  it('should return percentage between 0 and 1', () => {
    const percentage = calculatePositionPercentage(5, 10, 10);
    expect(percentage).toBeGreaterThan(0);
    expect(percentage).toBeLessThanOrEqual(1);
  });

  it('should decrease as position gets worse', () => {
    const first = calculatePositionPercentage(1, 10, 10);
    const fifth = calculatePositionPercentage(5, 10, 10);
    const tenth = calculatePositionPercentage(10, 10, 10);

    expect(first).toBeGreaterThan(fifth);
    expect(fifth).toBeGreaterThan(tenth);
  });

  it('should match calculatePlayerPoints divided by 100', () => {
    const position = 3;
    const playerCount = 20;
    const ratedPlayerCount = 15;

    const percentage = calculatePositionPercentage(position, playerCount, ratedPlayerCount);
    const points = calculatePlayerPoints(position, playerCount, ratedPlayerCount, 100);

    expect(percentage).toBeCloseTo(points / 100, 5);
  });

  it('should handle small tournament (3 players)', () => {
    const first = calculatePositionPercentage(1, 3, 3);
    const second = calculatePositionPercentage(2, 3, 3);
    const third = calculatePositionPercentage(3, 3, 3);

    expect(first).toBeGreaterThan(second);
    expect(second).toBeGreaterThan(third);
    expect(third).toBeGreaterThan(0);
  });

  it('should handle large tournament (100 players)', () => {
    const first = calculatePositionPercentage(1, 100, 80);
    const fiftieth = calculatePositionPercentage(50, 100, 80);

    expect(first).toBeCloseTo(1.0, 2);
    expect(fiftieth).toBeLessThan(0.5);
  });

  it('should handle different rated player counts', () => {
    const lowRated = calculatePositionPercentage(10, 50, 10);
    const highRated = calculatePositionPercentage(10, 50, 40);

    // Both should be valid percentages
    expect(lowRated).toBeGreaterThan(0);
    expect(highRated).toBeGreaterThan(0);
  });

  it('should return same percentage for position 1 regardless of tournament size', () => {
    const small = calculatePositionPercentage(1, 5, 5);
    const medium = calculatePositionPercentage(1, 20, 20);
    const large = calculatePositionPercentage(1, 100, 100);

    // All first place finishes should get ~100%
    expect(small).toBeCloseTo(1.0, 1);
    expect(medium).toBeCloseTo(1.0, 1);
    expect(large).toBeCloseTo(1.0, 1);
  });

  it('should handle last place in tournament', () => {
    const percentage = calculatePositionPercentage(10, 10, 8);
    expect(percentage).toBeGreaterThan(0);
    expect(percentage).toBeLessThan(0.2); // Last place should be small percentage
  });

  it('should account for dynamic range limit (64 players)', () => {
    // Position outside dynamic range should get only linear points
    const insideRange = calculatePositionPercentage(32, 100, 100);
    const outsideRange = calculatePositionPercentage(70, 100, 100);

    expect(insideRange).toBeGreaterThan(outsideRange);
  });

  it('should handle edge case with 1 rated player', () => {
    const percentage = calculatePositionPercentage(1, 10, 1);
    expect(percentage).toBeGreaterThan(0);
    expect(percentage).toBeLessThanOrEqual(1);
  });

  it('should handle all rated players', () => {
    const percentage = calculatePositionPercentage(5, 20, 20);
    expect(percentage).toBeGreaterThan(0);
    expect(percentage).toBeLessThan(1);
  });

  it('should handle no rated players', () => {
    const percentage = calculatePositionPercentage(1, 10, 0);
    // Should still award linear points
    expect(percentage).toBeGreaterThan(0);
  });
});
