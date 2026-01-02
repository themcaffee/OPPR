# @opprs/rest-api-client

TypeScript SDK for the OPPRS (Open Pinball Player Ranking System) REST API. Provides type-safe access to all API endpoints with comprehensive error handling and flexible authentication.

## Installation

```bash
npm install @opprs/rest-api-client
# or
pnpm add @opprs/rest-api-client
```

## Quick Start

```typescript
import { OpprsClient } from '@opprs/rest-api-client';

const client = new OpprsClient({
  baseUrl: 'https://api.opprs.example.com/api/v1',
});

// Fetch players
const players = await client.players.list({ page: 1, limit: 20 });

// Get a specific tournament
const tournament = await client.tournaments.get('tournament-id');

// Search for players by name
const searchResults = await client.players.search({ name: 'John' });
```

## Configuration

### Client Options

```typescript
interface OpprsClientOptions {
  baseUrl?: string;              // Default: '/api/v1'
  timeout?: number;              // Default: 30000ms
  accessToken?: string;          // Initial access token
  refreshToken?: string;         // For session persistence
  onTokenRefresh?: (tokens: TokenPair) => void;  // Called when tokens refresh
  onAuthError?: () => void;      // Called on auth failure
  fetch?: typeof fetch;          // Custom fetch implementation
  useCookies?: boolean;          // Use cookie-based auth (default: false)
}
```

### Authentication Modes

**Token Mode** (default):
```typescript
const client = new OpprsClient({
  baseUrl: 'https://api.opprs.example.com/api/v1',
  onTokenRefresh: (tokens) => {
    // Persist tokens to storage
    localStorage.setItem('tokens', JSON.stringify(tokens));
  },
});

// Login
await client.login({ email: 'user@example.com', password: 'password' });

// Restore session from storage
const stored = localStorage.getItem('tokens');
if (stored) {
  client.setTokensFromStorage(JSON.parse(stored));
}
```

**Cookie Mode** (for browser apps with HTTP-only cookies):
```typescript
const client = new OpprsClient({
  baseUrl: 'https://api.opprs.example.com/api/v1',
  useCookies: true,
});

// Server manages cookies automatically
await client.login({ email: 'user@example.com', password: 'password' });
```

## API Reference

### Players

```typescript
// List players with pagination
client.players.list({ page: 1, limit: 20 });

// Search by name or email
client.players.search({ name: 'John', email: 'john@example.com' });

// Get top players by rating or ranking
client.players.topByRating({ limit: 10 });
client.players.topByRanking({ limit: 10 });

// CRUD operations
client.players.get(id);
client.players.create({ name: 'Jane Doe', email: 'jane@example.com' });
client.players.update(id, { name: 'Jane Smith' });
client.players.delete(id);

// Player-specific data
client.players.getResults(id);
client.players.getStats(id);
```

### Tournaments

```typescript
// List and search
client.tournaments.list({ page: 1, limit: 20 });
client.tournaments.search({ name: 'Championship', location: 'Chicago' });
client.tournaments.recent({ limit: 10 });
client.tournaments.majors({ limit: 10 });

// CRUD operations
client.tournaments.get(id);
client.tournaments.create({ name: 'Regional Open', date: '2024-06-15', ... });
client.tournaments.update(id, { name: 'Updated Name' });
client.tournaments.delete(id);

// Tournament-specific data
client.tournaments.getResults(id);
client.tournaments.getStats(id);
```

### Results

```typescript
// List with filtering
client.results.list({ playerId: 'player-id', page: 1, limit: 20 });

// CRUD operations
client.results.get(id);
client.results.create({ playerId: 'player-id', tournamentId: 'tournament-id', position: 1 });
client.results.update(id, { position: 2 });
client.results.delete(id);

// Batch operations
client.results.createBatch([
  { playerId: 'player-1', tournamentId: 'tournament-id', position: 1 },
  { playerId: 'player-2', tournamentId: 'tournament-id', position: 2 },
]);

// Recalculate time decay for all results
client.results.recalculateDecay();
```

### Stats

```typescript
// System-wide statistics
client.stats.overview();

// Player leaderboard
client.stats.leaderboard({ limit: 100 });
```

### Import

```typescript
// Import tournament from Matchplay
client.import.matchplayTournament(matchplayId, { includeResults: true });
```

### Authentication

```typescript
// Register new user (cookie mode)
await client.register({ email: 'user@example.com', password: 'password', name: 'User' });

// Login
await client.login({ email: 'user@example.com', password: 'password' });

// Get current user
const user = await client.getMe();

// Check authentication status (token mode only)
const isAuth = client.isAuthenticated();

// Logout
await client.logout();
```

## Error Handling

The client provides specific error classes for different failure scenarios:

```typescript
import {
  OpprsApiError,
  OpprsAuthError,
  OpprsForbiddenError,
  OpprsNotFoundError,
  OpprsValidationError,
  OpprsConflictError,
  OpprsNetworkError,
  OpprsTimeoutError,
  OpprsExternalServiceError,
} from '@opprs/rest-api-client';

try {
  await client.players.get('invalid-id');
} catch (error) {
  if (error instanceof OpprsNotFoundError) {
    console.log('Player not found');
  } else if (error instanceof OpprsAuthError) {
    console.log('Authentication required');
  } else if (error instanceof OpprsValidationError) {
    console.log('Validation failed:', error.details);
  } else if (error instanceof OpprsNetworkError) {
    console.log('Network error - check connection');
  }
}
```

| Error Class | HTTP Status | Description |
|-------------|-------------|-------------|
| `OpprsValidationError` | 400 | Invalid request data |
| `OpprsAuthError` | 401 | Authentication required or failed |
| `OpprsForbiddenError` | 403 | Insufficient permissions |
| `OpprsNotFoundError` | 404 | Resource not found |
| `OpprsConflictError` | 409 | Resource conflict (e.g., duplicate) |
| `OpprsExternalServiceError` | 502 | External service failure |
| `OpprsNetworkError` | - | Network connectivity issue |
| `OpprsTimeoutError` | - | Request timeout |

## Types

All request and response types are exported:

```typescript
import type {
  Player,
  Tournament,
  Result,
  PlayerStats,
  TournamentStats,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  TokenPair,
  OpprsClientOptions,
} from '@opprs/rest-api-client';
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Run tests
pnpm run test

# Type check
pnpm run typecheck

# Lint
pnpm run lint

# Format
pnpm run format
```

## License

MIT
