import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDaysBetween,
  calculateEventAge,
  getDecayMultiplier,
  calculateDecayMultiplier,
  applyTimeDecay,
  isEventActive,
  filterActiveEvents,
  getEventDecayInfo,
} from '../src/time-decay.js';
import { resetConfig, configureOPPR } from '../src/config.js';

beforeEach(() => {
  resetConfig();
});

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

describe('calculateDecayMultiplier', () => {
  it('should return 1.0 for events less than 1 year old', () => {
    const eventDate = new Date('2023-06-01');
    const referenceDate = new Date('2024-01-01');
    const multiplier = calculateDecayMultiplier(eventDate, { referenceDate });
    expect(multiplier).toBe(1.0);
  });

  it('should return 0.75 for events 1-2 years old', () => {
    const eventDate = new Date('2022-06-01');
    const referenceDate = new Date('2024-01-01');
    const multiplier = calculateDecayMultiplier(eventDate, { referenceDate });
    expect(multiplier).toBe(0.75);
  });

  it('should return 0.5 for events 2-3 years old', () => {
    const eventDate = new Date('2021-06-01');
    const referenceDate = new Date('2024-01-01');
    const multiplier = calculateDecayMultiplier(eventDate, { referenceDate });
    expect(multiplier).toBe(0.5);
  });

  it('should return 0.0 for events 3+ years old', () => {
    const eventDate = new Date('2020-01-01');
    const referenceDate = new Date('2024-01-01');
    const multiplier = calculateDecayMultiplier(eventDate, { referenceDate });
    expect(multiplier).toBe(0.0);
  });

  it('should use current date when config not provided', () => {
    const eventDate = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000); // ~6 months ago
    const multiplier = calculateDecayMultiplier(eventDate);
    expect(multiplier).toBe(1.0);
  });

  it('should handle edge case at exactly 1 year', () => {
    const eventDate = new Date('2023-01-01');
    const referenceDate = new Date('2024-01-01');
    const multiplier = calculateDecayMultiplier(eventDate, { referenceDate });
    expect(multiplier).toBe(0.75);
  });

  it('should handle edge case at exactly 2 years', () => {
    const eventDate = new Date('2022-01-01');
    const referenceDate = new Date('2024-01-01');
    const multiplier = calculateDecayMultiplier(eventDate, { referenceDate });
    expect(multiplier).toBe(0.5);
  });

  it('should handle edge case at exactly 3 years', () => {
    const eventDate = new Date('2021-01-01');
    const referenceDate = new Date('2024-01-01');
    const multiplier = calculateDecayMultiplier(eventDate, { referenceDate });
    expect(multiplier).toBe(0.0);
  });
});

describe('filterActiveEvents', () => {
  it('should filter out events older than 3 years', () => {
    const referenceDate = new Date('2024-01-01');
    const events = [
      new Date('2023-06-01'), // 0.5 years - active
      new Date('2022-01-01'), // 2 years - active
      new Date('2020-01-01'), // 4 years - inactive
      new Date('2023-01-01'), // 1 year - active
      new Date('2019-01-01'), // 5 years - inactive
    ];

    const activeEvents = filterActiveEvents(events, { referenceDate });

    expect(activeEvents).toHaveLength(3);
    expect(activeEvents).toContainEqual(new Date('2023-06-01'));
    expect(activeEvents).toContainEqual(new Date('2022-01-01'));
    expect(activeEvents).toContainEqual(new Date('2023-01-01'));
  });

  it('should return empty array when all events are inactive', () => {
    const referenceDate = new Date('2024-01-01');
    const events = [new Date('2020-01-01'), new Date('2019-01-01'), new Date('2018-01-01')];

    const activeEvents = filterActiveEvents(events, { referenceDate });

    expect(activeEvents).toHaveLength(0);
  });

  it('should return all events when all are active', () => {
    const referenceDate = new Date('2024-01-01');
    const events = [new Date('2023-06-01'), new Date('2023-01-01'), new Date('2022-06-01')];

    const activeEvents = filterActiveEvents(events, { referenceDate });

    expect(activeEvents).toHaveLength(3);
  });

  it('should handle empty events array', () => {
    const referenceDate = new Date('2024-01-01');
    const activeEvents = filterActiveEvents([], { referenceDate });

    expect(activeEvents).toHaveLength(0);
  });

  it('should use current date when config not provided', () => {
    const now = new Date();
    const events = [
      new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000), // ~6 months ago
      new Date(now.getTime() - 4 * 365 * 24 * 60 * 60 * 1000), // ~4 years ago
    ];

    const activeEvents = filterActiveEvents(events);

    expect(activeEvents).toHaveLength(1);
  });

  it('should handle edge case at exactly 3 years', () => {
    const referenceDate = new Date('2024-01-01');
    const events = [
      new Date('2021-01-02'), // Just under 3 years - active
      new Date('2021-01-01'), // Exactly 3 years - inactive
      new Date('2020-12-31'), // Just over 3 years - inactive
    ];

    const activeEvents = filterActiveEvents(events, { referenceDate });

    expect(activeEvents).toHaveLength(1);
    expect(activeEvents).toContainEqual(new Date('2021-01-02'));
  });

  it('should preserve order of active events', () => {
    const referenceDate = new Date('2024-01-01');
    const events = [
      new Date('2023-06-01'),
      new Date('2020-01-01'), // Inactive
      new Date('2023-01-01'),
      new Date('2022-06-01'),
    ];

    const activeEvents = filterActiveEvents(events, { referenceDate });

    expect(activeEvents).toHaveLength(3);
    expect(activeEvents[0]).toEqual(new Date('2023-06-01'));
    expect(activeEvents[1]).toEqual(new Date('2023-01-01'));
    expect(activeEvents[2]).toEqual(new Date('2022-06-01'));
  });
});

