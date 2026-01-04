import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { generateUniquePlayerNumber, isValidPlayerNumber } from '../src/player-number.js';
import { createPlayer } from '../src/players.js';
import { createPlayerInput, resetPlayerCounter } from './factories/player.factory.js';

beforeEach(() => {
  resetPlayerCounter();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('player-number', () => {
  describe('generateUniquePlayerNumber', () => {
    it('should generate a 5-digit number', async () => {
      const number = await generateUniquePlayerNumber();

      expect(number).toBeGreaterThanOrEqual(10000);
      expect(number).toBeLessThanOrEqual(99999);
    });

    it('should generate unique numbers', async () => {
      const numbers = await Promise.all([
        generateUniquePlayerNumber(),
        generateUniquePlayerNumber(),
        generateUniquePlayerNumber(),
      ]);
      const unique = new Set(numbers);

      expect(unique.size).toBe(3);
    });

    it('should avoid collision with existing player numbers', async () => {
      await createPlayer(createPlayerInput({ playerNumber: 50000 }));

      for (let i = 0; i < 10; i++) {
        const number = await generateUniquePlayerNumber();
        expect(number).not.toBe(50000);
      }
    });

    it('should throw error after max retries', async () => {
      // Create a player with a specific number
      const fixedNumber = 55555;
      await createPlayer(createPlayerInput({ playerNumber: fixedNumber }));

      // Mock Math.random to always return the same value that produces fixedNumber
      // The formula is: Math.floor(Math.random() * 90000) + 10000
      // To get 55555, we need: Math.floor(x * 90000) + 10000 = 55555
      // So: Math.floor(x * 90000) = 45555
      // x = 45555 / 90000 = 0.5061666...
      vi.spyOn(Math, 'random').mockReturnValue(0.50617);

      await expect(generateUniquePlayerNumber()).rejects.toThrow(
        'Failed to generate unique player number after 10 attempts',
      );
    });
  });

  describe('isValidPlayerNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidPlayerNumber(10000)).toBe(true);
      expect(isValidPlayerNumber(50000)).toBe(true);
      expect(isValidPlayerNumber(99999)).toBe(true);
    });

    it('should return false for out-of-range numbers', () => {
      expect(isValidPlayerNumber(9999)).toBe(false);
      expect(isValidPlayerNumber(100000)).toBe(false);
      expect(isValidPlayerNumber(0)).toBe(false);
      expect(isValidPlayerNumber(-1)).toBe(false);
    });

    it('should return false for non-integers', () => {
      expect(isValidPlayerNumber(10000.5)).toBe(false);
      expect(isValidPlayerNumber(NaN)).toBe(false);
    });
  });
});
