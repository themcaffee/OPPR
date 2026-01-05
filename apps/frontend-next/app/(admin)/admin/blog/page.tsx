'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { SearchInput } from '@/components/admin/SearchInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { BlogPost, PaginatedResponse, PostStatus } from '@opprs/rest-api-client';

export default function AdminBlogPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<BlogPost> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | ''>('');

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      if (search) {
        const posts = await apiClient.blogPosts.search({ q: search, limit: 50 });
        setData({
          data: posts,
          pagination: { page: 1, limit: 50, total: posts.length, totalPages: 1 },
        });
      } else {
        const result = await apiClient.blogPosts.listAdmin({
          page,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          ...(statusFilter && { status: statusFilter }),
        });
        setData(result);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    { key: 'title', header: 'Title' },
    {
      key: 'status',
      header: 'Status',
      render: (p: BlogPost) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            p.status === 'PUBLISHED'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: 'publishedAt',
      header: 'Published',
      render: (p: BlogPost) => formatDate(p.publishedAt),
    },
    {
      key: 'author',
      header: 'Author',
      render: (p: BlogPost) => p.author.email,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (p: BlogPost) => formatDate(p.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push('/admin/blog/tags')}>
            Manage Tags
          </Button>
          <Button onClick={() => router.push('/admin/blog/new')}>New Post</Button>
        </div>
      </div>

      <Card className="p-0">
        <div className="p-4 border-b flex gap-4">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Search posts..." />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PostStatus | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(p) => router.push(`/admin/blog/${p.id}`)}
        />
        {data && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
