import { describe, it, expect } from 'vitest';
import {
  calculateEventEfficiency,
  calculateOverallEfficiency,
  calculateTopNEfficiency,
  calculateDecayedEfficiency,
  analyzeEfficiencyTrend,
  getEfficiencyStats,
} from '../src/efficiency.js';
import type { PlayerEvent, Tournament, Player } from '../src/types.js';

describe('calculateEventEfficiency', () => {
  it('should calculate efficiency correctly', () => {
    const efficiency = calculateEventEfficiency(30, 50);
    expect(efficiency).toBe(60); // 30/50 * 100 = 60%
  });

  it('should return 100 for first place (full points)', () => {
    const efficiency = calculateEventEfficiency(50, 50);
    expect(efficiency).toBe(100);
  });

  it('should return 0 for zero points earned', () => {
    const efficiency = calculateEventEfficiency(0, 50);
    expect(efficiency).toBe(0);
  });

  it('should return 0 when first place value is zero', () => {
    const efficiency = calculateEventEfficiency(30, 0);
    expect(efficiency).toBe(0);
  });

  it('should handle decimal values', () => {
    const efficiency = calculateEventEfficiency(33.33, 100);
    expect(efficiency).toBeCloseTo(33.33, 2);
  });

  it('should handle very small efficiency values', () => {
    const efficiency = calculateEventEfficiency(1, 1000);
    expect(efficiency).toBe(0.1);
  });

  it('should handle equal values (100% efficiency)', () => {
    const efficiency = calculateEventEfficiency(123.45, 123.45);
    expect(efficiency).toBe(100);
  });
});

describe('calculateOverallEfficiency', () => {
  const createEvent = (
    pointsEarned: number,
    firstPlaceValue: number,
    decayMultiplier = 1
  ): PlayerEvent => ({
    tournament: {} as Tournament,
    position: 1,
    pointsEarned,
    firstPlaceValue,
    date: new Date('2024-01-01'),
    ageInDays: 30,
    decayMultiplier,
    decayedPoints: pointsEarned * decayMultiplier,
  });

  it('should calculate overall efficiency correctly', () => {
    const events: PlayerEvent[] = [
      createEvent(30, 50),
      createEvent(15, 40),
      createEvent(40, 60),
    ];

    const efficiency = calculateOverallEfficiency(events);
    // Total: 85 points / 150 available = 56.67%
    expect(efficiency).toBeCloseTo(56.67, 1);
  });

  it('should return 0 for empty events array', () => {
    const efficiency = calculateOverallEfficiency([]);
    expect(efficiency).toBe(0);
  });

  it('should exclude inactive events (decayMultiplier = 0)', () => {
    const events: PlayerEvent[] = [
      createEvent(30, 50, 1), // Active
      createEvent(40, 60, 0), // Inactive
    ];

    const efficiency = calculateOverallEfficiency(events);
    // Should only count first event: 30/50 = 60%
    expect(efficiency).toBe(60);
  });

  it('should return 0 when only inactive events exist', () => {
    const events: PlayerEvent[] = [createEvent(30, 50, 0), createEvent(40, 60, 0)];

    const efficiency = calculateOverallEfficiency(events);
    expect(efficiency).toBe(0);
  });

  it('should return 0 when total first place value is zero', () => {
    const events: PlayerEvent[] = [createEvent(0, 0)];

    const efficiency = calculateOverallEfficiency(events);
    expect(efficiency).toBe(0);
  });

  it('should handle single event', () => {
    const events: PlayerEvent[] = [createEvent(25, 50)];

    const efficiency = calculateOverallEfficiency(events);
    expect(efficiency).toBe(50);
  });

  it('should handle perfect efficiency (100%)', () => {
    const events: PlayerEvent[] = [createEvent(50, 50), createEvent(60, 60)];

    const efficiency = calculateOverallEfficiency(events);
    expect(efficiency).toBe(100);
  });

  it('should include events with partial decay', () => {
    const events: PlayerEvent[] = [createEvent(30, 50, 1), createEvent(40, 60, 0.75)];

    // Both should be included (decayMultiplier > 0)
    const efficiency = calculateOverallEfficiency(events);
    expect(efficiency).toBeCloseTo(63.64, 1); // 70/110 = 63.64%
  });
});

