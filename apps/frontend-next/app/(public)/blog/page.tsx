'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/admin/Pagination';
import type { BlogPost, BlogTagWithCount, PaginatedResponse } from '@opprs/rest-api-client';

export default function BlogPage() {
  const [data, setData] = useState<PaginatedResponse<BlogPost> | null>(null);
  const [tags, setTags] = useState<BlogTagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.blogPosts.list({
        page,
        limit: 10,
        sortBy: 'publishedAt',
        sortOrder: 'desc',
      });
      setData(result);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const fetchTags = useCallback(async () => {
    try {
      const result = await apiClient.blogTags.listWithCounts();
      // Only show tags that have posts
      setTags(result.filter((t) => t._count.posts > 0));
    } catch {
      // Ignore tag fetch errors
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchTags();
  }, [fetchPosts, fetchTags]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No blog posts yet.</div>
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
                        {post.tags.map((tag) => (
                          <Link
                            key={tag.id}
                            href={`/blog/tag/${tag.slug}`}
                            className="text-blue-600 hover:underline"
                          >
                            #{tag.name}
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
          {tags.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    {tag.name} ({tag._count.posts})
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
