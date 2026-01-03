import { describe, it, expect, beforeEach } from 'vitest';
import {
  ratingRegistry,
  registerRatingSystem,
  getRatingSystem,
  hasRatingSystem,
  getRegisteredRatingSystems,
} from '../src/registry.js';
import type {
  RatingSystem,
  BaseRatingData,
  MatchResult,
  RatingUpdateResult,
} from '../src/types.js';

// Mock rating system for testing
class MockRatingSystem implements RatingSystem<BaseRatingData> {
  readonly id = 'mock';
  readonly name = 'Mock Rating System';

  createNewRating(): BaseRatingData {
    return { value: 1000 };
  }

  updateRating(
    currentRating: BaseRatingData,
    _results: MatchResult<BaseRatingData>[]
  ): RatingUpdateResult<BaseRatingData> {
    return { newRating: currentRating };
  }

  getRatingValue(rating: BaseRatingData): number {
    return rating.value;
  }

  isProvisional(_rating: BaseRatingData, eventCount: number): boolean {
    return eventCount < 5;
  }
}

describe('RatingSystemRegistry', () => {
  beforeEach(() => {
    ratingRegistry.clear();
  });

  describe('register', () => {
    it('should register a rating system', () => {
      const system = new MockRatingSystem();
      ratingRegistry.register(system);

      expect(ratingRegistry.has('mock')).toBe(true);
    });

    it('should throw error when registering duplicate ID', () => {
      const system1 = new MockRatingSystem();
      const system2 = new MockRatingSystem();

      ratingRegistry.register(system1);

      expect(() => ratingRegistry.register(system2)).toThrow(
        "Rating system 'mock' is already registered"
      );
    });
  });

  describe('get', () => {
    it('should return registered system', () => {
      const system = new MockRatingSystem();
      ratingRegistry.register(system);

      const retrieved = ratingRegistry.get('mock');

      expect(retrieved).toBe(system);
    });

    it('should return undefined for unregistered system', () => {
      const retrieved = ratingRegistry.get('nonexistent');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered system', () => {
      ratingRegistry.register(new MockRatingSystem());

      expect(ratingRegistry.has('mock')).toBe(true);
    });

    it('should return false for unregistered system', () => {
      expect(ratingRegistry.has('nonexistent')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no systems registered', () => {
      expect(ratingRegistry.getAll()).toEqual([]);
    });

    it('should return all registered system IDs', () => {
      ratingRegistry.register(new MockRatingSystem());

      const anotherSystem: RatingSystem = {
        id: 'another',
        name: 'Another System',
        createNewRating: () => ({ value: 1000 }),
        updateRating: (r) => ({ newRating: r }),
        getRatingValue: (r) => r.value,
        isProvisional: () => false,
      };
      ratingRegistry.register(anotherSystem);

      const ids = ratingRegistry.getAll();

      expect(ids).toContain('mock');
      expect(ids).toContain('another');
      expect(ids).toHaveLength(2);
    });
  });

  describe('unregister', () => {
    it('should remove a registered system', () => {
      ratingRegistry.register(new MockRatingSystem());

      const result = ratingRegistry.unregister('mock');

      expect(result).toBe(true);
      expect(ratingRegistry.has('mock')).toBe(false);
    });

    it('should return false for unregistered system', () => {
      const result = ratingRegistry.unregister('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all registered systems', () => {
      ratingRegistry.register(new MockRatingSystem());

      ratingRegistry.clear();

      expect(ratingRegistry.getAll()).toEqual([]);
    });
  });
});

describe('Convenience functions', () => {
  beforeEach(() => {
    ratingRegistry.clear();
  });

  describe('registerRatingSystem', () => {
    it('should register system to global registry', () => {
      registerRatingSystem(new MockRatingSystem());

      expect(hasRatingSystem('mock')).toBe(true);
    });
  });

  describe('getRatingSystem', () => {
    it('should return registered system', () => {
      const system = new MockRatingSystem();
      registerRatingSystem(system);

      const retrieved = getRatingSystem('mock');

      expect(retrieved).toBe(system);
    });

    it('should throw error for unregistered system', () => {
      expect(() => getRatingSystem('nonexistent')).toThrow(
        "Rating system 'nonexistent' not found. Available systems: none"
      );
    });

    it('should list available systems in error message', () => {
      registerRatingSystem(new MockRatingSystem());

      expect(() => getRatingSystem('other')).toThrow(
        "Rating system 'other' not found. Available systems: mock"
      );
    });
  });

  describe('hasRatingSystem', () => {
    it('should return true for registered system', () => {
      registerRatingSystem(new MockRatingSystem());

      expect(hasRatingSystem('mock')).toBe(true);
    });

    it('should return false for unregistered system', () => {
      expect(hasRatingSystem('nonexistent')).toBe(false);
    });
  });

  describe('getRegisteredRatingSystems', () => {
    it('should return all registered system IDs', () => {
      registerRatingSystem(new MockRatingSystem());

      expect(getRegisteredRatingSystems()).toContain('mock');
    });
  });
});
