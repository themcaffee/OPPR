'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { UserPlayerLink } from '@/components/admin/UserPlayerLink';
import type { UserWithPlayer, PaginatedResponse } from '@opprs/rest-api-client';

export default function AdminUsersPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<UserWithPlayer> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserWithPlayer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.users.list({ page, limit: 20 });
      setData(result);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      await apiClient.users.delete(selectedUser.id);
      setShowDeleteConfirm(false);
      fetchUsers();
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = [
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (u: UserWithPlayer) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: 'player',
      header: 'Linked Player',
      render: (u: UserWithPlayer) => <UserPlayerLink user={u} onUpdate={fetchUsers} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (u: UserWithPlayer) => new Date(u.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: UserWithPlayer) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="text-sm py-1 px-2"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/users/${u.id}`);
            }}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-sm py-1 px-2 text-red-600 border-red-300 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(u);
              setShowDeleteConfirm(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      <Card className="p-0">
        <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} />
        {data && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </Card>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.email}? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isUpdating}
      />
    </div>
  );
}
