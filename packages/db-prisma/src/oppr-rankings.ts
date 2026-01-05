import { prisma } from './client.js';
import type {
  OpprPlayerRanking,
  OpprRankingHistory,
  OpprRankingChangeType,
  Prisma,
} from '@prisma/client';

/**
 * Input for creating a new OPPR player ranking
 */
export interface CreateOpprPlayerRankingInput {
  playerId: string;
  rating?: number;
  ratingDeviation?: number;
  ranking?: number;
  isRated?: boolean;
}

/**
 * Input for updating an OPPR player ranking
 */
export interface UpdateOpprPlayerRankingInput {
  rating?: number;
  ratingDeviation?: number;
  ranking?: number;
  isRated?: boolean;
  lastRatingUpdate?: Date;
}

/**
 * Options for querying OPPR rankings
 */
export interface FindOpprPlayerRankingsOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.OpprPlayerRankingOrderByWithRelationInput;
  where?: Prisma.OpprPlayerRankingWhereInput;
  include?: Prisma.OpprPlayerRankingInclude;
}

/**
 * Input for creating a ranking history record
 */
export interface CreateOpprRankingHistoryInput {
  opprPlayerRankingId: string;
  rating: number;
  ratingDeviation: number;
  ranking?: number;
  isRated: boolean;
  changeType: OpprRankingChangeType;
  tournamentId?: string;
  notes?: string;
}

// === OPPR Player Ranking Functions ===

/**
 * Gets or creates an OPPR player ranking for a player
 */
export async function getOrCreateOpprPlayerRanking(playerId: string): Promise<OpprPlayerRanking> {
  const existing = await prisma.opprPlayerRanking.findUnique({
    where: { playerId },
  });

  if (existing) return existing;

  return prisma.opprPlayerRanking.create({
    data: { playerId },
  });
}

/**
 * Creates a new OPPR player ranking
 */
export async function createOpprPlayerRanking(
  data: CreateOpprPlayerRankingInput,
): Promise<OpprPlayerRanking> {
  return prisma.opprPlayerRanking.create({
    data,
  });
}

/**
 * Finds OPPR ranking by ID
 */
export async function findOpprPlayerRankingById(
  id: string,
  include?: Prisma.OpprPlayerRankingInclude,
): Promise<OpprPlayerRanking | null> {
  return prisma.opprPlayerRanking.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds OPPR ranking by player ID
 */
export async function findOpprPlayerRankingByPlayerId(
  playerId: string,
  include?: Prisma.OpprPlayerRankingInclude,
): Promise<OpprPlayerRanking | null> {
  return prisma.opprPlayerRanking.findUnique({
    where: { playerId },
    include,
  });
}

/**
 * Finds multiple OPPR rankings with optional filters
 */
export async function findOpprPlayerRankings(
  options: FindOpprPlayerRankingsOptions = {},
): Promise<OpprPlayerRanking[]> {
  return prisma.opprPlayerRanking.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
  });
}

/**
 * Gets all rated players ordered by rating (highest first)
 */
export async function getTopPlayersByOpprRating(limit: number = 50): Promise<OpprPlayerRanking[]> {
  return prisma.opprPlayerRanking.findMany({
    take: limit,
    where: { isRated: true },
    orderBy: { rating: 'desc' },
    include: { player: true },
  });
}

/**
 * Gets all ranked players ordered by world ranking (best first)
 */
export async function getTopPlayersByOpprRanking(limit: number = 50): Promise<OpprPlayerRanking[]> {
  return prisma.opprPlayerRanking.findMany({
    take: limit,
    where: {
      isRated: true,
      ranking: { not: null },
    },
    orderBy: { ranking: 'asc' },
    include: { player: true },
  });
}

/**
 * Gets all rated players
 */
export async function getRatedOpprPlayers(
  options: Omit<FindOpprPlayerRankingsOptions, 'where'> = {},
): Promise<OpprPlayerRanking[]> {
  return prisma.opprPlayerRanking.findMany({
    ...options,
    where: { isRated: true },
    include: { player: true, ...options.include },
  });
}

/**
 * Updates OPPR player ranking
 */
export async function updateOpprPlayerRanking(
  playerId: string,
  data: UpdateOpprPlayerRankingInput,
): Promise<OpprPlayerRanking> {
  return prisma.opprPlayerRanking.update({
    where: { playerId },
    data: {
      ...data,
      lastRatingUpdate: data.lastRatingUpdate ?? new Date(),
    },
  });
}

/**
 * Updates rating after a tournament and creates history record
 */
export async function updateOpprRatingAfterTournament(
  playerId: string,
  newRating: number,
  newRD: number,
  tournamentId: string,
  eventCount?: number,
): Promise<OpprPlayerRanking> {
  const ranking = await getOrCreateOpprPlayerRanking(playerId);

  const isRated = eventCount !== undefined ? eventCount >= 5 : ranking.isRated;

  // Update the ranking
  const updated = await prisma.opprPlayerRanking.update({
    where: { playerId },
    data: {
      rating: newRating,
      ratingDeviation: newRD,
      lastRatingUpdate: new Date(),
      isRated,
    },
  });

  // Create history record
  await createOpprRankingHistory({
    opprPlayerRankingId: ranking.id,
    rating: newRating,
    ratingDeviation: newRD,
    ranking: updated.ranking ?? undefined,
    isRated,
    changeType: 'TOURNAMENT_RESULT',
    tournamentId,
  });

  return updated;
}