describe('getEventDecayInfo', () => {
  it('should return complete decay info for recent event', () => {
    const eventDate = new Date('2023-07-01');
    const referenceDate = new Date('2024-01-01');

    const info = getEventDecayInfo(eventDate, { referenceDate });

    expect(info.ageInDays).toBe(184); // ~6 months
    expect(info.ageInYears).toBeCloseTo(0.5, 1);
    expect(info.decayMultiplier).toBe(1.0);
    expect(info.isActive).toBe(true);
  });

  it('should return correct info for 1-2 year old event', () => {
    const eventDate = new Date('2022-06-01');
    const referenceDate = new Date('2024-01-01');

    const info = getEventDecayInfo(eventDate, { referenceDate });

    expect(info.ageInYears).toBeCloseTo(1.6, 1);
    expect(info.decayMultiplier).toBe(0.75);
    expect(info.isActive).toBe(true);
  });

  it('should return correct info for 2-3 year old event', () => {
    const eventDate = new Date('2021-06-01');
    const referenceDate = new Date('2024-01-01');

    const info = getEventDecayInfo(eventDate, { referenceDate });

    expect(info.ageInYears).toBeCloseTo(2.6, 1);
    expect(info.decayMultiplier).toBe(0.5);
    expect(info.isActive).toBe(true);
  });

  it('should return correct info for inactive event (3+ years)', () => {
    const eventDate = new Date('2020-01-01');
    const referenceDate = new Date('2024-01-01');

    const info = getEventDecayInfo(eventDate, { referenceDate });

    expect(info.ageInDays).toBe(1461); // 4 years
    expect(info.ageInYears).toBeCloseTo(4.0, 1);
    expect(info.decayMultiplier).toBe(0.0);
    expect(info.isActive).toBe(false);
  });

  it('should use current date when config not provided', () => {
    const eventDate = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000); // 100 days ago

    const info = getEventDecayInfo(eventDate);

    expect(info.ageInDays).toBeGreaterThanOrEqual(99);
    expect(info.ageInDays).toBeLessThanOrEqual(101);
    expect(info.decayMultiplier).toBe(1.0);
    expect(info.isActive).toBe(true);
  });

  it('should return all required properties', () => {
    const eventDate = new Date('2023-01-01');
    const referenceDate = new Date('2024-01-01');

    const info = getEventDecayInfo(eventDate, { referenceDate });

    expect(info).toHaveProperty('ageInDays');
    expect(info).toHaveProperty('ageInYears');
    expect(info).toHaveProperty('decayMultiplier');
    expect(info).toHaveProperty('isActive');
  });

  it('should handle edge case at exactly 1 year', () => {
    const eventDate = new Date('2023-01-01');
    const referenceDate = new Date('2024-01-01');

    const info = getEventDecayInfo(eventDate, { referenceDate });

    expect(info.ageInDays).toBe(365);
    expect(info.ageInYears).toBeCloseTo(1.0, 1);
    expect(info.decayMultiplier).toBe(0.75);
    expect(info.isActive).toBe(true);
  });

  it('should handle edge case at exactly 3 years', () => {
    const eventDate = new Date('2021-01-01');
    const referenceDate = new Date('2024-01-01');

    const info = getEventDecayInfo(eventDate, { referenceDate });

    expect(info.ageInYears).toBeCloseTo(3.0, 1);
    expect(info.decayMultiplier).toBe(0.0);
    expect(info.isActive).toBe(false);
  });

  it('should handle same date (0 age)', () => {
    const date = new Date('2024-01-01');

    const info = getEventDecayInfo(date, { referenceDate: date });

    expect(info.ageInDays).toBe(0);
    expect(info.ageInYears).toBe(0);
    expect(info.decayMultiplier).toBe(1.0);
    expect(info.isActive).toBe(true);
  });
});

