import { prisma } from './client.js';
import type { Location, Prisma } from '@prisma/client';

/**
 * Input for creating a new location
 */
export interface CreateLocationInput {
  externalId?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Input for updating a location
 */
export interface UpdateLocationInput {
  name?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

/**
 * Options for querying locations
 */
export interface FindLocationsOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.LocationOrderByWithRelationInput;
  where?: Prisma.LocationWhereInput;
  include?: Prisma.LocationInclude;
}

/**
 * Creates a new location
 */
export async function createLocation(data: CreateLocationInput): Promise<Location> {
  return prisma.location.create({
    data,
  });
}

/**
 * Finds a location by ID
 */
export async function findLocationById(
  id: string,
  include?: Prisma.LocationInclude,
): Promise<Location | null> {
  return prisma.location.findUnique({
    where: { id },
    include,
  });
}

/**
 * Finds a location by external ID
 */
export async function findLocationByExternalId(
  externalId: string,
  include?: Prisma.LocationInclude,
): Promise<Location | null> {
  return prisma.location.findUnique({
    where: { externalId },
    include,
  });
}

/**
 * Finds multiple locations with optional filters
 */
export async function findLocations(options: FindLocationsOptions = {}): Promise<Location[]> {
  return prisma.location.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
  });
}

/**
 * Searches locations by name or city
 */
export async function searchLocations(query: string, limit: number = 20): Promise<Location[]> {
  return findLocations({
    take: limit,
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Updates a location
 */
export async function updateLocation(id: string, data: UpdateLocationInput): Promise<Location> {
  return prisma.location.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a location
 */
export async function deleteLocation(id: string): Promise<Location> {
  return prisma.location.delete({
    where: { id },
  });
}

/**
 * Counts total locations
 */
export async function countLocations(where?: Prisma.LocationWhereInput): Promise<number> {
  return prisma.location.count({ where });
}

/**
 * Gets location with its tournaments
 */
export async function getLocationWithTournaments(id: string) {
  return prisma.location.findUnique({
    where: { id },
    include: {
      tournaments: {
        orderBy: {
          date: 'desc',
        },
      },
    },
  });
}
