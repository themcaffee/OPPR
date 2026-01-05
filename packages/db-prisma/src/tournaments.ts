import { prisma } from './client.js';
import type { Tournament, EventBoosterType, Prisma } from '@prisma/client';

/**
 * Input for creating a new tournament
 */
export interface CreateTournamentInput {
  externalId?: string;
  externalUrl?: string;
  name: string;
  description?: string;
  date: Date;
  locationId?: string;
  organizerId?: string;
  tgpConfig?: Prisma.InputJsonValue; // TGPConfig from OPPR
  eventBooster?: EventBoosterType;
  allowsOptOut?: boolean;
  baseValue?: number;
  tvaRating?: number;
  tvaRanking?: number;
  totalTVA?: number;
  tgp?: number;
  eventBoosterMultiplier?: number;
  firstPlaceValue?: number;
}

/**
 * Input for updating a tournament
 */
export interface UpdateTournamentInput {
  externalUrl?: string | null;
  name?: string;
  description?: string | null;
  date?: Date;
  locationId?: string | null;
  organizerId?: string | null;
  tgpConfig?: Prisma.InputJsonValue;
  eventBooster?: EventBoosterType;
  allowsOptOut?: boolean;
  baseValue?: number;
  tvaRating?: number;
  tvaRanking?: number;
  totalTVA?: number;
  tgp?: number;
  eventBoosterMultiplier?: number;
  firstPlaceValue?: number;
}

/**
 * Options for querying tournaments
 */
export interface FindTournamentsOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.TournamentOrderByWithRelationInput;
  where?: Prisma.TournamentWhereInput;
  include?: Prisma.TournamentInclude;
}

/**
 * Creates a new tournament
 */
export async function createTournament(data: CreateTournamentInput): Promise<Tournament> {
  return prisma.tournament.create({
    data: {
      ...data,
      eventBooster: data.eventBooster ?? 'NONE',
    },
  });
}

/**
 * Finds a tournament by ID
 */
export async function findTournamentById(
  id: string,
  include?: Prisma.TournamentInclude,
): Promise<Tournament | null> {
  return prisma.tournament.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds a tournament by external ID
 */
export async function findTournamentByExternalId(
  externalId: string,
  include?: Prisma.TournamentInclude,
): Promise<Tournament | null> {
  return prisma.tournament.findUnique({
    where: { externalId },
    include,
  });
}

/**
 * Finds multiple tournaments with optional filters
 */
export async function findTournaments(options: FindTournamentsOptions = {}): Promise<Tournament[]> {
  return prisma.tournament.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
  });
}

/**
 * Gets recent tournaments
 */
export async function getRecentTournaments(
  limit: number = 20,
  include?: Prisma.TournamentInclude,
): Promise<Tournament[]> {
  return findTournaments({
    take: limit,
    orderBy: { date: 'desc' },
    include,
  });
}

/**
 * Gets tournaments by date range
 */
export async function getTournamentsByDateRange(
  startDate: Date,
  endDate: Date,
  options: Omit<FindTournamentsOptions, 'where'> = {},
): Promise<Tournament[]> {
  return findTournaments({
    ...options,
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
}

/**
 * Gets tournaments by event booster type
 */
export async function getTournamentsByBoosterType(
  boosterType: EventBoosterType,
  options: Omit<FindTournamentsOptions, 'where'> = {},
): Promise<Tournament[]> {
  return findTournaments({
    ...options,
    where: { eventBooster: boosterType },
  });
}

/**
 * Gets major tournaments
 */
export async function getMajorTournaments(limit?: number): Promise<Tournament[]> {
  return findTournaments({
    take: limit,
    where: { eventBooster: 'MAJOR' },
    orderBy: { date: 'desc' },
  });
}

/**
 * Updates a tournament
 */
export async function updateTournament(
  id: string,
  data: UpdateTournamentInput,
): Promise<Tournament> {
  return prisma.tournament.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a tournament and all its results
 */
export async function deleteTournament(id: string): Promise<Tournament> {
  return prisma.tournament.delete({
    where: { id },
  });
}

/**
 * Counts total tournaments
 */
export async function countTournaments(where?: Prisma.TournamentWhereInput): Promise<number> {
  return prisma.tournament.count({ where });
}

/**
 * Gets tournament with all standings and player details
 */
export async function getTournamentWithResults(id: string) {
  return prisma.tournament.findUnique({
    where: { id },
    include: {
      standings: {
        include: {
          player: true,
        },
        orderBy: [{ isFinals: 'desc' }, { position: 'asc' }],
      },
    },
  });
}

/**
 * Gets tournament with rounds, matches, and entries
 */
export async function getTournamentWithMatches(id: string) {
  return prisma.tournament.findUnique({
    where: { id },
    include: {
      rounds: {
        include: {
          matches: {
            include: {
              entries: {
                include: {
                  player: true,
                },
              },
            },
            orderBy: { number: 'asc' },
          },
        },
        orderBy: [{ isFinals: 'asc' }, { number: 'asc' }],
      },
    },
  });
}

/**
 * Searches tournaments by name or location name
 */
export async function searchTournaments(query: string, limit: number = 20): Promise<Tournament[]> {
  return findTournaments({
    take: limit,
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { location: { name: { contains: query, mode: 'insensitive' } } },
      ],
    },
    orderBy: { date: 'desc' },
  });
}

/**
 * Gets tournament statistics
 */
export async function getTournamentStats(id: string) {
  const tournament = await getTournamentWithResults(id);

  if (!tournament) {
    return null;
  }

  const playerCount = tournament.standings.length;

  // Guard against division by zero
  if (playerCount === 0) {
    return {
      tournament,
      playerCount: 0,
      averagePoints: 0,
      averageEfficiency: 0,
      highestPoints: 0,
      lowestPoints: 0,
    };
  }

  const totalPoints = tournament.standings.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
  const totalEfficiency = tournament.standings.reduce((sum, s) => sum + (s.efficiency || 0), 0);
  const allPoints = tournament.standings.map((s) => s.totalPoints || 0);

  return {
    tournament,
    playerCount,
    averagePoints: totalPoints / playerCount,
    averageEfficiency: totalEfficiency / playerCount,
    highestPoints: Math.max(...allPoints),
    lowestPoints: Math.min(...allPoints),
  };
}