describe('Configuration Tests', () => {
  describe('getDecayMultiplier with custom config', () => {
    it('should use custom YEAR_0_TO_1', () => {
      // Default: YEAR_0_TO_1 = 1.0
      expect(getDecayMultiplier(0.5)).toBe(1.0);

      // Custom: YEAR_0_TO_1 = 0.95
      configureOPPR({ TIME_DECAY: { YEAR_0_TO_1: 0.95 } });
      expect(getDecayMultiplier(0.5)).toBe(0.95);
    });

    it('should use custom YEAR_1_TO_2', () => {
      // Default: YEAR_1_TO_2 = 0.75
      expect(getDecayMultiplier(1.5)).toBe(0.75);

      // Custom: YEAR_1_TO_2 = 0.85
      configureOPPR({ TIME_DECAY: { YEAR_1_TO_2: 0.85 } });
      expect(getDecayMultiplier(1.5)).toBe(0.85);
    });

    it('should use custom YEAR_2_TO_3', () => {
      // Default: YEAR_2_TO_3 = 0.5
      expect(getDecayMultiplier(2.5)).toBe(0.5);

      // Custom: YEAR_2_TO_3 = 0.6
      configureOPPR({ TIME_DECAY: { YEAR_2_TO_3: 0.6 } });
      expect(getDecayMultiplier(2.5)).toBe(0.6);
    });

    it('should use custom YEAR_3_PLUS', () => {
      // Default: YEAR_3_PLUS = 0.0
      expect(getDecayMultiplier(4)).toBe(0.0);

      // Custom: YEAR_3_PLUS = 0.25 (keep some value for old events)
      configureOPPR({ TIME_DECAY: { YEAR_3_PLUS: 0.25 } });
      expect(getDecayMultiplier(4)).toBe(0.25);
    });

    it('should use all custom decay values', () => {
      configureOPPR({
        TIME_DECAY: {
          YEAR_0_TO_1: 1.0,
          YEAR_1_TO_2: 0.9,
          YEAR_2_TO_3: 0.7,
          YEAR_3_PLUS: 0.5,
        },
      });

      expect(getDecayMultiplier(0.5)).toBe(1.0);
      expect(getDecayMultiplier(1.5)).toBe(0.9);
      expect(getDecayMultiplier(2.5)).toBe(0.7);
      expect(getDecayMultiplier(3.5)).toBe(0.5);
    });
  });

  describe('calculateEventAge with custom config', () => {
    it('should use custom DAYS_PER_YEAR', () => {
      const eventDate = new Date('2023-01-01');
      const referenceDate = new Date('2023-12-31'); // 364 days later

      // Default: DAYS_PER_YEAR = 365
      const defaultAge = calculateEventAge(eventDate, referenceDate);
      expect(defaultAge).toBeCloseTo(364 / 365, 3);

      // Custom: DAYS_PER_YEAR = 360 (simplified year)
      configureOPPR({ TIME_DECAY: { DAYS_PER_YEAR: 360 } });
      const customAge = calculateEventAge(eventDate, referenceDate);
      expect(customAge).toBeCloseTo(364 / 360, 3);
    });

    it('should affect decay calculation with custom DAYS_PER_YEAR', () => {
      const eventDate = new Date('2023-01-01');
      const referenceDate = new Date('2024-07-01'); // 547 days later

      // Default: 547 / 365 = 1.5 years → decay = 0.75
      const defaultDecay = calculateDecayMultiplier(eventDate, { referenceDate });
      expect(defaultDecay).toBe(0.75);

      // Custom: 547 / 360 = 1.52 years → still 0.75
      configureOPPR({ TIME_DECAY: { DAYS_PER_YEAR: 360 } });
      const customDecay = calculateDecayMultiplier(eventDate, { referenceDate });
      expect(customDecay).toBe(0.75);
    });
  });

  describe('applyTimeDecay with custom config', () => {
    it('should apply custom decay values to points', () => {
      const points = 100;
      const eventDate = new Date('2022-01-01');
      const referenceDate = new Date('2023-07-01'); // 1.5 years

      // Default: 100 * 0.75 = 75
      const defaultDecayed = applyTimeDecay(points, eventDate, { referenceDate });
      expect(defaultDecayed).toBe(75);

      // Custom: 100 * 0.9 = 90
      configureOPPR({ TIME_DECAY: { YEAR_1_TO_2: 0.9 } });
      const customDecayed = applyTimeDecay(points, eventDate, { referenceDate });
      expect(customDecayed).toBe(90);
    });

    it('should apply custom decay for older events', () => {
      const points = 100;
      const eventDate = new Date('2020-01-01');
      const referenceDate = new Date('2024-01-01'); // 4 years

      // Default: 100 * 0.0 = 0
      const defaultDecayed = applyTimeDecay(points, eventDate, { referenceDate });
      expect(defaultDecayed).toBe(0);

      // Custom: 100 * 0.5 = 50 (keep some value for old events)
      configureOPPR({ TIME_DECAY: { YEAR_3_PLUS: 0.5 } });
      const customDecayed = applyTimeDecay(points, eventDate, { referenceDate });
      expect(customDecayed).toBe(50);
    });
  });
});
