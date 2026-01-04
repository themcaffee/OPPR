export const locationSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    externalId: { type: 'string', nullable: true },
    name: { type: 'string' },
    address: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    state: { type: 'string', nullable: true },
    country: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const createLocationSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    externalId: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    address: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string' },
    country: { type: 'string' },
  },
} as const;

export const updateLocationSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    address: { type: 'string', nullable: true },
    city: { type: 'string', nullable: true },
    state: { type: 'string', nullable: true },
    country: { type: 'string', nullable: true },
  },
} as const;

export const locationListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: { type: 'string', enum: ['name', 'city', 'createdAt'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
  },
} as const;

export const locationSearchQuerySchema = {
  type: 'object',
  required: ['q'],
  properties: {
    q: { type: 'string', minLength: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
} as const;
