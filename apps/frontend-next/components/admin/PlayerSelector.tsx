'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Player } from '@opprs/rest-api-client';
import { formatPlayerName } from '@/lib/utils/player';

interface PlayerSelectorProps {
  value: string | null;
  onChange: (playerId: string, player: Player) => void;
  placeholder?: string;
  disabled?: boolean;
  excludePlayerIds?: string[];
}

export function PlayerSelector({
  value,
  onChange,
  placeholder = 'Search for a player...',
  disabled = false,
  excludePlayerIds = [],
}: PlayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [recentPlayers, setRecentPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent players on mount
  useEffect(() => {
    const loadRecentPlayers = async () => {
      try {
        const result = await apiClient.players.list({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
        setRecentPlayers(result.data);
      } catch (error) {
        console.error('Failed to load recent players:', error);
      }
    };
    loadRecentPlayers();
  }, []);

  // Load selected player if value is set but player not loaded
  useEffect(() => {
    if (value && !selectedPlayer) {
      const loadPlayer = async () => {
        try {
          const player = await apiClient.players.get(value);
          setSelectedPlayer(player);
        } catch (error) {
          console.error('Failed to load selected player:', error);
        }
      };
      loadPlayer();
    } else if (!value) {
      setSelectedPlayer(null);
    }
  }, [value, selectedPlayer]);

  // Debounced search
  const searchPlayers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPlayers([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiClient.players.search({ q: query, limit: 20 });
      setPlayers(result);
    } catch (error) {
      console.error('Failed to search players:', error);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchPlayers(searchQuery);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, searchPlayers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (player: Player) => {
    setSelectedPlayer(player);
    onChange(player.id, player);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedPlayer(null);
    setSearchQuery('');
    onChange('', null as unknown as Player);
  };

  const displayPlayers = searchQuery.length >= 2 ? players : recentPlayers;
  const filteredPlayers = displayPlayers.filter((p) => !excludePlayerIds.includes(p.id));

  const getPlayerDisplayName = (player: Player) => {
    return formatPlayerName(player);
  };

  return (
    <div ref={containerRef} className="relative">
      {selectedPlayer ? (
        <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          <div>
            <span className="font-medium">{getPlayerDisplayName(selectedPlayer)}</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
        />
      )}

      {isOpen && !selectedPlayer && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-gray-500 text-center">Loading...</div>
          ) : filteredPlayers.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-center">
              {searchQuery.length >= 2 ? 'No players found' : 'Type to search or select from recent'}
            </div>
          ) : (
            <>
              {searchQuery.length < 2 && (
                <div className="px-3 py-1 text-xs text-gray-400 bg-gray-50 border-b">
                  Recent Players
                </div>
              )}
              {filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleSelect(player)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  <div className="font-medium text-gray-900">{getPlayerDisplayName(player)}</div>
                  <div className="text-xs text-gray-400">
                    Rating: {player.rating?.toFixed(0) || 'N/A'}
                    {player.ranking && ` | Rank: #${player.ranking}`}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
