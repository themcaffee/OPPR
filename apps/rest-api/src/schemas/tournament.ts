export const eventBoosterTypes = ['NONE', 'CERTIFIED', 'CERTIFIED_PLUS', 'CHAMPIONSHIP_SERIES', 'MAJOR'] as const;

export const tournamentSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    externalId: { type: 'string', nullable: true },
    name: { type: 'string' },
    description: { type: 'string', nullable: true },
    date: { type: 'string', format: 'date-time' },
    locationId: { type: 'string', nullable: true },
    location: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        address: { type: 'string', nullable: true },
        city: { type: 'string', nullable: true },
        state: { type: 'string', nullable: true },
        country: { type: 'string', nullable: true },
      },
    },
    organizerId: { type: 'string', nullable: true },
    organizer: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string' },
        name: { type: 'string', nullable: true },
      },
    },
    tgpConfig: { type: 'object', additionalProperties: true, nullable: true },
    eventBooster: { type: 'string', enum: eventBoosterTypes },
    allowsOptOut: { type: 'boolean' },
    baseValue: { type: 'number', nullable: true },
    tvaRating: { type: 'number', nullable: true },
    tvaRanking: { type: 'number', nullable: true },
    totalTVA: { type: 'number', nullable: true },
    tgp: { type: 'number', nullable: true },
    eventBoosterMultiplier: { type: 'number', nullable: true },
    firstPlaceValue: { type: 'number', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const createTournamentSchema = {
  type: 'object',
  required: ['name', 'date'],
  properties: {
    externalId: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', maxLength: 2000 },
    date: { type: 'string', format: 'date-time' },
    locationId: { type: 'string' },
    organizerId: { type: 'string' },
    tgpConfig: { type: 'object', additionalProperties: true },
    eventBooster: { type: 'string', enum: eventBoosterTypes, default: 'NONE' },
    allowsOptOut: { type: 'boolean', default: false },
    baseValue: { type: 'number' },
    tvaRating: { type: 'number' },
    tvaRanking: { type: 'number' },
    totalTVA: { type: 'number' },
    tgp: { type: 'number' },
    eventBoosterMultiplier: { type: 'number' },
    firstPlaceValue: { type: 'number' },
  },
} as const;

export const updateTournamentSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', maxLength: 2000, nullable: true },
    date: { type: 'string', format: 'date-time' },
    locationId: { type: 'string', nullable: true },
    organizerId: { type: 'string', nullable: true },
    tgpConfig: { type: 'object', additionalProperties: true },
    eventBooster: { type: 'string', enum: eventBoosterTypes },
    allowsOptOut: { type: 'boolean' },
    baseValue: { type: 'number' },
    tvaRating: { type: 'number' },
    tvaRanking: { type: 'number' },
    totalTVA: { type: 'number' },
    tgp: { type: 'number' },
    eventBoosterMultiplier: { type: 'number' },
    firstPlaceValue: { type: 'number' },
  },
} as const;

export const tournamentListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: { type: 'string', enum: ['date', 'name', 'firstPlaceValue', 'createdAt'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    eventBooster: { type: 'string', enum: eventBoosterTypes },
  },
} as const;

export const tournamentSearchQuerySchema = {
  type: 'object',
  required: ['q'],
  properties: {
    q: { type: 'string', minLength: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
} as const;

export const recentTournamentsQuerySchema = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
} as const;

export const tournamentStatsSchema = {
  type: 'object',
  properties: {
    tournament: tournamentSchema,
    playerCount: { type: 'integer' },
    averagePoints: { type: 'number' },
    averageEfficiency: { type: 'number' },
    highestPoints: { type: 'number' },
    lowestPoints: { type: 'number' },
  },
} as const;

export const tournamentResultSchema = {
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
    player: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', nullable: true },
        rating: { type: 'number' },
        ranking: { type: 'integer', nullable: true },
      },
    },
  },
} as const;
