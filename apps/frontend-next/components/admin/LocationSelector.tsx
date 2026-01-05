'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Location } from '@opprs/rest-api-client';

interface LocationSelectorProps {
  value: string | null;
  onChange: (locationId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function LocationSelector({
  value,
  onChange,
  placeholder = 'Search for a location...',
  disabled = false,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent locations on mount
  useEffect(() => {
    const loadRecentLocations = async () => {
      try {
        const result = await apiClient.locations.list({
          limit: 10,
          sortBy: 'name',
          sortOrder: 'asc',
        });
        setRecentLocations(result.data);
      } catch (error) {
        console.error('Failed to load recent locations:', error);
      }
    };
    loadRecentLocations();
  }, []);

  // Load selected location if value is set but location not loaded
  useEffect(() => {
    if (value && !selectedLocation) {
      const loadLocation = async () => {
        try {
          const location = await apiClient.locations.get(value);
          setSelectedLocation(location);
        } catch (error) {
          console.error('Failed to load selected location:', error);
        }
      };
      loadLocation();
    } else if (!value) {
      setSelectedLocation(null);
    }
  }, [value, selectedLocation]);

  // Debounced search
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocations([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiClient.locations.search({ q: query, limit: 20 });
      setLocations(result);
    } catch (error) {
      console.error('Failed to search locations:', error);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, searchLocations]);

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

  const handleSelect = (location: Location) => {
    setSelectedLocation(location);
    onChange(location.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    onChange(null);
  };

  const displayLocations = searchQuery.length >= 2 ? locations : recentLocations;

  const getLocationDisplayName = (location: Location) => {
    return location.name;
  };

  const getLocationSubtitle = (location: Location) => {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  return (
    <div ref={containerRef} className="relative">
      {selectedLocation ? (
        <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
          <div>
            <span className="font-medium">{getLocationDisplayName(selectedLocation)}</span>
            {getLocationSubtitle(selectedLocation) && (
              <span className="text-sm text-gray-500 ml-2">
                ({getLocationSubtitle(selectedLocation)})
              </span>
            )}
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

      {isOpen && !selectedLocation && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-gray-500 text-center">Loading...</div>
          ) : displayLocations.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-center">
              {searchQuery.length >= 2 ? 'No locations found' : 'Type to search or select from list'}
            </div>
          ) : (
            <>
              {searchQuery.length < 2 && (
                <div className="px-3 py-1 text-xs text-gray-400 bg-gray-50 border-b">
                  Available Locations
                </div>
              )}
              {displayLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleSelect(location)}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                >
                  <div className="font-medium text-gray-900">
                    {getLocationDisplayName(location)}
                  </div>
                  {getLocationSubtitle(location) && (
                    <div className="text-xs text-gray-400">{getLocationSubtitle(location)}</div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
