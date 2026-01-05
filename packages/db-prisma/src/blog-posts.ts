import { prisma } from './client.js';
import type { BlogPost, PostStatus, Prisma } from '@prisma/client';

/**
 * BlogPost with author and tags included
 */
export type BlogPostWithRelations = BlogPost & {
  author: { id: string; email: string };
  tags: { id: string; name: string; slug: string }[];
};

/**
 * Input for creating a new blog post
 */
export interface CreateBlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status?: PostStatus;
  publishedAt?: Date;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  authorId: string;
  tagIds?: string[];
}

/**
 * Input for updating a blog post
 */
export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  status?: PostStatus;
  publishedAt?: Date | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  tagIds?: string[];
}

/**
 * Options for querying blog posts
 */
export interface FindBlogPostsOptions {
  take?: number;
  skip?: number;
  orderBy?: Prisma.BlogPostOrderByWithRelationInput;
  where?: Prisma.BlogPostWhereInput;
  include?: Prisma.BlogPostInclude;
}

const defaultInclude = {
  author: {
    select: { id: true, email: true },
  },
  tags: {
    select: { id: true, name: true, slug: true },
  },
} as const;

/**
 * Creates a new blog post
 */
export async function createBlogPost(data: CreateBlogPostInput): Promise<BlogPostWithRelations> {
  const { tagIds, ...postData } = data;

  return prisma.blogPost.create({
    data: {
      ...postData,
      tags: tagIds?.length ? { connect: tagIds.map((id) => ({ id })) } : undefined,
    },
    include: defaultInclude,
  });
}

/**
 * Finds a blog post by ID
 */
export async function findBlogPostById(id: string): Promise<BlogPostWithRelations | null> {
  return prisma.blogPost.findUnique({
    where: { id },
    include: defaultInclude,
  });
}

/**
 * Finds a blog post by slug
 */
export async function findBlogPostBySlug(slug: string): Promise<BlogPostWithRelations | null> {
  return prisma.blogPost.findUnique({
    where: { slug },
    include: defaultInclude,
  });
}

/**
 * Finds multiple blog posts with optional filters
 */
export async function findBlogPosts(
  options: FindBlogPostsOptions = {},
): Promise<BlogPostWithRelations[]> {
  return prisma.blogPost.findMany({
    take: options.take,
    skip: options.skip,
    where: options.where,
    orderBy: options.orderBy ?? { createdAt: 'desc' },
    include: options.include ?? defaultInclude,
  }) as Promise<BlogPostWithRelations[]>;
}

/**
 * Finds only published blog posts (for public access)
 */
export async function findPublishedBlogPosts(
  options: Omit<FindBlogPostsOptions, 'where'> & { tagSlug?: string } = {},
): Promise<BlogPostWithRelations[]> {
  const { tagSlug, ...restOptions } = options;

  const where: Prisma.BlogPostWhereInput = {
    status: 'PUBLISHED',
    publishedAt: { not: null },
    ...(tagSlug && {
      tags: {
        some: { slug: tagSlug },
      },
    }),
  };

  return findBlogPosts({
    ...restOptions,
    where,
    orderBy: options.orderBy ?? { publishedAt: 'desc' },
  });
}

/**
 * Searches blog posts by title or content
 */
export async function searchBlogPosts(
  query: string,
  limit: number = 20,
  publishedOnly: boolean = true,
): Promise<BlogPostWithRelations[]> {
  const where: Prisma.BlogPostWhereInput = {
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { excerpt: { contains: query, mode: 'insensitive' } },
    ],
    ...(publishedOnly && {
      status: 'PUBLISHED',
      publishedAt: { not: null },
    }),
  };

  return findBlogPosts({
    take: limit,
    where,
    orderBy: { publishedAt: 'desc' },
  });
}

/**
 * Updates a blog post
 */
export async function updateBlogPost(
  id: string,
  data: UpdateBlogPostInput,
): Promise<BlogPostWithRelations> {
  const { tagIds, ...postData } = data;

  return prisma.blogPost.update({
    where: { id },
    data: {
      ...postData,
      // If tagIds is provided, replace all tags
      ...(tagIds !== undefined && {
        tags: {
          set: tagIds.map((tagId) => ({ id: tagId })),
        },
      }),
    },
    include: defaultInclude,
  });
}

/**
 * Deletes a blog post
 */
export async function deleteBlogPost(id: string): Promise<BlogPost> {
  return prisma.blogPost.delete({
    where: { id },
  });
}

/**
 * Counts total blog posts
 */
export async function countBlogPosts(where?: Prisma.BlogPostWhereInput): Promise<number> {
  return prisma.blogPost.count({ where });
}

/**
 * Counts published blog posts (for public access)
 */
export async function countPublishedBlogPosts(tagSlug?: string): Promise<number> {
  return countBlogPosts({
    status: 'PUBLISHED',
    publishedAt: { not: null },
    ...(tagSlug && {
      tags: {
        some: { slug: tagSlug },
      },
    }),
  });
}
