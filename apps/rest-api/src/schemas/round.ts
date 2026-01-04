export const roundSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    tournamentId: { type: 'string' },
    number: { type: 'integer' },
    name: { type: 'string', nullable: true },
    isFinals: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const roundWithMatchesSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    tournamentId: { type: 'string' },
    number: { type: 'integer' },
    name: { type: 'string', nullable: true },
    isFinals: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    matches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          number: { type: 'integer', nullable: true },
          machineName: { type: 'string', nullable: true },
        },
      },
    },
  },
} as const;

export const createRoundSchema = {
  type: 'object',
  required: ['tournamentId', 'number'],
  properties: {
    tournamentId: { type: 'string' },
    number: { type: 'integer', minimum: 1 },
    name: { type: 'string' },
    isFinals: { type: 'boolean', default: false },
  },
} as const;

export const createManyRoundsSchema = {
  type: 'array',
  items: createRoundSchema,
  minItems: 1,
} as const;

export const updateRoundSchema = {
  type: 'object',
  properties: {
    number: { type: 'integer', minimum: 1 },
    name: { type: 'string' },
    isFinals: { type: 'boolean' },
  },
} as const;

export const roundListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    tournamentId: { type: 'string' },
    isFinals: { type: 'boolean' },
  },
} as const;