describe('calculateTopNEfficiency', () => {
  const createEvent = (
    pointsEarned: number,
    firstPlaceValue: number,
    decayMultiplier = 1
  ): PlayerEvent => ({
    tournament: {} as Tournament,
    position: 1,
    pointsEarned,
    firstPlaceValue,
    date: new Date('2024-01-01'),
    ageInDays: 30,
    decayMultiplier,
    decayedPoints: pointsEarned * decayMultiplier,
  });

  it('should calculate efficiency for top N events', () => {
    const events: PlayerEvent[] = [
      createEvent(50, 100), // 50%
      createEvent(60, 100), // 60%
      createEvent(40, 100), // 40%
      createEvent(30, 100), // 30%
    ];

    const efficiency = calculateTopNEfficiency(events, 2);
    // Top 2: 60 and 50 = 110/200 = 55%
    expect(efficiency).toBeCloseTo(55, 1);
  });

  it('should use default topN of 15 when not specified', () => {
    const events: PlayerEvent[] = Array(20)
      .fill(null)
      .map(() => createEvent(50, 100));

    const efficiency = calculateTopNEfficiency(events);
    // Should only use 15 events (default)
    expect(efficiency).toBe(50);
  });

  it('should handle fewer events than topN', () => {
    const events: PlayerEvent[] = [createEvent(30, 50), createEvent(40, 60)];

    const efficiency = calculateTopNEfficiency(events, 10);
    // Should use all events when fewer than topN
    expect(efficiency).toBeCloseTo(63.64, 1);
  });

  it('should exclude inactive events', () => {
    const events: PlayerEvent[] = [
      createEvent(60, 100, 1), // Active
      createEvent(50, 100, 1), // Active
      createEvent(100, 100, 0), // Inactive (would be top)
    ];

    const efficiency = calculateTopNEfficiency(events, 2);
    // Should only use active events
    expect(efficiency).toBeCloseTo(55, 1); // (60+50)/(100+100) = 55%
  });

  it('should return 0 for empty events', () => {
    const efficiency = calculateTopNEfficiency([], 15);
    expect(efficiency).toBe(0);
  });

  it('should correctly sort by points earned', () => {
    const events: PlayerEvent[] = [
      createEvent(30, 100),
      createEvent(70, 100),
      createEvent(50, 100),
    ];

    const efficiency = calculateTopNEfficiency(events, 2);
    // Top 2: 70 and 50 = 120/200 = 60%
    expect(efficiency).toBe(60);
  });
});

describe('calculateDecayedEfficiency', () => {
  const createEvent = (
    pointsEarned: number,
    firstPlaceValue: number,
    decayMultiplier: number
  ): PlayerEvent => ({
    tournament: {} as Tournament,
    position: 1,
    pointsEarned,
    firstPlaceValue,
    date: new Date('2024-01-01'),
    ageInDays: 30,
    decayMultiplier,
    decayedPoints: pointsEarned * decayMultiplier,
  });

  it('should calculate efficiency using decayed points', () => {
    const events: PlayerEvent[] = [
      createEvent(50, 100, 1.0), // 50 decayed points
      createEvent(60, 100, 0.75), // 45 decayed points
    ];

    const efficiency = calculateDecayedEfficiency(events);
    // (50 + 45) / (100 + 100) = 47.5%
    expect(efficiency).toBe(47.5);
  });

  it('should return 0 for empty events', () => {
    const efficiency = calculateDecayedEfficiency([]);
    expect(efficiency).toBe(0);
  });

  it('should exclude inactive events (decayMultiplier = 0)', () => {
    const events: PlayerEvent[] = [
      createEvent(50, 100, 1.0), // Active
      createEvent(60, 100, 0), // Inactive
    ];

    const efficiency = calculateDecayedEfficiency(events);
    // Only first event: 50/100 = 50%
    expect(efficiency).toBe(50);
  });

  it('should return 0 when total first place value is zero', () => {
    const events: PlayerEvent[] = [createEvent(0, 0, 1)];

    const efficiency = calculateDecayedEfficiency(events);
    expect(efficiency).toBe(0);
  });

  it('should handle varying decay multipliers', () => {
    const events: PlayerEvent[] = [
      createEvent(100, 100, 1.0), // 100 decayed
      createEvent(100, 100, 0.75), // 75 decayed
      createEvent(100, 100, 0.5), // 50 decayed
    ];

    const efficiency = calculateDecayedEfficiency(events);
    // (100 + 75 + 50) / (100 + 100 + 100) = 75%
    expect(efficiency).toBe(75);
  });

  it('should differ from non-decayed efficiency', () => {
    const events: PlayerEvent[] = [createEvent(50, 100, 0.5)];

    const decayedEfficiency = calculateDecayedEfficiency(events);
    const regularEfficiency = calculateOverallEfficiency(events);

    expect(decayedEfficiency).toBe(25); // 25/100
    expect(regularEfficiency).toBe(50); // 50/100
  });
});

