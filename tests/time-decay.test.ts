import { describe, it, expect } from 'vitest';
import {
  calculateDaysBetween,
  calculateEventAge,
  getDecayMultiplier,
  applyTimeDecay,
  isEventActive,
} from '../src/time-decay.js';

describe('calculateDaysBetween', () => {
  it('should calculate days between two dates', () => {
    const eventDate = new Date('2024-01-01');
    const referenceDate = new Date('2024-01-11');
    const days = calculateDaysBetween(eventDate, referenceDate);
    expect(days).toBe(10);
  });

  it('should return 0 for same date', () => {
    const date = new Date('2024-01-01');
    const days = calculateDaysBetween(date, date);
    expect(days).toBe(0);
  });
});

describe('calculateEventAge', () => {
  it('should calculate age in years', () => {
    const eventDate = new Date('2022-01-01');
    const referenceDate = new Date('2024-01-01');
    const age = calculateEventAge(eventDate, referenceDate);
    expect(age).toBeCloseTo(2.0, 1);
  });

  it('should return fractional years', () => {
    const eventDate = new Date('2023-07-01');
    const referenceDate = new Date('2024-01-01');
    const age = calculateEventAge(eventDate, referenceDate);
    expect(age).toBeCloseTo(0.5, 1);
  });
});

describe('getDecayMultiplier', () => {
  it('should return 1.0 for events 0-1 years old', () => {
    expect(getDecayMultiplier(0)).toBe(1.0);
    expect(getDecayMultiplier(0.5)).toBe(1.0);
    expect(getDecayMultiplier(0.99)).toBe(1.0);
  });

  it('should return 0.75 for events 1-2 years old', () => {
    expect(getDecayMultiplier(1)).toBe(0.75);
    expect(getDecayMultiplier(1.5)).toBe(0.75);
    expect(getDecayMultiplier(1.99)).toBe(0.75);
  });

  it('should return 0.5 for events 2-3 years old', () => {
    expect(getDecayMultiplier(2)).toBe(0.5);
    expect(getDecayMultiplier(2.5)).toBe(0.5);
    expect(getDecayMultiplier(2.99)).toBe(0.5);
  });

  it('should return 0.0 for events 3+ years old', () => {
    expect(getDecayMultiplier(3)).toBe(0.0);
    expect(getDecayMultiplier(5)).toBe(0.0);
    expect(getDecayMultiplier(10)).toBe(0.0);
  });
});

describe('applyTimeDecay', () => {
  it('should not decay points for recent events (< 1 year)', () => {
    const eventDate = new Date('2024-01-01');
    const referenceDate = new Date('2024-06-01');
    const decayedPoints = applyTimeDecay(100, eventDate, { referenceDate });
    expect(decayedPoints).toBe(100);
  });

  it('should apply 75% for 1-2 year old events', () => {
    const eventDate = new Date('2022-06-01');
    const referenceDate = new Date('2024-01-01');
    const decayedPoints = applyTimeDecay(100, eventDate, { referenceDate });
    expect(decayedPoints).toBe(75);
  });

  it('should apply 50% for 2-3 year old events', () => {
    const eventDate = new Date('2021-06-01');
    const referenceDate = new Date('2024-01-01');
    const decayedPoints = applyTimeDecay(100, eventDate, { referenceDate });
    expect(decayedPoints).toBe(50);
  });

  it('should apply 0% for 3+ year old events', () => {
    const eventDate = new Date('2020-01-01');
    const referenceDate = new Date('2024-01-01');
    const decayedPoints = applyTimeDecay(100, eventDate, { referenceDate });
    expect(decayedPoints).toBe(0);
  });
});

describe('isEventActive', () => {
  it('should return true for events < 3 years old', () => {
    const eventDate = new Date('2023-01-01');
    const referenceDate = new Date('2024-01-01');
    expect(isEventActive(eventDate, { referenceDate })).toBe(true);
  });

  it('should return false for events >= 3 years old', () => {
    const eventDate = new Date('2020-01-01');
    const referenceDate = new Date('2024-01-01');
    expect(isEventActive(eventDate, { referenceDate })).toBe(false);
  });

  it('should handle edge case at exactly 3 years', () => {
    const eventDate = new Date('2021-01-01');
    const referenceDate = new Date('2024-01-01');
    expect(isEventActive(eventDate, { referenceDate })).toBe(false);
  });
});
