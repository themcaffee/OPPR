export const resultSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    playerId: { type: 'string' },
    tournamentId: { type: 'string' },
    position: { type: 'integer' },
    optedOut: { type: 'boolean' },
    linearPoints: { type: 'number', nullable: true },
    dynamicPoints: { type: 'number', nullable: true },
    totalPoints: { type: 'number', nullable: true },
    ageInDays: { type: 'integer', nullable: true },
    decayMultiplier: { type: 'number', nullable: true },
    decayedPoints: { type: 'number', nullable: true },
    efficiency: { type: 'number', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const resultWithRelationsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    playerId: { type: 'string' },
    tournamentId: { type: 'string' },
    position: { type: 'integer' },
    optedOut: { type: 'boolean' },
    linearPoints: { type: 'number', nullable: true },
    dynamicPoints: { type: 'number', nullable: true },
    totalPoints: { type: 'number', nullable: true },
    ageInDays: { type: 'integer', nullable: true },
    decayMultiplier: { type: 'number', nullable: true },
    decayedPoints: { type: 'number', nullable: true },
    efficiency: { type: 'number', nullable: true },
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
    tournament: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string', nullable: true },
        eventBooster: { type: 'string' },
      },
    },
  },
} as const;

export const createResultSchema = {
  type: 'object',
  required: ['playerId', 'tournamentId', 'position'],
  properties: {
    playerId: { type: 'string' },
    tournamentId: { type: 'string' },
    position: { type: 'integer', minimum: 1 },
    optedOut: { type: 'boolean', default: false },
    linearPoints: { type: 'number' },
    dynamicPoints: { type: 'number' },
    totalPoints: { type: 'number' },
    ageInDays: { type: 'integer' },
    decayMultiplier: { type: 'number' },
    decayedPoints: { type: 'number' },
    efficiency: { type: 'number' },
  },
} as const;

export const createManyResultsSchema = {
  type: 'array',
  items: createResultSchema,
  minItems: 1,
} as const;

export const updateResultSchema = {
  type: 'object',
  properties: {
    position: { type: 'integer', minimum: 1 },
    optedOut: { type: 'boolean' },
    linearPoints: { type: 'number' },
    dynamicPoints: { type: 'number' },
    totalPoints: { type: 'number' },
    ageInDays: { type: 'integer' },
    decayMultiplier: { type: 'number' },
    decayedPoints: { type: 'number' },
    efficiency: { type: 'number' },
  },
} as const;

export const resultListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    playerId: { type: 'string' },
    tournamentId: { type: 'string' },
    sortBy: { type: 'string', enum: ['position', 'totalPoints', 'decayedPoints', 'createdAt'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
  },
} as const;

export const batchResultResponseSchema = {
  type: 'object',
  properties: {
    count: { type: 'integer' },
  },
  required: ['count'],
} as const;

export const recalculateDecayResponseSchema = {
  type: 'object',
  properties: {
    count: { type: 'integer' },
    message: { type: 'string' },
  },
  required: ['count', 'message'],
} as const;
