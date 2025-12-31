import { describe, it, expect } from 'vitest';
import { toOPPRResults, sortStandingsByPosition } from '../../src/transformers/standings.js';
import { sampleStandings } from '../fixtures/index.js';
import type { Player } from '@opprs/core';

describe('toOPPRResults', () => {
  it('should transform standings to player results', () => {
    const results = toOPPRResults(sampleStandings);

    expect(results).toHaveLength(4);
    expect(results[0].position).toBe(1);
    expect(results[0].player.id).toBe('1001');
    expect(results[0].optedOut).toBe(false);
  });

  it('should preserve position ordering', () => {
    const results = toOPPRResults(sampleStandings);

    expect(results[0].position).toBe(1);
    expect(results[1].position).toBe(2);
    expect(results[2].position).toBe(3);
    expect(results[3].position).toBe(4);
  });

  it('should use enriched player data from player map', () => {
    const playerMap = new Map<string, Player>([
      [
        '1001',
        {
          id: '1001',
          rating: 1850,
          ranking: 250,
          isRated: true,
          ratingDeviation: 45,
          eventCount: 120,
        },
      ],
    ]);

    const results = toOPPRResults(sampleStandings, playerMap);

    // First player should have enriched data
    expect(results[0].player.rating).toBe(1850);
    expect(results[0].player.ranking).toBe(250);

    // Second player should have default data (not in map)
    expect(results[1].player.rating).toBe(1500); // Default
  });

  it('should handle empty standings', () => {
    const results = toOPPRResults([]);

    expect(results).toHaveLength(0);
  });
});

describe('sortStandingsByPosition', () => {
  it('should sort standings by position', () => {
    const unsortedStandings = [sampleStandings[2], sampleStandings[0], sampleStandings[3], sampleStandings[1]];

    const sorted = sortStandingsByPosition(unsortedStandings);

    expect(sorted[0].position).toBe(1);
    expect(sorted[1].position).toBe(2);
    expect(sorted[2].position).toBe(3);
    expect(sorted[3].position).toBe(4);
  });

  it('should not mutate original array', () => {
    const original = [...sampleStandings].reverse();
    const originalCopy = [...original];

    sortStandingsByPosition(original);

    expect(original).toEqual(originalCopy);
  });
});
