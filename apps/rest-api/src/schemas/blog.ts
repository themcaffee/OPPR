// Blog Tag schemas
export const blogTagSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    slug: { type: 'string' },
    description: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const createBlogTagSchema = {
  type: 'object',
  required: ['name', 'slug'],
  properties: {
    name: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 1, pattern: '^[a-z0-9-]+$' },
    description: { type: 'string' },
  },
} as const;

export const updateBlogTagSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 1, pattern: '^[a-z0-9-]+$' },
    description: { type: 'string', nullable: true },
  },
} as const;

export const blogTagListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: { type: 'string', enum: ['name', 'createdAt'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
  },
} as const;

export const blogTagSearchQuerySchema = {
  type: 'object',
  required: ['q'],
  properties: {
    q: { type: 'string', minLength: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
} as const;

// Blog Post author schema (subset of user)
const authorSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
  },
} as const;

// Blog Post schemas
export const blogPostSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    slug: { type: 'string' },
    content: { type: 'string' },
    excerpt: { type: 'string', nullable: true },
    status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
    publishedAt: { type: 'string', format: 'date-time', nullable: true },
    featuredImageUrl: { type: 'string', nullable: true },
    featuredImageAlt: { type: 'string', nullable: true },
    metaTitle: { type: 'string', nullable: true },
    metaDescription: { type: 'string', nullable: true },
    ogTitle: { type: 'string', nullable: true },
    ogDescription: { type: 'string', nullable: true },
    ogImageUrl: { type: 'string', nullable: true },
    authorId: { type: 'string' },
    author: authorSchema,
    tags: { type: 'array', items: blogTagSchema },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const createBlogPostSchema = {
  type: 'object',
  required: ['title', 'slug', 'content'],
  properties: {
    title: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 1, pattern: '^[a-z0-9-]+$' },
    content: { type: 'string' },
    excerpt: { type: 'string', maxLength: 500 },
    status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
    featuredImageUrl: { type: 'string' },
    featuredImageAlt: { type: 'string' },
    metaTitle: { type: 'string', maxLength: 60 },
    metaDescription: { type: 'string', maxLength: 160 },
    ogTitle: { type: 'string' },
    ogDescription: { type: 'string' },
    ogImageUrl: { type: 'string' },
    tagIds: { type: 'array', items: { type: 'string' } },
  },
} as const;

export const updateBlogPostSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    slug: { type: 'string', minLength: 1, pattern: '^[a-z0-9-]+$' },
    content: { type: 'string' },
    excerpt: { type: 'string', maxLength: 500, nullable: true },
    status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
    featuredImageUrl: { type: 'string', nullable: true },
    featuredImageAlt: { type: 'string', nullable: true },
    metaTitle: { type: 'string', maxLength: 60, nullable: true },
    metaDescription: { type: 'string', maxLength: 160, nullable: true },
    ogTitle: { type: 'string', nullable: true },
    ogDescription: { type: 'string', nullable: true },
    ogImageUrl: { type: 'string', nullable: true },
    tagIds: { type: 'array', items: { type: 'string' } },
  },
} as const;

export const blogPostListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: { type: 'string', enum: ['publishedAt', 'title', 'createdAt'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    tagSlug: { type: 'string' },
  },
} as const;

export const adminBlogPostListQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: { type: 'string', enum: ['publishedAt', 'title', 'createdAt'] },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
    tagSlug: { type: 'string' },
  },
} as const;

export const blogPostSearchQuerySchema = {
  type: 'object',
  required: ['q'],
  properties: {
    q: { type: 'string', minLength: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
} as const;