describe('analyzeEfficiencyTrend', () => {
  const createEvent = (
    pointsEarned: number,
    firstPlaceValue: number,
    date: Date,
    decayMultiplier = 1
  ): PlayerEvent => ({
    tournament: {} as Tournament,
    position: 1,
    pointsEarned,
    firstPlaceValue,
    date,
    ageInDays: 30,
    decayMultiplier,
    decayedPoints: pointsEarned * decayMultiplier,
  });

  it('should detect improving trend', () => {
    const events: PlayerEvent[] = [
      // Recent events (higher efficiency)
      createEvent(80, 100, new Date('2024-06-01')),
      createEvent(85, 100, new Date('2024-05-01')),
      // Older events (lower efficiency)
      createEvent(40, 100, new Date('2024-01-01')),
      createEvent(35, 100, new Date('2024-02-01')),
    ];

    const trend = analyzeEfficiencyTrend(events, 2);
    expect(trend.trend).toBe('improving');
    expect(trend.recentEfficiency).toBeGreaterThan(trend.overallEfficiency);
  });

  it('should detect declining trend', () => {
    const events: PlayerEvent[] = [
      // Recent events (lower efficiency)
      createEvent(40, 100, new Date('2024-06-01')),
      createEvent(35, 100, new Date('2024-05-01')),
      // Older events (higher efficiency)
      createEvent(80, 100, new Date('2024-01-01')),
      createEvent(85, 100, new Date('2024-02-01')),
    ];

    const trend = analyzeEfficiencyTrend(events, 2);
    expect(trend.trend).toBe('declining');
    expect(trend.recentEfficiency).toBeLessThan(trend.overallEfficiency);
  });

  it('should detect stable trend (< 5% difference)', () => {
    const events: PlayerEvent[] = Array(10)
      .fill(null)
      .map((_, i) => createEvent(50, 100, new Date(2024, 0, i + 1)));

    const trend = analyzeEfficiencyTrend(events);
    expect(trend.trend).toBe('stable');
    expect(Math.abs(trend.recentEfficiency - trend.overallEfficiency)).toBeLessThan(5);
  });

  it('should use default window size of 10', () => {
    const events: PlayerEvent[] = Array(20)
      .fill(null)
      .map((_, i) => createEvent(50, 100, new Date(2024, 0, i + 1)));

    const trend = analyzeEfficiencyTrend(events);
    expect(trend).toHaveProperty('overallEfficiency');
    expect(trend).toHaveProperty('recentEfficiency');
    expect(trend).toHaveProperty('trend');
  });

  it('should handle custom window size', () => {
    const events: PlayerEvent[] = [
      createEvent(80, 100, new Date('2024-06-01')),
      createEvent(85, 100, new Date('2024-05-01')),
      createEvent(90, 100, new Date('2024-04-01')),
      createEvent(40, 100, new Date('2024-01-01')),
    ];

    const trend = analyzeEfficiencyTrend(events, 3);
    // Recent 3 should be very high efficiency
    expect(trend.recentEfficiency).toBeGreaterThan(80);
  });

  it('should exclude inactive events', () => {
    const events: PlayerEvent[] = [
      createEvent(80, 100, new Date('2024-06-01'), 1),
      createEvent(100, 100, new Date('2024-05-01'), 0), // Inactive
      createEvent(40, 100, new Date('2024-01-01'), 1),
    ];

    const trend = analyzeEfficiencyTrend(events, 2);
    // Should only use active events
    expect(trend.overallEfficiency).toBe(60); // (80+40)/(100+100)
  });

  it('should sort events by date correctly', () => {
    const events: PlayerEvent[] = [
      createEvent(40, 100, new Date('2024-01-01')),
      createEvent(80, 100, new Date('2024-06-01')),
      createEvent(85, 100, new Date('2024-05-01')),
    ];

    const trend = analyzeEfficiencyTrend(events, 2);
    // Most recent should be June and May (80 and 85)
    expect(trend.recentEfficiency).toBe(82.5); // (80+85)/200
  });

  it('should handle empty events array', () => {
    const trend = analyzeEfficiencyTrend([]);
    expect(trend.overallEfficiency).toBe(0);
    expect(trend.recentEfficiency).toBe(0);
    expect(trend.trend).toBe('stable');
  });
});

