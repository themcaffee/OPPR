export const loginRequestSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 1 },
  },
} as const;

export const registerRequestSchema = {
  type: 'object',
  required: ['email', 'password', 'firstName', 'lastName'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8 },
    firstName: { type: 'string', minLength: 1 },
    middleInitial: { type: 'string', maxLength: 2 },
    lastName: { type: 'string', minLength: 1 },
  },
} as const;

export const refreshRequestSchema = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: { type: 'string' },
  },
} as const;

export const refreshResponseSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    expiresIn: { type: 'integer' },
    tokenType: { type: 'string' },
  },
  required: ['accessToken', 'expiresIn', 'tokenType'],
} as const;

export const userResponseSchema = {
  type: 'object',
  properties: {
    sub: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['user', 'admin'] },
  },
  required: ['sub', 'email', 'role'],
} as const;

export const logoutRequestSchema = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: { type: 'string' },
  },
} as const;

export const logoutResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
  required: ['message'],
} as const;

export const playerProfileSchema = {
  type: 'object',
  nullable: true,
  properties: {
    id: { type: 'string' },
    firstName: { type: 'string' },
    middleInitial: { type: 'string', nullable: true },
    lastName: { type: 'string' },
    rating: { type: 'number' },
    ratingDeviation: { type: 'number' },
    ranking: { type: 'integer', nullable: true },
    isRated: { type: 'boolean' },
    eventCount: { type: 'integer' },
  },
} as const;

export const authUserResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['user', 'admin'] },
    player: playerProfileSchema,
  },
  required: ['id', 'email', 'role'],
} as const;

export const authResponseSchema = {
  type: 'object',
  properties: {
    user: authUserResponseSchema,
    message: { type: 'string' },
  },
  required: ['user', 'message'],
} as const;

// Login response includes tokens and optionally user info (for production mode)
export const loginResponseSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
    expiresIn: { type: 'integer' },
    tokenType: { type: 'string' },
    user: authUserResponseSchema,
    message: { type: 'string' },
  },
  required: ['accessToken', 'refreshToken', 'expiresIn', 'tokenType'],
} as const;
