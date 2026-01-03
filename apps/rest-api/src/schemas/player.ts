export const playerSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    externalId: { type: 'string', nullable: true },
    name: { type: 'string', nullable: true },
    rating: { type: 'number' },
    ratingDeviation: { type: 'number' },
    ranking: { type: 'integer', nullable: true },
    isRated: { type: 'boolean' },
    eventCount: { type: 'integer' },
    lastRatingUpdate: { type: 'string', format: 'date-time', nullable: true },
    lastEventDate: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const createPlayerSchema = {
  type: 'object',
  properties: {
    externalId: { type: 'string' },
    name: { type: 'string' },
    rating: { type: 'number', default: 1500 },
    ratingDeviation: { type: 'number', default: 200 },
    ranking: { type: 'integer' },
    isRated: { type: 'boolean', default: false },
    eventCount: { type: 'integer', default: 0 },
  },
} as const;

export const updatePlayerSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    rating: { type: 'number' },
    ratingDeviation: { type: 'number' },
    ranking: { type: 'integer' },
    isRated: { type: 'boolean' },
    eventCount: { type: 'integer' },
  },
} as const;

export const playerListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: { type: 'string', enum: ['rating', 'ranking', 'name', 'eventCount', 'createdAt'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
    isRated: { type: 'boolean' },
  },
} as const;

export const playerSearchQuerySchema = {
  type: 'object',
  required: ['q'],
  properties: {
    q: { type: 'string', minLength: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
} as const;

export const topPlayersQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
  },
} as const;

export const playerStatsSchema = {
  type: 'object',
  properties: {
    totalEvents: { type: 'integer' },
    totalPoints: { type: 'number' },
    totalDecayedPoints: { type: 'number' },
    averagePoints: { type: 'number' },
    averagePosition: { type: 'number' },
    averageFinish: { type: 'number' },
    averageEfficiency: { type: 'number' },
    firstPlaceFinishes: { type: 'integer' },
    topThreeFinishes: { type: 'integer' },
    bestFinish: { type: 'integer' },
    highestPoints: { type: 'number' },
  },
} as const;

export const playerResultSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    position: { type: 'integer' },
    optedOut: { type: 'boolean' },
    linearPoints: { type: 'number', nullable: true },
    dynamicPoints: { type: 'number', nullable: true },
    totalPoints: { type: 'number', nullable: true },
    ageInDays: { type: 'integer', nullable: true },
    decayMultiplier: { type: 'number', nullable: true },
    decayedPoints: { type: 'number', nullable: true },
    efficiency: { type: 'number', nullable: true },
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
