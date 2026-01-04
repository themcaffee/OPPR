import { prisma } from './client.js';
import type { Round, Prisma } from '@prisma/client';

/**
 * Input for creating a new round
 */
export interface CreateRoundInput {
  tournamentId: string;
  number: number;
  name?: string;
  isFinals?: boolean;
}

/**
 * Input for updating a round
 */
export interface UpdateRoundInput {
  number?: number;
  name?: string;
  isFinals?: boolean;
}

/**
 * Options for querying rounds
 */
export interface FindRoundsOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.RoundOrderByWithRelationInput | Prisma.RoundOrderByWithRelationInput[];
  where?: Prisma.RoundWhereInput;
  include?: Prisma.RoundInclude;
}

/**
 * Creates a new round
 */
export async function createRound(data: CreateRoundInput): Promise<Round> {
  return prisma.round.create({
    data: {
      ...data,
      isFinals: data.isFinals ?? false,
    },
  });
}

/**
 * Creates multiple rounds at once
 */
export async function createManyRounds(data: CreateRoundInput[]): Promise<Prisma.BatchPayload> {
  const roundsData = data.map((item) => ({
    ...item,
    isFinals: item.isFinals ?? false,
  }));

  return prisma.round.createMany({
    data: roundsData,
  });
}

/**
 * Finds a round by ID
 */
export async function findRoundById(
  id: string,
  include?: Prisma.RoundInclude,
): Promise<Round | null> {
  return prisma.round.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds a round by tournament, number, and isFinals
 */
export async function findRoundByTournamentAndNumber(
  tournamentId: string,
  number: number,
  isFinals: boolean,
  include?: Prisma.RoundInclude,
): Promise<Round | null> {
  return prisma.round.findUnique({
    where: {
      tournamentId_number_isFinals: {
        tournamentId,
        number,
        isFinals,
      },
    },
    include,
  });
}

/**
 * Finds multiple rounds with optional filters
 */
export async function findRounds(options: FindRoundsOptions = {}): Promise<Round[]> {
  return prisma.round.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
  });
}

/**
 * Gets all rounds for a specific tournament
 */
export async function getTournamentRounds(
  tournamentId: string,
  options: Omit<FindRoundsOptions, 'where'> = {},
): Promise<Round[]> {
  return findRounds({
    ...options,
    where: { tournamentId },
    orderBy: options.orderBy ?? [{ isFinals: 'asc' }, { number: 'asc' }],
  });
}

/**
 * Gets qualifying rounds for a tournament
 */
export async function getQualifyingRounds(
  tournamentId: string,
  options: Omit<FindRoundsOptions, 'where'> = {},
): Promise<Round[]> {
  return findRounds({
    ...options,
    where: { tournamentId, isFinals: false },
    orderBy: options.orderBy ?? { number: 'asc' },
  });
}

/**
 * Gets finals rounds for a tournament
 */
export async function getFinalsRounds(
  tournamentId: string,
  options: Omit<FindRoundsOptions, 'where'> = {},
): Promise<Round[]> {
  return findRounds({
    ...options,
    where: { tournamentId, isFinals: true },
    orderBy: options.orderBy ?? { number: 'asc' },
  });
}

/**
 * Updates a round
 */
export async function updateRound(id: string, data: UpdateRoundInput): Promise<Round> {
  return prisma.round.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a round
 */
export async function deleteRound(id: string): Promise<Round> {
  return prisma.round.delete({
    where: { id },
  });
}

/**
 * Deletes all rounds for a tournament
 */
export async function deleteRoundsByTournament(tournamentId: string): Promise<Prisma.BatchPayload> {
  return prisma.round.deleteMany({
    where: { tournamentId },
  });
}

/**
 * Counts total rounds
 */
export async function countRounds(where?: Prisma.RoundWhereInput): Promise<number> {
  return prisma.round.count({ where });
}

/**
 * Gets a round with all its matches
 */
export async function getRoundWithMatches(id: string) {
  return prisma.round.findUnique({
    where: { id },
    include: {
      matches: {
        include: {
          entries: {
            include: {
              player: true,
            },
          },
        },
        orderBy: {
          number: 'asc',
        } as const,
      },
    },
  });
}
