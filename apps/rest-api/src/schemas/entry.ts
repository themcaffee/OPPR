export const entrySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    matchId: { type: 'string' },
    playerId: { type: 'string' },
    result: { type: 'string', enum: ['WIN', 'LOSS', 'TIE'] },
    position: { type: 'integer', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const entryWithRelationsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    matchId: { type: 'string' },
    playerId: { type: 'string' },
    result: { type: 'string', enum: ['WIN', 'LOSS', 'TIE'] },
    position: { type: 'integer', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    player: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', nullable: true },
        rating: { type: 'number' },
        ranking: { type: 'integer', nullable: true },
      },
    },
    match: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        tournamentId: { type: 'string' },
        roundId: { type: 'string', nullable: true },
        number: { type: 'integer', nullable: true },
        machineName: { type: 'string', nullable: true },
      },
    },
  },
} as const;

export const createEntrySchema = {
  type: 'object',
  required: ['matchId', 'playerId', 'result'],
  properties: {
    matchId: { type: 'string' },
    playerId: { type: 'string' },
    result: { type: 'string', enum: ['WIN', 'LOSS', 'TIE'] },
    position: { type: 'integer', minimum: 1 },
  },
} as const;

export const createManyEntriesSchema = {
  type: 'array',
  items: createEntrySchema,
  minItems: 1,
} as const;

export const updateEntrySchema = {
  type: 'object',
  properties: {
    result: { type: 'string', enum: ['WIN', 'LOSS', 'TIE'] },
    position: { type: 'integer', minimum: 1 },
  },
} as const;

export const entryListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    matchId: { type: 'string' },
    playerId: { type: 'string' },
  },
} as const;
