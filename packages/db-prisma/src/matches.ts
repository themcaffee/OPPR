import { prisma } from './client.js';
import type { Match, Prisma } from '@prisma/client';

/**
 * Input for creating a new match
 */
export interface CreateMatchInput {
  tournamentId: string;
  roundId?: string;
  number?: number;
  machineName?: string;
}

/**
 * Input for updating a match
 */
export interface UpdateMatchInput {
  roundId?: string | null;
  number?: number;
  machineName?: string;
}

/**
 * Options for querying matches
 */
export interface FindMatchesOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.MatchOrderByWithRelationInput | Prisma.MatchOrderByWithRelationInput[];
  where?: Prisma.MatchWhereInput;
  include?: Prisma.MatchInclude;
}

/**
 * Creates a new match
 */
export async function createMatch(data: CreateMatchInput): Promise<Match> {
  return prisma.match.create({
    data,
  });
}

/**
 * Creates multiple matches at once
 */
export async function createManyMatches(data: CreateMatchInput[]): Promise<Prisma.BatchPayload> {
  return prisma.match.createMany({
    data,
  });
}

/**
 * Finds a match by ID
 */
export async function findMatchById(
  id: string,
  include?: Prisma.MatchInclude,
): Promise<Match | null> {
  return prisma.match.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds multiple matches with optional filters
 */
export async function findMatches(options: FindMatchesOptions = {}): Promise<Match[]> {
  return prisma.match.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
  });
}

/**
 * Gets all matches for a specific tournament
 */
export async function getTournamentMatches(
  tournamentId: string,
  options: Omit<FindMatchesOptions, 'where'> = {},
): Promise<Match[]> {
  return findMatches({
    ...options,
    where: { tournamentId },
    orderBy: options.orderBy ?? { number: 'asc' },
  });
}

/**
 * Gets all matches for a specific round
 */
export async function getRoundMatches(
  roundId: string,
  options: Omit<FindMatchesOptions, 'where'> = {},
): Promise<Match[]> {
  return findMatches({
    ...options,
    where: { roundId },
    orderBy: options.orderBy ?? { number: 'asc' },
  });
}

/**
 * Updates a match
 */
export async function updateMatch(id: string, data: UpdateMatchInput): Promise<Match> {
  return prisma.match.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a match
 */
export async function deleteMatch(id: string): Promise<Match> {
  return prisma.match.delete({
    where: { id },
  });
}

/**
 * Deletes all matches for a tournament
 */
export async function deleteMatchesByTournament(
  tournamentId: string,
): Promise<Prisma.BatchPayload> {
  return prisma.match.deleteMany({
    where: { tournamentId },
  });
}

/**
 * Deletes all matches for a round
 */
export async function deleteMatchesByRound(roundId: string): Promise<Prisma.BatchPayload> {
  return prisma.match.deleteMany({
    where: { roundId },
  });
}

/**
 * Counts total matches
 */
export async function countMatches(where?: Prisma.MatchWhereInput): Promise<number> {
  return prisma.match.count({ where });
}

/**
 * Gets a match with all its entries and player details
 */
export async function getMatchWithEntries(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          player: true,
        },
        orderBy: {
          position: 'asc',
        },
      },
      round: true,
    },
  });
}

/**
 * Gets matches for a player in a tournament
 */
export async function getPlayerTournamentMatches(
  playerId: string,
  tournamentId: string,
  include?: Prisma.MatchInclude,
): Promise<Match[]> {
  return findMatches({
    where: {
      tournamentId,
      entries: {
        some: {
          playerId,
        },
      },
    },
    include: include ?? {
      entries: {
        include: {
          player: true,
        },
      },
      round: true,
    },
    orderBy: [{ round: { number: 'asc' } }, { number: 'asc' }],
  });
}
