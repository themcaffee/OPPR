import { eventBoosterTypes, tournamentSchema } from './tournament.js';

export const importMatchplayTournamentBodySchema = {
  type: 'object',
  properties: {
    eventBooster: {
      type: 'string',
      enum: eventBoosterTypes,
      description: 'Override auto-detected event booster type',
    },
    apiToken: {
      type: 'string',
      description: 'Matchplay API token (overrides server default)',
    },
  },
} as const;

export const importMatchplayTournamentParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', description: 'Matchplay tournament ID' },
  },
} as const;

export const importTournamentResponseSchema = {
  type: 'object',
  properties: {
    tournament: tournamentSchema,
    playersCreated: { type: 'integer', description: 'Number of new players created' },
    playersUpdated: { type: 'integer', description: 'Number of existing players updated' },
    resultsCount: { type: 'integer', description: 'Number of results imported' },
    created: { type: 'boolean', description: 'True if tournament was newly created, false if updated' },
  },
  required: ['tournament', 'playersCreated', 'playersUpdated', 'resultsCount', 'created'],
} as const;

export const externalServiceErrorSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' },
    service: { type: 'string' },
  },
  required: ['statusCode', 'error', 'message', 'service'],
} as const;
