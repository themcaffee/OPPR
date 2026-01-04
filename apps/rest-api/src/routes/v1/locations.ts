import type { FastifyPluginAsync } from 'fastify';
import {
  createLocation,
  findLocationById,
  findLocations,
  updateLocation,
  deleteLocation,
  countLocations,
  searchLocations,
} from '@opprs/db-prisma';
import {
  locationSchema,
  createLocationSchema,
  updateLocationSchema,
  locationListQuerySchema,
  locationSearchQuerySchema,
} from '../../schemas/location.js';
import {
  idParamSchema,
  errorResponseSchema,
  paginatedResponseSchema,
} from '../../schemas/common.js';
import { parsePaginationParams, buildPaginatedResponse } from '../../utils/pagination.js';
import { NotFoundError } from '../../utils/errors.js';

interface LocationListQuery {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'city' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface LocationSearchQuery {
  q: string;
  limit?: number;
}

interface IdParams {
  id: string;
}

interface CreateLocationBody {
  externalId?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface UpdateLocationBody {
  name?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export const locationRoutes: FastifyPluginAsync = async (app) => {
  // List locations with pagination (public)
  app.get<{ Querystring: LocationListQuery }>(
    '/',
    {
      schema: {
        tags: ['Locations'],
        summary: 'List locations with pagination',
        querystring: locationListQuerySchema,
        response: {
          200: paginatedResponseSchema(locationSchema),
        },
      },
    },
    async (request, reply) => {
      const { sortBy, sortOrder } = request.query;
      const { skip, take, page, limit } = parsePaginationParams(request.query);

      const orderBy = sortBy ? { [sortBy]: sortOrder ?? 'asc' } : { name: 'asc' as const };

      const [locations, total] = await Promise.all([
        findLocations({ take, skip, orderBy }),
        countLocations(),
      ]);

      return reply.send(buildPaginatedResponse(locations, page, limit, total));
    }
  );

  // Search locations (public)
  app.get<{ Querystring: LocationSearchQuery }>(
    '/search',
    {
      schema: {
        tags: ['Locations'],
        summary: 'Search locations by name or city',
        querystring: locationSearchQuerySchema,
        response: {
          200: { type: 'array', items: locationSchema },
        },
      },
    },
    async (request, reply) => {
      const { q, limit = 20 } = request.query;
      const locations = await searchLocations(q, limit);
      return reply.send(locations);
    }
  );

  // Get location by ID (public)
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Locations'],
        summary: 'Get location by ID',
        params: idParamSchema,
        response: {
          200: locationSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const location = await findLocationById(request.params.id);
      if (!location) {
        throw new NotFoundError('Location', request.params.id);
      }
      return reply.send(location);
    }
  );

  // Create location (admin only)
  app.post<{ Body: CreateLocationBody }>(
    '/',
    {
      schema: {
        tags: ['Locations'],
        summary: 'Create a new location (admin only)',
        security: [{ bearerAuth: [] }],
        body: createLocationSchema,
        response: {
          201: locationSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const location = await createLocation(request.body);
      return reply.status(201).send(location);
    }
  );

  // Update location (admin only)
  app.patch<{ Params: IdParams; Body: UpdateLocationBody }>(
    '/:id',
    {
      schema: {
        tags: ['Locations'],
        summary: 'Update a location (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        body: updateLocationSchema,
        response: {
          200: locationSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findLocationById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Location', request.params.id);
      }
      const location = await updateLocation(request.params.id, request.body);
      return reply.send(location);
    }
  );

  // Delete location (admin only)
  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        tags: ['Locations'],
        summary: 'Delete a location (admin only)',
        security: [{ bearerAuth: [] }],
        params: idParamSchema,
        response: {
          204: { type: 'null' },
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [app.requireAdmin],
    },
    async (request, reply) => {
      const existing = await findLocationById(request.params.id);
      if (!existing) {
        throw new NotFoundError('Location', request.params.id);
      }
      await deleteLocation(request.params.id);
      return reply.status(204).send();
    }
  );
};
