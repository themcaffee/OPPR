import { prisma } from './client.js';
import type { User, Prisma } from '@prisma/client';
import { generateUniquePlayerNumber } from './player-number.js';

/**
 * Input for creating a new user
 */
export interface CreateUserInput {
  email: string;
  passwordHash: string;
  playerId?: string;
  role?: 'USER' | 'ADMIN';
  tosAcceptedAt?: Date;
  privacyPolicyAcceptedAt?: Date;
  codeOfConductAcceptedAt?: Date;
}

/**
 * Input for updating a user
 */
export interface UpdateUserInput {
  email?: string;
  passwordHash?: string;
  playerId?: string | null;
  role?: 'USER' | 'ADMIN';
  refreshTokenHash?: string | null;
}

/**
 * User with linked player profile
 */
export interface UserWithPlayer {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  tosAcceptedAt: Date | null;
  privacyPolicyAcceptedAt: Date | null;
  codeOfConductAcceptedAt: Date | null;
  player: {
    id: string;
    playerNumber: number;
    name: string | null;
    eventCount: number;
  } | null;
}

/**
 * Creates a new user
 */
export async function createUser(data: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data,
  });
}

/**
 * Creates a user with a linked player in a transaction
 */
export async function createUserWithPlayer(
  userData: Omit<CreateUserInput, 'playerId'>,
  playerData: { name?: string },
): Promise<UserWithPlayer> {
  return prisma.$transaction(async (tx) => {
    // Generate a unique player number
    const playerNumber = await generateUniquePlayerNumber();

    // Create the player first
    const player = await tx.player.create({
      data: {
        name: playerData.name,
        playerNumber,
      },
    });

    // Create the user linked to the player
    const user = await tx.user.create({
      data: {
        ...userData,
        playerId: player.id,
      },
      include: {
        player: {
          select: {
            id: true,
            playerNumber: true,
            name: true,
            eventCount: true,
          },
        },
      },
    });

    return user as UserWithPlayer;
  });
}

/**
 * Finds a user by ID
 */
export async function findUserById(id: string, include?: Prisma.UserInclude): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds a user by email
 */
export async function findUserByEmail(
  email: string,
  include?: Prisma.UserInclude,
): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
    include,
  });
}

/**
 * Gets a user with their linked player profile
 */
export async function getUserWithPlayer(id: string): Promise<UserWithPlayer | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      player: {
        select: {
          id: true,
          playerNumber: true,
          name: true,
          eventCount: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return user as UserWithPlayer;
}

/**
 * Gets a user by email with their linked player profile
 */
export async function getUserByEmailWithPlayer(email: string): Promise<UserWithPlayer | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      player: {
        select: {
          id: true,
          playerNumber: true,
          name: true,
          eventCount: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return user as UserWithPlayer;
}

/**
 * Updates a user
 */
export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
  return prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Updates a user's refresh token hash
 */
export async function updateUserRefreshToken(
  id: string,
  refreshTokenHash: string | null,
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data: { refreshTokenHash },
  });
}

/**
 * Deletes a user
 */
export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({
    where: { id },
  });
}

/**
 * Counts total users
 */
export async function countUsers(where?: Prisma.UserWhereInput): Promise<number> {
  return prisma.user.count({ where });
}

/**
 * Finds users with pagination and optional filtering
 */
export async function findUsers(params: {
  take?: number;
  skip?: number;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
}): Promise<UserWithPlayer[]> {
  const users = await prisma.user.findMany({
    take: params.take,
    skip: params.skip,
    where: params.where,
    orderBy: params.orderBy,
    include: {
      player: {
        select: {
          id: true,
          playerNumber: true,
          name: true,
          eventCount: true,
        },
      },
    },
  });

  return users as UserWithPlayer[];
}

/**
 * Links a player to a user, automatically unlinking from any existing user.
 * Uses a transaction to ensure atomicity.
 *
 * @param userId - The user to link the player to
 * @param playerId - The player to link (null to unlink)
 * @returns The updated user with player data
 * @throws Error if player not found
 */
export async function linkPlayerToUser(
  userId: string,
  playerId: string | null,
): Promise<UserWithPlayer> {
  return prisma.$transaction(async (tx) => {
    // If linking to a player, first check if that player exists
    if (playerId) {
      const player = await tx.player.findUnique({ where: { id: playerId } });
      if (!player) {
        throw new Error(`Player with id '${playerId}' not found`);
      }

      // Unlink the player from any existing user
      await tx.user.updateMany({
        where: { playerId },
        data: { playerId: null },
      });
    }

    // Update the target user with the new playerId
    const user = await tx.user.update({
      where: { id: userId },
      data: { playerId },
      include: {
        player: {
          select: {
            id: true,
            playerNumber: true,
            name: true,
            eventCount: true,
          },
        },
      },
    });

    return user as UserWithPlayer;
  });
}
