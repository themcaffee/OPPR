'use client';

import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PlayerSelector } from '@/components/admin/PlayerSelector';
import { Button } from '@/components/ui/Button';
import type { UserWithPlayer, Player } from '@opprs/rest-api-client';

interface UserPlayerLinkProps {
  user: UserWithPlayer;
  onUpdate: () => void;
}

export function UserPlayerLink({ user, onUpdate }: UserPlayerLinkProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

  const handleLinkPlayer = async (playerId: string, _player: Player) => {
    setIsLoading(true);
    try {
      await apiClient.users.linkPlayer(user.id, playerId);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to link player:', error);
      alert('Failed to link player. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkPlayer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await apiClient.users.unlinkPlayer(user.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to unlink player:', error);
      alert('Failed to unlink player. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  if (user.player) {
    // User has a linked player - show player name with actions
    return (
      <div ref={containerRef} className="relative" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <div className="absolute z-10 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3">
            <div className="text-sm text-gray-500 mb-2">Select a new player:</div>
            <PlayerSelector
              value={null}
              onChange={handleLinkPlayer}
              placeholder="Search for a player..."
              disabled={isLoading}
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="outline"
                className="text-xs py-1 px-2"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{user.player.name || user.player.id}</span>
            <button
              type="button"
              onClick={handleEditClick}
              className="text-blue-600 hover:text-blue-800 text-xs"
              disabled={isLoading}
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleUnlinkPlayer}
              className="text-red-600 hover:text-red-800 text-xs"
              disabled={isLoading}
            >
              {isLoading ? 'Unlinking...' : 'Unlink'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // User has no linked player - show "Link Player" button or selector
  return (
    <div ref={containerRef} className="relative" onClick={(e) => e.stopPropagation()}>
      {isEditing ? (
        <div className="absolute z-10 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="text-sm text-gray-500 mb-2">Select a player to link:</div>
          <PlayerSelector
            value={null}
            onChange={handleLinkPlayer}
            placeholder="Search for a player..."
            disabled={isLoading}
          />
          <div className="mt-2 flex justify-end">
            <Button
              variant="outline"
              className="text-xs py-1 px-2"
              onClick={handleCancelClick}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="text-xs py-1 px-2"
          onClick={handleEditClick}
          disabled={isLoading}
        >
          Link Player
        </Button>
      )}
    </div>
  );
}
