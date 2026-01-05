'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Modal } from '@/components/admin/Modal';
import type { BlogTagWithCount } from '@opprs/rest-api-client';

interface TagFormData {
  name: string;
  slug: string;
  description: string;
}

export default function AdminBlogTagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<BlogTagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTag, setEditingTag] = useState<BlogTagWithCount | null>(null);
  const [deleteTag, setDeleteTag] = useState<BlogTagWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TagFormData>({ name: '', slug: '', description: '' });

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.blogTags.listWithCounts();
      setTags(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !editingTag ? generateSlug(name) : prev.slug,
    }));
  };

  const openCreateModal = () => {
    setFormData({ name: '', slug: '', description: '' });
    setError(null);
    setShowCreateModal(true);
  };

  const openEditModal = (tag: BlogTagWithCount) => {
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description ?? '',
    });
    setError(null);
    setEditingTag(tag);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTag(null);
    setFormData({ name: '', slug: '', description: '' });
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError('Name and slug are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingTag) {
        await apiClient.blogTags.update(editingTag.id, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
        });
      } else {
        await apiClient.blogTags.create({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
        });
      }
      closeModal();
      fetchTags();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTag) return;

    setIsDeleting(true);
    try {
      await apiClient.blogTags.delete(deleteTag.id);
      setDeleteTag(null);
      fetchTags();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Tags</h1>
          <p className="text-gray-600 mt-1">Manage tags for organizing blog posts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/blog')}>
            Back to Posts
          </Button>
          <Button onClick={openCreateModal}>Add Tag</Button>
        </div>
      </div>

      <Card className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : tags.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tags yet. Create your first tag to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {tag.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{tag.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {tag._count.posts}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                    {tag.description ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(tag)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTag(tag)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || !!editingTag}
        onClose={closeModal}
        title={editingTag ? 'Edit Tag' : 'Create Tag'}
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <FormField
            label="Name"
            id="tag-name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Tournament News"
          />

          <FormField
            label="Slug"
            id="tag-slug"
            value={formData.slug}
            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="e.g. tournament-news"
            hint="URL-friendly identifier"
          />

          <div>
            <label htmlFor="tag-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="tag-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of this tag"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={isSaving}>
              {editingTag ? 'Save' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTag}
        onClose={() => setDeleteTag(null)}
        onConfirm={handleDelete}
        title="Delete Tag"
        message={`Are you sure you want to delete the tag "${deleteTag?.name}"? This will remove it from all posts.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
