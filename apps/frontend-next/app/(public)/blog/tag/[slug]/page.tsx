'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/admin/Pagination';
import type { BlogPost, BlogTag, BlogTagWithCount, PaginatedResponse } from '@opprs/rest-api-client';

export default function BlogTagPage() {
  const params = useParams();
  const tagSlug = params.slug as string;

  const [tag, setTag] = useState<BlogTag | null>(null);
  const [data, setData] = useState<PaginatedResponse<BlogPost> | null>(null);
  const [allTags, setAllTags] = useState<BlogTagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [page, setPage] = useState(1);

  const fetchTag = useCallback(async () => {
    try {
      const result = await apiClient.blogTags.getBySlug(tagSlug);
      setTag(result);
    } catch {
      setNotFoundError(true);
    }
  }, [tagSlug]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.blogPosts.list({
        page,
        limit: 10,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        tagSlug,
      });
      setData(result);
    } finally {
      setIsLoading(false);
    }
  }, [page, tagSlug]);

  const fetchAllTags = useCallback(async () => {
    try {
      const result = await apiClient.blogTags.listWithCounts();
      setAllTags(result.filter((t) => t._count.posts > 0));
    } catch {
      // Ignore tag fetch errors
    }
  }, []);

  useEffect(() => {
    fetchTag();
    fetchPosts();
    fetchAllTags();
  }, [fetchTag, fetchPosts, fetchAllTags]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (notFoundError) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Blog
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {tag ? `Posts tagged "${tag.name}"` : 'Loading...'}
      </h1>
      {tag?.description && <p className="text-gray-600 mb-8">{tag.description}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No posts with this tag yet.</div>
          ) : (
            <div className="space-y-8">
              {data?.data.map((post) => (
                <article key={post.id} className="border-b border-gray-200 pb-8 last:border-0">
                  {post.featuredImageUrl && (
                    <Link href={`/blog/${post.slug}`}>
                      <img
                        src={post.featuredImageUrl}
                        alt={post.featuredImageAlt ?? post.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    </Link>
                  )}
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 mb-2">
                      {post.title}
                    </h2>
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <time dateTime={post.publishedAt ?? undefined}>
                      {formatDate(post.publishedAt)}
                    </time>
                    {post.tags.length > 0 && (
                      <div className="flex gap-2">
                        {post.tags.map((t) => (
                          <Link
                            key={t.id}
                            href={`/blog/tag/${t.slug}`}
                            className={`${
                              t.slug === tagSlug
                                ? 'text-gray-900 font-medium'
                                : 'text-blue-600 hover:underline'
                            }`}
                          >
                            #{t.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  {post.excerpt && <p className="text-gray-600 mb-4">{post.excerpt}</p>}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Read more
                  </Link>
                </article>
              ))}
            </div>
          )}

          {data && data.pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          {allTags.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/blog/tag/${t.slug}`}
                    className={`px-3 py-1 rounded-full text-sm ${
                      t.slug === tagSlug
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.name} ({t._count.posts})
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
