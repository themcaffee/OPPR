import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client instance
 * Prevents multiple instances in development with hot reloading
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Disconnects from the database
 * Useful for graceful shutdowns
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Connects to the database
 * Usually not needed as Prisma connects automatically
 */
export async function connect(): Promise<void> {
  await prisma.$connect();
}

/**
 * Tests the database connection
 * @returns true if connection is successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
