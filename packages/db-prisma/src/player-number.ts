import { prisma } from './client.js';

const MIN_PLAYER_NUMBER = 10000;
const MAX_PLAYER_NUMBER = 99999;
const MAX_RETRIES = 10;

/**
 * Generates a random 5-digit player number (10000-99999)
 */
function generateRandomPlayerNumber(): number {
  return (
    Math.floor(Math.random() * (MAX_PLAYER_NUMBER - MIN_PLAYER_NUMBER + 1)) + MIN_PLAYER_NUMBER
  );
}

/**
 * Generates a unique player number with collision handling.
 * Retries up to MAX_RETRIES times if collision occurs.
 *
 * @throws Error if unable to generate unique number after max retries
 */
export async function generateUniquePlayerNumber(): Promise<number> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const candidate = generateRandomPlayerNumber();

    const existing = await prisma.player.findUnique({
      where: { playerNumber: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error(
    `Failed to generate unique player number after ${MAX_RETRIES} attempts. ` +
      `Consider increasing the number range or implementing a different allocation strategy.`,
  );
}

/**
 * Validates that a player number is in the valid range
 */
export function isValidPlayerNumber(playerNumber: number): boolean {
  return (
    Number.isInteger(playerNumber) &&
    playerNumber >= MIN_PLAYER_NUMBER &&
    playerNumber <= MAX_PLAYER_NUMBER
  );
}