/**
 * Updates world rankings for all players (batch operation)
 */
export async function updateWorldRankings(
  rankings: Array<{ playerId: string; ranking: number }>,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const { playerId, ranking } of rankings) {
      const opprRanking = await tx.opprPlayerRanking.findUnique({
        where: { playerId },
      });

      if (opprRanking) {
        await tx.opprPlayerRanking.update({
          where: { playerId },
          data: { ranking },
        });

        await tx.opprRankingHistory.create({
          data: {
            opprPlayerRankingId: opprRanking.id,
            rating: opprRanking.rating,
            ratingDeviation: opprRanking.ratingDeviation,
            ranking,
            isRated: opprRanking.isRated,
            changeType: 'RANKING_REFRESH',
          },
        });
      }
    }
  });
}

/**
 * Applies RD decay for inactive players
 */
export async function applyRDDecayForInactivePlayers(
  thresholdDays: number = 30,
  decayPerDay: number = 0.3,
  maxRD: number = 200,
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);

  const inactivePlayers = await prisma.opprPlayerRanking.findMany({
    where: {
      lastRatingUpdate: { lt: cutoffDate },
      ratingDeviation: { lt: maxRD },
    },
  });

  let updatedCount = 0;

  await prisma.$transaction(async (tx) => {
    for (const ranking of inactivePlayers) {
      const daysSinceUpdate = Math.floor(
        (Date.now() - ranking.lastRatingUpdate.getTime()) / (1000 * 60 * 60 * 24),
      );
      const newRD = Math.min(ranking.ratingDeviation + daysSinceUpdate * decayPerDay, maxRD);

      await tx.opprPlayerRanking.update({
        where: { id: ranking.id },
        data: { ratingDeviation: newRD },
      });

      await tx.opprRankingHistory.create({
        data: {
          opprPlayerRankingId: ranking.id,
          rating: ranking.rating,
          ratingDeviation: newRD,
          ranking: ranking.ranking,
          isRated: ranking.isRated,
          changeType: 'RD_DECAY',
          notes: `RD increased from ${ranking.ratingDeviation.toFixed(1)} to ${newRD.toFixed(1)} due to ${daysSinceUpdate} days of inactivity`,
        },
      });

      updatedCount++;
    }
  });

  return updatedCount;
}

/**
 * Deletes OPPR player ranking (cascades to history)
 */
export async function deleteOpprPlayerRanking(playerId: string): Promise<OpprPlayerRanking> {
  return prisma.opprPlayerRanking.delete({
    where: { playerId },
  });
}

/**
 * Counts OPPR rankings
 */
export async function countOpprPlayerRankings(
  where?: Prisma.OpprPlayerRankingWhereInput,
): Promise<number> {
  return prisma.opprPlayerRanking.count({ where });
}

// === OPPR Ranking History Functions ===

/**
 * Creates a ranking history record
 */
export async function createOpprRankingHistory(
  data: CreateOpprRankingHistoryInput,
): Promise<OpprRankingHistory> {
  return prisma.opprRankingHistory.create({
    data,
  });
}

/**
 * Gets ranking history for a player
 */
export async function getOpprRankingHistory(
  playerId: string,
  limit?: number,
): Promise<OpprRankingHistory[]> {
  const ranking = await findOpprPlayerRankingByPlayerId(playerId);
  if (!ranking) return [];

  return prisma.opprRankingHistory.findMany({
    where: { opprPlayerRankingId: ranking.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { tournament: true },
  });
}

/**
 * Gets ranking history for a specific time period
 */
export async function getOpprRankingHistoryByDateRange(
  playerId: string,
  startDate: Date,
  endDate: Date,
): Promise<OpprRankingHistory[]> {
  const ranking = await findOpprPlayerRankingByPlayerId(playerId);
  if (!ranking) return [];

  return prisma.opprRankingHistory.findMany({
    where: {
      opprPlayerRankingId: ranking.id,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: 'asc' },
    include: { tournament: true },
  });
}

/**
 * Gets the most recent history record for a player
 */
export async function getLatestOpprRankingHistory(
  playerId: string,
): Promise<OpprRankingHistory | null> {
  const ranking = await findOpprPlayerRankingByPlayerId(playerId);
  if (!ranking) return null;

  return prisma.opprRankingHistory.findFirst({
    where: { opprPlayerRankingId: ranking.id },
    orderBy: { createdAt: 'desc' },
    include: { tournament: true },
  });
}

/**
 * Counts ranking history records
 */
export async function countOpprRankingHistory(
  where?: Prisma.OpprRankingHistoryWhereInput,
): Promise<number> {
  return prisma.opprRankingHistory.count({ where });
}