describe('getEfficiencyStats', () => {
  const createEvent = (
    pointsEarned: number,
    firstPlaceValue: number,
    decayMultiplier = 1
  ): PlayerEvent => ({
    tournament: {} as Tournament,
    position: 1,
    pointsEarned,
    firstPlaceValue,
    date: new Date('2024-01-01'),
    ageInDays: 30,
    decayMultiplier,
    decayedPoints: pointsEarned * decayMultiplier,
  });

  it('should calculate all efficiency statistics', () => {
    const events: PlayerEvent[] = [
      createEvent(80, 100), // 80%
      createEvent(60, 100), // 60%
      createEvent(40, 100), // 40%
      createEvent(20, 100), // 20%
    ];

    const stats = getEfficiencyStats(events);

    expect(stats.overall).toBe(50); // 200/400
    expect(stats.best).toBe(80);
    expect(stats.worst).toBe(20);
    expect(stats.average).toBe(50); // (80+60+40+20)/4
    expect(stats.median).toBe(40); // Middle value when sorted
  });

  it('should return zeros for empty events array', () => {
    const stats = getEfficiencyStats([]);

    expect(stats.overall).toBe(0);
    expect(stats.top15).toBe(0);
    expect(stats.best).toBe(0);
    expect(stats.worst).toBe(0);
    expect(stats.average).toBe(0);
    expect(stats.median).toBe(0);
  });

  it('should handle single event', () => {
    const events: PlayerEvent[] = [createEvent(50, 100)];

    const stats = getEfficiencyStats(events);

    expect(stats.overall).toBe(50);
    expect(stats.best).toBe(50);
    expect(stats.worst).toBe(50);
    expect(stats.average).toBe(50);
    expect(stats.median).toBe(50);
  });

  it('should exclude inactive events', () => {
    const events: PlayerEvent[] = [
      createEvent(80, 100, 1), // Active
      createEvent(60, 100, 1), // Active
      createEvent(100, 100, 0), // Inactive
    ];

    const stats = getEfficiencyStats(events);

    expect(stats.best).toBe(80); // Not 100
    expect(stats.overall).toBe(70); // (80+60)/(100+100)
  });

  it('should calculate median correctly for odd number of events', () => {
    const events: PlayerEvent[] = [
      createEvent(20, 100), // 20%
      createEvent(40, 100), // 40%
      createEvent(60, 100), // 60%
    ];

    const stats = getEfficiencyStats(events);
    expect(stats.median).toBe(40); // Middle value
  });

  it('should calculate median correctly for even number of events', () => {
    const events: PlayerEvent[] = [
      createEvent(20, 100), // 20%
      createEvent(40, 100), // 40%
      createEvent(60, 100), // 60%
      createEvent(80, 100), // 80%
    ];

    const stats = getEfficiencyStats(events);
    // With even count, takes the lower middle value (floor)
    expect(stats.median).toBe(40);
  });

  it('should calculate top15 efficiency separately', () => {
    const events: PlayerEvent[] = Array(20)
      .fill(null)
      .map((_, i) => createEvent(50 + i * 2, 100)); // Varying efficiency

    const stats = getEfficiencyStats(events);

    // top15 should be higher than overall (takes best events)
    expect(stats.top15).toBeGreaterThanOrEqual(stats.overall);
  });

  it('should handle all same efficiency values', () => {
    const events: PlayerEvent[] = [
      createEvent(50, 100),
      createEvent(50, 100),
      createEvent(50, 100),
    ];

    const stats = getEfficiencyStats(events);

    expect(stats.overall).toBe(50);
    expect(stats.best).toBe(50);
    expect(stats.worst).toBe(50);
    expect(stats.average).toBe(50);
    expect(stats.median).toBe(50);
  });

  it('should handle varying event values correctly', () => {
    const events: PlayerEvent[] = [
      createEvent(100, 100), // 100%
      createEvent(0, 100), // 0%
      createEvent(50, 100), // 50%
    ];

    const stats = getEfficiencyStats(events);

    expect(stats.best).toBe(100);
    expect(stats.worst).toBe(0);
    expect(stats.average).toBeCloseTo(50, 1);
  });
});
