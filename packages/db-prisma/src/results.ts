import { prisma } from './client.js';
import type { TournamentResult, Tournament, Prisma } from '@prisma/client';

/**
 * TournamentResult with the tournament relation included
 */
type TournamentResultWithTournament = TournamentResult & {
  tournament: Tournament;
};

/**
 * Input for creating a tournament result
 */
export interface CreateResultInput {
  playerId: string;
  tournamentId: string;
  position: number;
  optedOut?: boolean;
  linearPoints?: number;
  dynamicPoints?: number;
  totalPoints?: number;
  ageInDays?: number;
  decayMultiplier?: number;
  decayedPoints?: number;
  efficiency?: number;
}

/**
 * Input for updating a tournament result
 */
export interface UpdateResultInput {
  position?: number;
  optedOut?: boolean;
  linearPoints?: number;
  dynamicPoints?: number;
  totalPoints?: number;
  ageInDays?: number;
  decayMultiplier?: number;
  decayedPoints?: number;
  efficiency?: number;
}

/**
 * Options for querying results
 */
export interface FindResultsOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.TournamentResultOrderByWithRelationInput;
  where?: Prisma.TournamentResultWhereInput;
  include?: Prisma.TournamentResultInclude;
}

/**
 * Creates a new tournament result
 */
export async function createResult(data: CreateResultInput): Promise<TournamentResult> {
  // Default decayedPoints to totalPoints if not provided (represents 100% decay)
  const resultData = {
    ...data,
    decayedPoints: data.decayedPoints ?? data.totalPoints ?? 0,
  };

  return prisma.tournamentResult.create({
    data: resultData,
  });
}

/**
 * Creates multiple tournament results at once
 */
export async function createManyResults(data: CreateResultInput[]): Promise<Prisma.BatchPayload> {
  // Apply same defaults as createResult
  const resultsData = data.map((item) => ({
    ...item,
    decayedPoints: item.decayedPoints ?? item.totalPoints ?? 0,
  }));

  return prisma.tournamentResult.createMany({
    data: resultsData,
  });
}

/**
 * Finds a result by ID
 */
export async function findResultById(
  id: string,
  include?: Prisma.TournamentResultInclude,
): Promise<TournamentResult | null> {
  return prisma.tournamentResult.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds a result by player and tournament
 */
export async function findResultByPlayerAndTournament(
  playerId: string,
  tournamentId: string,
  include?: Prisma.TournamentResultInclude,
): Promise<TournamentResult | null> {
  return prisma.tournamentResult.findUnique({
    where: {
      playerId_tournamentId: {
        playerId,
        tournamentId,
      },
    },
    include,
  });
}

/**
 * Finds multiple results with optional filters
 */
export async function findResults(options: FindResultsOptions = {}): Promise<TournamentResult[]> {
  return prisma.tournamentResult.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
  });
}

/**
 * Gets all results for a specific player
 */
export async function getPlayerResults(
  playerId: string,
  options: Omit<FindResultsOptions, 'where'> = {},
): Promise<TournamentResult[]> {
  return findResults({
    ...options,
    where: { playerId },
    include: { tournament: true, ...options.include },
    orderBy: { tournament: { date: 'desc' } },
  });
}

/**
 * Gets all results for a specific tournament
 */
export async function getTournamentResults(
  tournamentId: string,
  options: Omit<FindResultsOptions, 'where'> = {},
): Promise<TournamentResult[]> {
  return findResults({
    ...options,
    where: { tournamentId },
    include: { player: true, ...options.include },
    orderBy: { position: 'asc' },
  });
}

/**
 * Gets top N finishes for a player
 */
export async function getPlayerTopFinishes(
  playerId: string,
  limit: number = 15,
): Promise<TournamentResult[]> {
  return findResults({
    where: { playerId },
    take: limit,
    include: { tournament: true },
    orderBy: { decayedPoints: 'desc' },
  });
}

/**
 * Updates a tournament result
 */
export async function updateResult(id: string, data: UpdateResultInput): Promise<TournamentResult> {
  return prisma.tournamentResult.update({
    where: { id },
    data,
  });
}

/**
 * Updates result points and decay information
 */
