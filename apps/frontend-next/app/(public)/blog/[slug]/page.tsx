'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import type { BlogPost } from '@opprs/rest-api-client';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiClient.blogPosts
      .getBySlug(slug)
      .then((result) => {
        setPost(result);
        setIsLoading(false);
      })
      .catch(() => {
        setNotFoundError(true);
        setIsLoading(false);
      });
  }, [slug]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (notFoundError || !post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <article>
        {/* Back link */}
        <Link
          href="/blog"
          className="text-blue-600 hover:underline mb-6 inline-block"
        >
          &larr; Back to Blog
        </Link>

        {/* Featured image */}
        {post.featuredImageUrl && (
          <img
            src={post.featuredImageUrl}
            alt={post.featuredImageAlt ?? post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
          />
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-8 pb-8 border-b border-gray-200">
          <time dateTime={post.publishedAt ?? undefined}>
            {formatDate(post.publishedAt)}
          </time>
          {post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="text-blue-600 hover:underline"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
