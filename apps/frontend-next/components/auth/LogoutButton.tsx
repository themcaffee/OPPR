'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } catch {
      // Even if logout fails, redirect to sign-in
    }
    router.push('/sign-in');
  };

  return (
    <Button type="button" variant="secondary" onClick={handleLogout} isLoading={isLoading}>
      Sign Out
    </Button>
  );
}
