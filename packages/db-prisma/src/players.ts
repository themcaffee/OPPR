import { prisma } from './client.js';
import type { Player, Prisma } from '@prisma/client';

/**
 * Input for creating a new player
 */
export interface CreatePlayerInput {
  externalId?: string;
  name?: string;
  email?: string;
  rating?: number;
  ratingDeviation?: number;
  ranking?: number;
  isRated?: boolean;
  eventCount?: number;
}

/**
 * Input for updating a player
 */
export interface UpdatePlayerInput {
  name?: string;
  email?: string;
  rating?: number;
  ratingDeviation?: number;
  ranking?: number;
  isRated?: boolean;
  eventCount?: number;
  lastRatingUpdate?: Date;
  lastEventDate?: Date;
}

/**
 * Options for querying players
 */
export interface FindPlayersOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.PlayerOrderByWithRelationInput;
  where?: Prisma.PlayerWhereInput;
  include?: Prisma.PlayerInclude;
}

/**
 * Creates a new player
 */
export async function createPlayer(data: CreatePlayerInput): Promise<Player> {
  return prisma.player.create({
    data,
  });
}

/**
 * Finds a player by ID
 */
export async function findPlayerById(
  id: string,
  include?: Prisma.PlayerInclude,
): Promise<Player | null> {
  return prisma.player.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds a player by external ID
 */
export async function findPlayerByExternalId(
  externalId: string,
  include?: Prisma.PlayerInclude,
): Promise<Player | null> {
  return prisma.player.findUnique({
    where: { externalId },
    include,
  });
}

/**
 * Finds a player by email
 */
export async function findPlayerByEmail(
  email: string,
  include?: Prisma.PlayerInclude,
): Promise<Player | null> {
  return prisma.player.findUnique({
    where: { email },
    include,
  });
}

/**
 * Finds multiple players with optional filters
 */
export async function findPlayers(options: FindPlayersOptions = {}): Promise<Player[]> {
  return prisma.player.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
  });
}

/**
 * Gets all rated players (has 5+ events)
 */
export async function getRatedPlayers(
  options: Omit<FindPlayersOptions, 'where'> = {},
): Promise<Player[]> {
  return findPlayers({
    ...options,
    where: { isRated: true },
  });
}

/**
 * Gets top players by rating
 */
export async function getTopPlayersByRating(limit: number = 50): Promise<Player[]> {
  return findPlayers({
    take: limit,
    orderBy: { rating: 'desc' },
    where: { isRated: true },
  });
}

/**
 * Gets top players by ranking
 */
export async function getTopPlayersByRanking(limit: number = 50): Promise<Player[]> {
  return findPlayers({
    take: limit,
    orderBy: { ranking: 'asc' },
    where: {
      isRated: true,
      ranking: { not: null },
    },
  });
}

/**
 * Updates a player
 */
export async function updatePlayer(id: string, data: UpdatePlayerInput): Promise<Player> {
  return prisma.player.update({
    where: { id },
    data,
  });
}

/**
 * Updates player rating after a tournament
 */
export async function updatePlayerRating(
  id: string,
  rating: number,
  ratingDeviation: number,
  eventCount?: number,
): Promise<Player> {
  const updateData: UpdatePlayerInput = {
    rating,
    ratingDeviation,
    lastRatingUpdate: new Date(),
    lastEventDate: new Date(),
  };

  if (eventCount !== undefined) {
    updateData.eventCount = eventCount;
    updateData.isRated = eventCount >= 5;
  }

  return updatePlayer(id, updateData);
}

/**
 * Deletes a player
 */
export async function deletePlayer(id: string): Promise<Player> {
  return prisma.player.delete({
    where: { id },
  });
}

/**
 * Counts total players
 */
export async function countPlayers(where?: Prisma.PlayerWhereInput): Promise<number> {
  return prisma.player.count({ where });
}

/**
 * Gets player with their tournament results
 */
export async function getPlayerWithResults(id: string) {
  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      tournamentResults: {
        include: {
          tournament: true,
        },
        orderBy: {
          tournament: {
            date: 'desc',
          },
        },
      },
    },
  });

  if (!player) {
    return null;
  }

  // Map tournamentResults to results for the return object
  return {
    ...player,
    results: player.tournamentResults,
  };
}

/**
 * Searches players by name or email
 */
export async function searchPlayers(query: string, limit: number = 20): Promise<Player[]> {
  return findPlayers({
    take: limit,
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
}
