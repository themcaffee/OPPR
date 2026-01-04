import { prisma } from './client.js';
import type { Standing, Tournament, Prisma } from '@prisma/client';

/**
 * Standing with the tournament relation included
 */
type StandingWithTournament = Standing & {
  tournament: Tournament;
};

/**
 * Merged standing with calculated position for points
 */
export interface MergedStanding extends Standing {
  mergedPosition: number;
  isFinalist: boolean;
}

/**
 * Input for creating a new standing
 */
export interface CreateStandingInput {
  tournamentId: string;
  playerId: string;
  position: number;
  isFinals?: boolean;
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
 * Input for updating a standing
 */
export interface UpdateStandingInput {
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
 * Options for querying standings
 */
export interface FindStandingsOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.StandingOrderByWithRelationInput;
  where?: Prisma.StandingWhereInput;
  include?: Prisma.StandingInclude;
}

/**
 * Creates a new standing
 */
export async function createStanding(data: CreateStandingInput): Promise<Standing> {
  const standingData = {
    ...data,
    isFinals: data.isFinals ?? false,
    decayedPoints: data.decayedPoints ?? data.totalPoints ?? 0,
  };

  return prisma.standing.create({
    data: standingData,
  });
}

/**
 * Creates multiple standings at once
 */
export async function createManyStandings(
  data: CreateStandingInput[],
): Promise<Prisma.BatchPayload> {
  const standingsData = data.map((item) => ({
    ...item,
    isFinals: item.isFinals ?? false,
    decayedPoints: item.decayedPoints ?? item.totalPoints ?? 0,
  }));

  return prisma.standing.createMany({
    data: standingsData,
  });
}

/**
 * Finds a standing by ID
 */
export async function findStandingById(
  id: string,
  include?: Prisma.StandingInclude,
): Promise<Standing | null> {
  return prisma.standing.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds a standing by player, tournament, and isFinals
 */
export async function findStandingByPlayerAndTournament(
  playerId: string,
  tournamentId: string,
  isFinals: boolean,
  include?: Prisma.StandingInclude,
): Promise<Standing | null> {
  return prisma.standing.findUnique({
    where: {
      playerId_tournamentId_isFinals: {
        playerId,
        tournamentId,
        isFinals,
      },
    },
    include,
  });
}

/**
 * Finds multiple standings with optional filters
 */
export async function findStandings(options: FindStandingsOptions = {}): Promise<Standing[]> {
  return prisma.standing.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
  });
}

/**
 * Gets all standings for a specific player
 */
export async function getPlayerStandings(
  playerId: string,
  options: Omit<FindStandingsOptions, 'where'> = {},
): Promise<Standing[]> {
  return findStandings({
    ...options,
    where: { playerId },
    include: { tournament: true, ...options.include },
    orderBy: { tournament: { date: 'desc' } },
  });
}

/**
 * Gets all standings for a specific tournament
 */
export async function getTournamentStandings(
  tournamentId: string,
  options: Omit<FindStandingsOptions, 'where'> = {},
): Promise<Standing[]> {
  return findStandings({
    ...options,
    where: { tournamentId },
    include: { player: true, ...options.include },
    orderBy: options.orderBy ?? { position: 'asc' },
  });
}

/**
 * Gets qualifying standings for a tournament
 */
export async function getQualifyingStandings(
  tournamentId: string,
  options: Omit<FindStandingsOptions, 'where'> = {},
): Promise<Standing[]> {
  return findStandings({
    ...options,
    where: { tournamentId, isFinals: false },
    include: { player: true, ...options.include },
    orderBy: options.orderBy ?? { position: 'asc' },
  });
}

/**
 * Gets finals standings for a tournament
 */
export async function getFinalsStandings(
  tournamentId: string,
  options: Omit<FindStandingsOptions, 'where'> = {},
): Promise<Standing[]> {
  return findStandings({
    ...options,
    where: { tournamentId, isFinals: true },
    include: { player: true, ...options.include },
    orderBy: options.orderBy ?? { position: 'asc' },
  });
}

/**
 * Gets merged standings for point calculation.
 * Finalists get their finals position, non-finalists get qualifying position + finalist count
 */
