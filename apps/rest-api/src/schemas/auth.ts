export const loginRequestSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 1 },
  },
} as const;

export const loginResponseSchema = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
    expiresIn: { type: 'integer' },
    tokenType: { type: 'string' },
  },
  required: ['accessToken', 'refreshToken', 'expiresIn', 'tokenType'],
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
