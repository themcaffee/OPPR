import { prisma } from './client.js';
import type { BlogTag, Prisma } from '@prisma/client';

/**
 * Input for creating a new blog tag
 */
export interface CreateBlogTagInput {
  name: string;
  slug: string;
  description?: string;
}

/**
 * Input for updating a blog tag
 */
export interface UpdateBlogTagInput {
  name?: string;
  slug?: string;
  description?: string | null;
}

/**
 * Options for querying blog tags
 */
export interface FindBlogTagsOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.BlogTagOrderByWithRelationInput;
  where?: Prisma.BlogTagWhereInput;
  include?: Prisma.BlogTagInclude;
}

/**
 * Creates a new blog tag
 */
export async function createBlogTag(data: CreateBlogTagInput): Promise<BlogTag> {
  return prisma.blogTag.create({
    data,
  });
}

/**
 * Finds a blog tag by ID
 */
export async function findBlogTagById(id: string): Promise<BlogTag | null> {
  return prisma.blogTag.findUnique({
    where: { id },
  });
}

/**
 * Finds a blog tag by slug
 */
export async function findBlogTagBySlug(slug: string): Promise<BlogTag | null> {
  return prisma.blogTag.findUnique({
    where: { slug },
  });
}

/**
 * Finds multiple blog tags with optional filters
 */
export async function findBlogTags(options: FindBlogTagsOptions = {}): Promise<BlogTag[]> {
  return prisma.blogTag.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy ?? { name: 'asc' },
    include: options.include,
  });
}

/**
 * Searches blog tags by name
 */
export async function searchBlogTags(query: string, limit: number = 20): Promise<BlogTag[]> {
  return findBlogTags({
    take: limit,
    where: {
      name: { contains: query, mode: 'insensitive' },
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Updates a blog tag
 */
export async function updateBlogTag(id: string, data: UpdateBlogTagInput): Promise<BlogTag> {
  return prisma.blogTag.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a blog tag
 */
export async function deleteBlogTag(id: string): Promise<BlogTag> {
  return prisma.blogTag.delete({
    where: { id },
  });
}

/**
 * Counts total blog tags
 */
export async function countBlogTags(where?: Prisma.BlogTagWhereInput): Promise<number> {
  return prisma.blogTag.count({ where });
}

/**
 * Gets blog tag with post count
 */
export async function getBlogTagWithPostCount(id: string) {
  return prisma.blogTag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });
}

/**
 * Gets all blog tags with post counts
 */
export async function getBlogTagsWithPostCounts() {
  return prisma.blogTag.findMany({
    include: {
      _count: {
        select: { posts: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}