export async function getMergedStandings(tournamentId: string): Promise<MergedStanding[]> {
  const [finals, qualifying] = await Promise.all([
    findStandings({
      where: { tournamentId, isFinals: true },
      orderBy: { position: 'asc' },
      include: { player: true },
    }),
    findStandings({
      where: { tournamentId, isFinals: false },
      orderBy: { position: 'asc' },
      include: { player: true },
    }),
  ]);

  const finalistIds = new Set(finals.map((s) => s.playerId));
  const nonFinalists = qualifying.filter((s) => !finalistIds.has(s.playerId));

  // Finalists: position from finals
  // Non-finalists: finalistCount + their relative position among non-finalists
  return [
    ...finals.map((s) => ({ ...s, mergedPosition: s.position, isFinalist: true })),
    ...nonFinalists.map((s, i) => ({
      ...s,
      mergedPosition: finals.length + i + 1,
      isFinalist: false,
    })),
  ];
}

/**
 * Gets top N finishes for a player
 */
export async function getPlayerTopFinishes(
  playerId: string,
  limit: number = 15,
): Promise<Standing[]> {
  return findStandings({
    where: { playerId },
    take: limit,
    include: { tournament: true },
    orderBy: { decayedPoints: 'desc' },
  });
}

/**
 * Updates a standing
 */
export async function updateStanding(id: string, data: UpdateStandingInput): Promise<Standing> {
  return prisma.standing.update({
    where: { id },
    data,
  });
}

/**
 * Updates standing points and decay information
 */
export async function updateStandingPoints(
  id: string,
  linearPoints: number,
  dynamicPoints: number,
  totalPoints: number,
): Promise<Standing> {
  const standing = (await findStandingById(id, {
    tournament: true,
  })) as StandingWithTournament | null;

  if (!standing) {
    throw new Error(`Standing with id ${id} not found`);
  }

  // Calculate age and decay multiplier
  const now = new Date();
  const tournamentDate = standing.tournament.date;
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

  return updateStanding(id, {
    linearPoints,
    dynamicPoints,
    totalPoints,
    ageInDays,
    decayMultiplier,
    decayedPoints,
  });
}

/**
 * Deletes a standing
 */
export async function deleteStanding(id: string): Promise<Standing> {
  return prisma.standing.delete({
    where: { id },
  });
}

/**
 * Deletes all standings for a tournament
 */
export async function deleteStandingsByTournament(
  tournamentId: string,
): Promise<Prisma.BatchPayload> {
  return prisma.standing.deleteMany({
    where: { tournamentId },
  });
}

/**
 * Counts total standings
 */
export async function countStandings(where?: Prisma.StandingWhereInput): Promise<number> {
  return prisma.standing.count({ where });
}

/**
 * Gets player statistics across all tournaments
 */
export async function getPlayerStats(playerId: string) {
  const standings = await getPlayerStandings(playerId);

  if (standings.length === 0) {
    return null;
  }

  const totalPoints = standings.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
  const totalDecayedPoints = standings.reduce((sum, s) => sum + (s.decayedPoints || 0), 0);
  const averagePosition = standings.reduce((sum, s) => sum + s.position, 0) / standings.length;
  const averageEfficiency =
    standings.reduce((sum, s) => sum + (s.efficiency || 0), 0) / standings.length;

  const firstPlaceFinishes = standings.filter((s) => s.position === 1).length;
  const topThreeFinishes = standings.filter((s) => s.position <= 3).length;

  return {
    totalEvents: standings.length,
    totalPoints,
    totalDecayedPoints,
    averagePoints: totalPoints / standings.length,
    averagePosition,
    averageFinish: averagePosition,
    averageEfficiency,
    firstPlaceFinishes,
    topThreeFinishes,
    bestFinish: Math.min(...standings.map((s) => s.position)),
    highestPoints: Math.max(...standings.map((s) => s.totalPoints || 0)),
  };
}

/**
 * Calculates and updates time decay for all standings
 * Based on OPPR time decay rules:
 * - 0-1 years: 100%
 * - 1-2 years: 75%
 * - 2-3 years: 50%
 * - 3+ years: 0%
 */
export async function recalculateTimeDecay(referenceDate: Date = new Date()) {
  const standings = (await findStandings({
    include: { tournament: true },
  })) as StandingWithTournament[];

  const updates = standings.map((standing) => {
    const tournamentDate = standing.tournament.date;
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

    const decayedPoints = (standing.totalPoints || 0) * decayMultiplier;

    return prisma.standing.update({
      where: { id: standing.id },
      data: {
        ageInDays,
        decayMultiplier,
        decayedPoints,
      },
    });
  });

  return Promise.all(updates);
}