export async function updateResultPoints(
  id: string,
  linearPoints: number,
  dynamicPoints: number,
  totalPoints: number,
): Promise<TournamentResult> {
  // Get the result to access tournament date for decay calculation
  const result = (await findResultById(id, {
    tournament: true,
  })) as TournamentResultWithTournament | null;
  if (!result) {
    throw new Error(`Result with id ${id} not found`);
  }

  // Calculate age and decay multiplier
  const now = new Date();
  const tournamentDate = result.tournament.date;
  const ageInDays = Math.floor((now.getTime() - tournamentDate.getTime()) / (1000 * 60 * 60 * 24));
  const ageInYears = ageInDays / 365;

  let decayMultiplier = 0;
  if (ageInYears < 1) {
    decayMultiplier = 1.0;
  } else if (ageInYears < 2) {
    decayMultiplier = 0.75;
  } else if (ageInYears < 3) {
    decayMultiplier = 0.5;
  } else {
    decayMultiplier = 0;
  }

  const decayedPoints = totalPoints * decayMultiplier;

  return updateResult(id, {
    linearPoints,
    dynamicPoints,
    totalPoints,
    ageInDays,
    decayMultiplier,
    decayedPoints,
  });
}

/**
 * Deletes a tournament result
 */
export async function deleteResult(id: string): Promise<TournamentResult> {
  return prisma.tournamentResult.delete({
    where: { id },
  });
}

/**
 * Deletes all results for a tournament
 */
export async function deleteResultsByTournament(
  tournamentId: string,
): Promise<Prisma.BatchPayload> {
  return prisma.tournamentResult.deleteMany({
    where: { tournamentId },
  });
}

/**
 * Counts total results
 */
export async function countResults(where?: Prisma.TournamentResultWhereInput): Promise<number> {
  return prisma.tournamentResult.count({ where });
}

/**
 * Gets player statistics across all tournaments
 */
export async function getPlayerStats(playerId: string) {
  const results = await getPlayerResults(playerId);

  if (results.length === 0) {
    return null;
  }

  const totalPoints = results.reduce((sum, r) => sum + (r.totalPoints || 0), 0);
  const totalDecayedPoints = results.reduce((sum, r) => sum + (r.decayedPoints || 0), 0);
  const averagePosition = results.reduce((sum, r) => sum + r.position, 0) / results.length;
  const averageEfficiency =
    results.reduce((sum, r) => sum + (r.efficiency || 0), 0) / results.length;

  const firstPlaceFinishes = results.filter((r) => r.position === 1).length;
  const topThreeFinishes = results.filter((r) => r.position <= 3).length;

  return {
    totalEvents: results.length,
    totalPoints,
    totalDecayedPoints,
    averagePoints: totalPoints / results.length,
    averagePosition,
    averageFinish: averagePosition,
    averageEfficiency,
    firstPlaceFinishes,
    topThreeFinishes,
    bestFinish: Math.min(...results.map((r) => r.position)),
    highestPoints: Math.max(...results.map((r) => r.totalPoints || 0)),
  };
}

/**
 * Calculates and updates time decay for all results
 * Based on OPPR time decay rules:
 * - 0-1 years: 100%
 * - 1-2 years: 75%
 * - 2-3 years: 50%
 * - 3+ years: 0%
 */
export async function recalculateTimeDecay(referenceDate: Date = new Date()) {
  const results = (await findResults({
    include: { tournament: true },
  })) as TournamentResultWithTournament[];

  const updates = results.map((result) => {
    const tournamentDate = result.tournament.date;
    const ageInDays = Math.floor(
      (referenceDate.getTime() - tournamentDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const ageInYears = ageInDays / 365;

    let decayMultiplier = 0;
    if (ageInYears < 1) {
      decayMultiplier = 1.0;
    } else if (ageInYears < 2) {
      decayMultiplier = 0.75;
    } else if (ageInYears < 3) {
      decayMultiplier = 0.5;
    } else {
      decayMultiplier = 0;
    }

    const decayedPoints = (result.totalPoints || 0) * decayMultiplier;

    return prisma.tournamentResult.update({
      where: { id: result.id },
      data: {
        ageInDays,
        decayMultiplier,
        decayedPoints,
      },
    });
  });

  return Promise.all(updates);
}
