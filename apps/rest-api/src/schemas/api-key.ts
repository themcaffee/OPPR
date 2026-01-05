export const apiKeySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    keyPrefix: { type: 'string' },
    expiresAt: { type: 'string', format: 'date-time', nullable: true },
    lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'name', 'keyPrefix', 'createdAt'],
} as const;

export const apiKeyCreatedSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    key: { type: 'string', description: 'Full API key - only shown once' },
    keyPrefix: { type: 'string' },
    expiresAt: { type: 'string', format: 'date-time', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'name', 'key', 'keyPrefix', 'createdAt'],
} as const;

export const createApiKeySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    expiresAt: { type: 'string', format: 'date-time' },
  },
  required: ['name'],
} as const;

export const apiKeyListSchema = {
  type: 'array',
  items: apiKeySchema,
} as const;
