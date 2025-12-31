import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, connect, disconnect, testConnection } from '../src/client.js';

describe('client', () => {
  describe('prisma', () => {
    it('should be a valid PrismaClient instance', () => {
      expect(prisma).toBeDefined();
      expect(prisma.$connect).toBeDefined();
      expect(prisma.$disconnect).toBeDefined();
      expect(prisma.$queryRaw).toBeDefined();
    });

    it('should have player, tournament, and tournamentResult models', () => {
      expect(prisma.player).toBeDefined();
      expect(prisma.tournament).toBeDefined();
      expect(prisma.tournamentResult).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should connect to the database successfully', async () => {
      await expect(connect()).resolves.not.toThrow();
    });

    it('should be idempotent (can be called multiple times)', async () => {
      await connect();
      await expect(connect()).resolves.not.toThrow();
    });
  });

  describe('disconnect', () => {
    it('should disconnect from the database successfully', async () => {
      await connect();
      await expect(disconnect()).resolves.not.toThrow();
    });

    it('should be idempotent (can be called multiple times)', async () => {
      await disconnect();
      await expect(disconnect()).resolves.not.toThrow();
    });
  });

  describe('testConnection', () => {
    beforeEach(async () => {
      // Ensure we're connected before each test
      await connect();
    });

    it('should return true when database is reachable', async () => {
      const result = await testConnection();
      expect(result).toBe(true);
    });

    it('should return false and log error when query fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Temporarily replace the $queryRaw function
      const originalQueryRaw = prisma.$queryRaw;
      (prisma as unknown as { $queryRaw: () => Promise<never> }).$queryRaw = async () => {
        throw new Error('Connection failed');
      };

      const result = await testConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Database connection test failed:',
        expect.any(Error),
      );

      // Restore
      (prisma as unknown as { $queryRaw: typeof originalQueryRaw }).$queryRaw = originalQueryRaw;
      consoleSpy.mockRestore();
    });

    it('should handle various error types', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Temporarily replace the $queryRaw function
      const originalQueryRaw = prisma.$queryRaw;
      (prisma as unknown as { $queryRaw: () => Promise<never> }).$queryRaw = async () => {
        throw 'string error';
      };

      const result = await testConnection();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      // Restore
      (prisma as unknown as { $queryRaw: typeof originalQueryRaw }).$queryRaw = originalQueryRaw;
      consoleSpy.mockRestore();
    });
  });
});
