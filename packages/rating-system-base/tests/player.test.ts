import { describe, it, expect } from 'vitest';
import {
  getPrimaryRating,
  hasRating,
  getPlayerRatingSystems,
  type PlayerRatings,
} from '../src/player.js';

describe('Player utilities', () => {
  const sampleRatings: PlayerRatings = {
    glicko: { value: 1650, lastUpdated: new Date() },
    elo: { value: 1580 },
  };

  describe('getPrimaryRating', () => {
    it('should return rating value for existing system', () => {
      const value = getPrimaryRating(sampleRatings, 'glicko');

      expect(value).toBe(1650);
    });

    it('should return undefined for non-existent system', () => {
      const value = getPrimaryRating(sampleRatings, 'trueskill');

      expect(value).toBeUndefined();
    });

    it('should return undefined for undefined ratings', () => {
      const value = getPrimaryRating(undefined, 'glicko');

      expect(value).toBeUndefined();
    });

    it('should return undefined for empty ratings object', () => {
      const value = getPrimaryRating({}, 'glicko');

      expect(value).toBeUndefined();
    });
  });

  describe('hasRating', () => {
    it('should return true for existing rating', () => {
      expect(hasRating(sampleRatings, 'glicko')).toBe(true);
      expect(hasRating(sampleRatings, 'elo')).toBe(true);
    });

    it('should return false for non-existent rating', () => {
      expect(hasRating(sampleRatings, 'trueskill')).toBe(false);
    });

    it('should return false for undefined ratings', () => {
      expect(hasRating(undefined, 'glicko')).toBe(false);
    });

    it('should return false for explicitly undefined rating value', () => {
      const ratings: PlayerRatings = {
        glicko: undefined,
      };

      expect(hasRating(ratings, 'glicko')).toBe(false);
    });
  });

  describe('getPlayerRatingSystems', () => {
    it('should return all system IDs with defined ratings', () => {
      const systems = getPlayerRatingSystems(sampleRatings);

      expect(systems).toContain('glicko');
      expect(systems).toContain('elo');
      expect(systems).toHaveLength(2);
    });

    it('should return empty array for undefined ratings', () => {
      expect(getPlayerRatingSystems(undefined)).toEqual([]);
    });

    it('should return empty array for empty ratings object', () => {
      expect(getPlayerRatingSystems({})).toEqual([]);
    });

    it('should exclude undefined rating values', () => {
      const ratings: PlayerRatings = {
        glicko: { value: 1500 },
        elo: undefined,
      };

      const systems = getPlayerRatingSystems(ratings);

      expect(systems).toContain('glicko');
      expect(systems).not.toContain('elo');
      expect(systems).toHaveLength(1);
    });
  });
});
