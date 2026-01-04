import { prisma } from './client.js';
import type { Entry, MatchResult, Prisma } from '@prisma/client';

/**
 * Input for creating a new entry
 */
export interface CreateEntryInput {
  matchId: string;
  playerId: string;
  result: MatchResult;
  position?: number;
}

/**
 * Input for updating an entry
 */
export interface UpdateEntryInput {
  result?: MatchResult;
  position?: number;
}

/**
 * Options for querying entries
 */
export interface FindEntriesOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.EntryOrderByWithRelationInput;
  where?: Prisma.EntryWhereInput;
  include?: Prisma.EntryInclude;
}

/**
 * Creates a new entry
 */
export async function createEntry(data: CreateEntryInput): Promise<Entry> {
  return prisma.entry.create({
    data,
  });
}

/**
 * Creates multiple entries at once
 */
export async function createManyEntries(data: CreateEntryInput[]): Promise<Prisma.BatchPayload> {
  return prisma.entry.createMany({
    data,
  });
}

/**
 * Finds an entry by ID
 */
export async function findEntryById(
  id: string,
  include?: Prisma.EntryInclude,
): Promise<Entry | null> {
  return prisma.entry.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds an entry by match and player
 */
export async function findEntryByMatchAndPlayer(
  matchId: string,
  playerId: string,
  include?: Prisma.EntryInclude,
): Promise<Entry | null> {
  return prisma.entry.findUnique({
    where: {
      matchId_playerId: {
        matchId,
        playerId,
      },
    },
    include,
  });
}

/**
 * Finds multiple entries with optional filters
 */
export async function findEntries(options: FindEntriesOptions = {}): Promise<Entry[]> {
  return prisma.entry.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
  });
}

/**
 * Gets all entries for a specific match
 */
export async function getMatchEntries(
  matchId: string,
  options: Omit<FindEntriesOptions, 'where'> = {},
): Promise<Entry[]> {
  return findEntries({
    ...options,
    where: { matchId },
    include: options.include ?? { player: true },
    orderBy: options.orderBy ?? { position: 'asc' },
  });
}

/**
 * Gets all entries for a specific player
 */
export async function getPlayerEntries(
  playerId: string,
  options: Omit<FindEntriesOptions, 'where'> = {},
): Promise<Entry[]> {
  return findEntries({
    ...options,
    where: { playerId },
    include: options.include ?? { match: { include: { round: true, tournament: true } } },
  });
}

/**
 * Gets player entries in a tournament
 */
export async function getPlayerTournamentEntries(
  playerId: string,
  tournamentId: string,
  include?: Prisma.EntryInclude,
): Promise<Entry[]> {
  return findEntries({
    where: {
      playerId,
      match: {
        tournamentId,
      },
    },
    include: include ?? {
      match: {
        include: {
          round: true,
          entries: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Updates an entry
 */
export async function updateEntry(id: string, data: UpdateEntryInput): Promise<Entry> {
  return prisma.entry.update({
    where: { id },
    data,
  });
}

/**
 * Deletes an entry
 */
export async function deleteEntry(id: string): Promise<Entry> {
  return prisma.entry.delete({
    where: { id },
  });
}

/**
 * Deletes all entries for a match
 */
export async function deleteEntriesByMatch(matchId: string): Promise<Prisma.BatchPayload> {
  return prisma.entry.deleteMany({
    where: { matchId },
  });
}

/**
 * Counts total entries
 */
export async function countEntries(where?: Prisma.EntryWhereInput): Promise<number> {
  return prisma.entry.count({ where });
}

/**
 * Gets player statistics from entries
 */
export async function getPlayerEntryStats(playerId: string) {
  const entries = await getPlayerEntries(playerId);

  if (entries.length === 0) {
    return null;
  }

  const wins = entries.filter((e) => e.result === 'WIN').length;
  const losses = entries.filter((e) => e.result === 'LOSS').length;
  const ties = entries.filter((e) => e.result === 'TIE').length;

  return {
    totalMatches: entries.length,
    wins,
    losses,
    ties,
    winRate: wins / entries.length,
  };
}
