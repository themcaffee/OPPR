'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { TipTapEditor } from '@/components/admin/TipTapEditor';
import type { BlogTag, PostStatus } from '@opprs/rest-api-client';

interface BlogPostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: PostStatus;
  featuredImageUrl: string;
  featuredImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  tagIds: string[];
}

export default function AdminBlogPostEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [allTags, setAllTags] = useState<BlogTag[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostFormData>({
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'DRAFT',
      featuredImageUrl: '',
      featuredImageAlt: '',
      metaTitle: '',
      metaDescription: '',
      ogTitle: '',
      ogDescription: '',
      ogImageUrl: '',
      tagIds: [],
    },
  });

  const title = watch('title');

  // Auto-generate slug from title for new posts
  useEffect(() => {
    if (isNew && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [title, isNew, setValue]);

  // Fetch tags
  useEffect(() => {
    apiClient.blogTags.list({ limit: 100 }).then((result) => {
      setAllTags(result.data);
    });
  }, []);

  // Fetch existing post
  useEffect(() => {
    if (!isNew) {
      apiClient.blogPosts
        .getAdmin(id)
        .then((post) => {
          reset({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt ?? '',
            status: post.status,
            featuredImageUrl: post.featuredImageUrl ?? '',
            featuredImageAlt: post.featuredImageAlt ?? '',
            metaTitle: post.metaTitle ?? '',
            metaDescription: post.metaDescription ?? '',
            ogTitle: post.ogTitle ?? '',
            ogDescription: post.ogDescription ?? '',
            ogImageUrl: post.ogImageUrl ?? '',
            tagIds: post.tags.map((t) => t.id),
          });
          setIsLoading(false);
        })
        .catch(() => {
          setError('Failed to load post');
          setIsLoading(false);
        });
    }
  }, [id, isNew, reset]);

  const onSubmit = async (data: BlogPostFormData) => {
    setError(null);
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || undefined,
        status: data.status,
        featuredImageUrl: data.featuredImageUrl || undefined,
        featuredImageAlt: data.featuredImageAlt || undefined,
        metaTitle: data.metaTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        ogTitle: data.ogTitle || undefined,
        ogDescription: data.ogDescription || undefined,
        ogImageUrl: data.ogImageUrl || undefined,
        tagIds: data.tagIds,
      };

      if (isNew) {
        await apiClient.blogPosts.create(payload);
      } else {
        await apiClient.blogPosts.update(id, payload);
      }
      router.push('/admin/blog');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.blogPosts.delete(id);
      router.push('/admin/blog');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTagToggle = useCallback(
    (tagId: string, currentTagIds: string[]) => {
      if (currentTagIds.includes(tagId)) {
        return currentTagIds.filter((id) => id !== tagId);
      }
      return [...currentTagIds, tagId];
    },
    []
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'New Blog Post' : 'Edit Blog Post'}</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Main content */}
        <Card>
          <div className="space-y-4">
            <FormField
              label="Title"
              id="title"
              {...register('title', { required: 'Title is required' })}
              error={errors.title?.message}
            />

            <FormField
              label="Slug"
              id="slug"
              {...register('slug', {
                required: 'Slug is required',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Slug must be lowercase letters, numbers, and hyphens only',
                },
              })}
              error={errors.slug?.message}
              hint="URL-friendly identifier (auto-generated from title)"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <Controller
                name="content"
                control={control}
                rules={{ required: 'Content is required' }}
                render={({ field }) => (
                  <TipTapEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Write your blog post content..."
                    error={errors.content?.message}
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                {...register('excerpt', { maxLength: 500 })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A brief summary of the post (optional, max 500 characters)"
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Status and Tags */}
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <Controller
                name="tagIds"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => field.onChange(handleTagToggle(tag.id, field.value))}
                        className={`px-3 py-1 rounded-full text-sm ${
                          field.value.includes(tag.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                    {allTags.length === 0 && (
                      <span className="text-sm text-gray-500">
                        No tags available. Create tags in the Tags management page.
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Featured Image */}
        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h2>
          <div className="space-y-4">
            <FormField
              label="Featured Image URL"
              id="featuredImageUrl"
              {...register('featuredImageUrl')}
              placeholder="https://example.com/image.jpg"
            />
            <FormField
              label="Alt Text"
              id="featuredImageAlt"
              {...register('featuredImageAlt')}
              placeholder="Describe the image for accessibility"
            />
          </div>
        </Card>

        {/* SEO Fields */}
        <Card>
          <button
            type="button"
            onClick={() => setShowSeoFields(!showSeoFields)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-medium text-gray-900">SEO Settings</h2>
            <span className="text-gray-500">{showSeoFields ? '▲' : '▼'}</span>
          </button>

          {showSeoFields && (
            <div className="mt-4 space-y-4">
              <FormField
                label="Meta Title"
                id="metaTitle"
                {...register('metaTitle', { maxLength: 60 })}
                placeholder="SEO title (max 60 characters)"
                hint="Leave empty to use post title"
              />
              <div>
                <label
                  htmlFor="metaDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  {...register('metaDescription', { maxLength: 160 })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO description (max 160 characters)"
                />
              </div>
              <FormField
                label="Open Graph Title"
                id="ogTitle"
                {...register('ogTitle')}
                placeholder="Title for social sharing"
              />
              <div>
                <label
                  htmlFor="ogDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Open Graph Description
                </label>
                <textarea
                  id="ogDescription"
                  {...register('ogDescription')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description for social sharing"
                />
              </div>
              <FormField
                label="Open Graph Image URL"
                id="ogImageUrl"
                {...register('ogImageUrl')}
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <div>
            {!isNew && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isNew ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
