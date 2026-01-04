export const matchSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    tournamentId: { type: 'string' },
    roundId: { type: 'string', nullable: true },
    number: { type: 'integer', nullable: true },
    machineName: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const matchWithEntriesSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    tournamentId: { type: 'string' },
    roundId: { type: 'string', nullable: true },
    number: { type: 'integer', nullable: true },
    machineName: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    round: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string' },
        number: { type: 'integer' },
        name: { type: 'string', nullable: true },
        isFinals: { type: 'boolean' },
      },
    },
    entries: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          playerId: { type: 'string' },
          result: { type: 'string', enum: ['WIN', 'LOSS', 'TIE'] },
          position: { type: 'integer', nullable: true },
          player: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  },
} as const;

export const createMatchSchema = {
  type: 'object',
  required: ['tournamentId'],
  properties: {
    tournamentId: { type: 'string' },
    roundId: { type: 'string' },
    number: { type: 'integer' },
    machineName: { type: 'string' },
  },
} as const;

export const createManyMatchesSchema = {
  type: 'array',
  items: createMatchSchema,
  minItems: 1,
} as const;

export const updateMatchSchema = {
  type: 'object',
  properties: {
    roundId: { type: 'string', nullable: true },
    number: { type: 'integer' },
    machineName: { type: 'string' },
  },
} as const;

export const matchListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    tournamentId: { type: 'string' },
    roundId: { type: 'string' },
  },
} as const;
