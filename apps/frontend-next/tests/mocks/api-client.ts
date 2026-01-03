import { vi } from 'vitest';

export function createMockApiClient() {
  return {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
    players: {
      list: vi.fn(),
      get: vi.fn(),
      search: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getStats: vi.fn(),
      getResults: vi.fn(),
    },
    tournaments: {
      list: vi.fn(),
      get: vi.fn(),
      search: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      recent: vi.fn(),
      getResults: vi.fn(),
    },
    results: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    stats: {
      overview: vi.fn(),
      leaderboard: vi.fn(),
    },
    users: {
      list: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      linkPlayer: vi.fn(),
      unlinkPlayer: vi.fn(),
    },
    import: {
      matchplayTournament: vi.fn(),
    },
  };
}

export type MockApiClient = ReturnType<typeof createMockApiClient>;
