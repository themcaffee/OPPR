import { playerSchema } from './player.js';

export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['USER', 'ADMIN'] },
    playerId: { type: 'string', nullable: true },
    player: { ...playerSchema, nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
} as const;

export const userListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: { type: 'string', enum: ['email', 'role', 'createdAt'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
} as const;

export const updateUserRoleSchema = {
  type: 'object',
  properties: {
    role: { type: 'string', enum: ['USER', 'ADMIN'] },
  },
  required: ['role'],
} as const;

export const updateUserSchema = {
  type: 'object',
  properties: {
    role: { type: 'string', enum: ['USER', 'ADMIN'] },
    playerId: { type: ['string', 'null'] },
    password: { type: 'string', minLength: 8 },
  },
} as const;
