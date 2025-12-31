export const paginationQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
} as const;

export const sortQuerySchema = {
  type: 'object',
  properties: {
    sortBy: { type: 'string' },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
  },
} as const;

export const idParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' },
  },
} as const;

export const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' },
    details: { type: 'object', additionalProperties: true },
  },
  required: ['statusCode', 'error', 'message'],
} as const;

export const paginationMetaSchema = {
  type: 'object',
  properties: {
    page: { type: 'integer' },
    limit: { type: 'integer' },
    total: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
  required: ['page', 'limit', 'total', 'totalPages'],
} as const;

export function paginatedResponseSchema(itemSchema: object) {
  return {
    type: 'object',
    properties: {
      data: { type: 'array', items: itemSchema },
      pagination: paginationMetaSchema,
    },
    required: ['data', 'pagination'],
  } as const;
}
