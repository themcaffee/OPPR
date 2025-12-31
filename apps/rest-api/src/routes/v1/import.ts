import type { FastifyPluginAsync } from 'fastify';
import type { EventBoosterType } from '@opprs/db-prisma';
import { importTournament } from '../../services/matchplay-import.js';
import {
  importMatchplayTournamentBodySchema,
  importMatchplayTournamentParamsSchema,
  importTournamentResponseSchema,
  externalServiceErrorSchema,
} from '../../schemas/import.js';
import { errorResponseSchema } from '../../schemas/common.js';
import { BadRequestError } from '../../utils/errors.js';

interface ImportMatchplayTournamentParams {
  id: string;
}

interface ImportMatchplayTournamentBody {
  eventBooster?: EventBoosterType;
  apiToken?: string;
}

export const importRoutes: FastifyPluginAsync = async (app) => {
  // Import tournament from Matchplay
  app.post<{
    Params: ImportMatchplayTournamentParams;
    Body: ImportMatchplayTournamentBody;
  }>(
    '/matchplay/tournament/:id',
    {
      schema: {
        tags: ['Import'],
        summary: 'Import a tournament from Matchplay',
        description:
          'Fetches tournament data from Matchplay API, creates/updates players and tournament in the database, calculates OPPRS values, and distributes points to results.',
        security: [{ bearerAuth: [] }],
        params: importMatchplayTournamentParamsSchema,
        body: importMatchplayTournamentBodySchema,
        response: {
          200: importTournamentResponseSchema,
          201: importTournamentResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
          502: externalServiceErrorSchema,
        },
      },
      preHandler: [app.authenticate],
    },
    async (request, reply) => {
      const matchplayId = parseInt(request.params.id, 10);
      if (isNaN(matchplayId) || matchplayId <= 0) {
        throw new BadRequestError('Invalid Matchplay tournament ID');
      }

      const result = await importTournament(matchplayId, {
        eventBoosterOverride: request.body?.eventBooster,
        apiToken: request.body?.apiToken,
      });

      const statusCode = result.created ? 201 : 200;
      return reply.status(statusCode).send(result);
    }
  );
};
