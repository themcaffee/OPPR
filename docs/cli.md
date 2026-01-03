# CLI

The OPPRS CLI provides a command-line interface for interacting with the OPPRS REST API. Manage players, tournaments, results, and rankings directly from your terminal.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Running OPPRS REST API server

### Installation

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Build the CLI
pnpm --filter @opprs/cli run build
```

### Running the CLI

```bash
# Development (with auto-reload)
pnpm --filter @opprs/cli run dev -- [command]

# Production
pnpm --filter @opprs/cli run start -- [command]
```

## Quick Start

```bash
# 1. Register an account
opprs register

# 2. Login
opprs login

# 3. View your profile
opprs whoami

# 4. List players
opprs players list

# 5. Search for tournaments
opprs tournaments search "pinball"

# 6. Get system statistics
opprs stats overview
```

## Configuration

Configuration is stored in `~/.opprs/config.json` with secure permissions (mode 0600).

```json
{
  "apiUrl": "http://localhost:3000/api/v1",
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 3600
  },
  "userEmail": "user@example.com"
}
```

## Global Options

These options can be used with any command:

| Option | Description | Default |
|--------|-------------|---------|
| `--api-url <url>` | API base URL | `http://localhost:3000/api/v1` |
| `--json` | Output as JSON instead of table format | `false` |
| `--no-color` | Disable colored output | `false` |

## Commands

### Authentication

| Command | Description |
|---------|-------------|
| `opprs login` | Authenticate with the OPPRS API |
| `opprs logout` | Clear stored credentials |
| `opprs whoami` | Show current authenticated user |
| `opprs register` | Create a new account |

#### Login

```bash
# Interactive login
opprs login

# With credentials
opprs login -e user@example.com -p password
```

| Option | Description |
|--------|-------------|
| `-e, --email <email>` | Email address |
| `-p, --password <password>` | Password (interactive prompt recommended) |

#### Register

```bash
opprs register
opprs register -e user@example.com -n "John Doe" -p password
```

| Option | Description |
|--------|-------------|
| `-e, --email <email>` | Email address |
| `-n, --name <name>` | Display name |
| `-p, --password <password>` | Password (interactive prompt recommended) |

### Players

| Command | Description |
|---------|-------------|
| `opprs players list` | List players with pagination |
| `opprs players get <id>` | Get player by ID |
| `opprs players search <query>` | Search players by name or email |
| `opprs players create` | Create a new player |
| `opprs players update <id>` | Update an existing player |
| `opprs players delete <id>` | Delete a player |
| `opprs players results <id>` | Get tournament results for a player |
| `opprs players stats <id>` | Get statistics for a player |
| `opprs players top-rating` | Get top players by rating |
| `opprs players top-ranking` | Get top players by ranking |

#### List Players

```bash
opprs players list
opprs players list --page 2 --limit 50
opprs players list --sort-by rating --sort-order desc --rated
```

| Option | Description | Default |
|--------|-------------|---------|
| `--page <number>` | Page number | `1` |
| `--limit <number>` | Items per page | `20` |
| `--sort-by <field>` | Sort by: `rating`, `ranking`, `name`, `eventCount`, `createdAt` | - |
| `--sort-order <order>` | Sort order: `asc`, `desc` | - |
| `--rated` | Only show rated players | `false` |

#### Create Player

```bash
opprs players create --name "John Doe"
opprs players create --name "John Doe" --email john@example.com --external-id IFPA123
```

| Option | Description |
|--------|-------------|
| `--name <name>` | Player name (required) |
| `--email <email>` | Player email |
| `--external-id <id>` | External ID (e.g., IFPA ID) |
| `--rating <rating>` | Initial rating |

#### Update Player

```bash
opprs players update abc123 --name "Jane Doe"
opprs players update abc123 --rating 1600 --ranking 50
```

### Tournaments

| Command | Description |
|---------|-------------|
| `opprs tournaments list` | List tournaments with pagination |
| `opprs tournaments get <id>` | Get tournament by ID |
| `opprs tournaments search <query>` | Search tournaments by name or location |
| `opprs tournaments create` | Create a new tournament |
| `opprs tournaments update <id>` | Update an existing tournament |
| `opprs tournaments delete <id>` | Delete a tournament |
| `opprs tournaments results <id>` | Get results/standings for a tournament |
| `opprs tournaments stats <id>` | Get statistics for a tournament |
| `opprs tournaments recent` | Get recent tournaments |
| `opprs tournaments majors` | Get major tournaments |

#### List Tournaments

```bash
opprs tournaments list
opprs tournaments list --page 2 --limit 50
opprs tournaments list --sort-by date --sort-order desc
opprs tournaments list --event-booster MAJOR
```

| Option | Description | Default |
|--------|-------------|---------|
| `--page <number>` | Page number | `1` |
| `--limit <number>` | Items per page | `20` |
| `--sort-by <field>` | Sort by: `date`, `name`, `firstPlaceValue`, `createdAt` | - |
| `--sort-order <order>` | Sort order: `asc`, `desc` | - |
| `--event-booster <type>` | Filter by booster type | - |

#### Create Tournament

```bash
opprs tournaments create --name "Weekly Tournament" --date 2024-01-15
opprs tournaments create --name "State Championship" --date 2024-06-01 \
  --location "Seattle, WA" --event-booster CHAMPIONSHIP_SERIES
```

| Option | Description |
|--------|-------------|
| `--name <name>` | Tournament name (required) |
| `--date <date>` | Tournament date in ISO format (required) |
| `--location <location>` | Tournament location |
| `--event-booster <type>` | `NONE`, `CERTIFIED`, `CERTIFIED_PLUS`, `CHAMPIONSHIP_SERIES`, `MAJOR` |
| `--external-id <id>` | External ID |

### Results

| Command | Description |
|---------|-------------|
| `opprs results list` | List results with pagination |
| `opprs results get <id>` | Get result by ID |
| `opprs results create` | Create a new result |
| `opprs results batch-create` | Create multiple results from stdin |
| `opprs results update <id>` | Update an existing result |
| `opprs results delete <id>` | Delete a result |
| `opprs results recalculate-decay` | Recalculate time decay for all results |

#### List Results

```bash
opprs results list
opprs results list --player-id abc123
opprs results list --tournament-id xyz789
opprs results list --sort-by position --sort-order asc
```

| Option | Description | Default |
|--------|-------------|---------|
| `--page <number>` | Page number | `1` |
| `--limit <number>` | Items per page | `20` |
| `--player-id <id>` | Filter by player ID | - |
| `--tournament-id <id>` | Filter by tournament ID | - |
| `--sort-by <field>` | Sort by: `position`, `totalPoints`, `decayedPoints`, `createdAt` | - |
| `--sort-order <order>` | Sort order: `asc`, `desc` | - |

#### Create Result

```bash
opprs results create --player-id abc123 --tournament-id xyz789 --position 1
opprs results create --player-id abc123 --tournament-id xyz789 --position 5 --opted-out
```

| Option | Description |
|--------|-------------|
| `--player-id <id>` | Player ID (required) |
| `--tournament-id <id>` | Tournament ID (required) |
| `--position <number>` | Position/placement (required) |
| `--opted-out` | Player opted out flag |

#### Batch Create Results

```bash
echo '[{"playerId":"abc","tournamentId":"xyz","position":1}]' | opprs results batch-create
cat results.json | opprs results batch-create
```

### Stats

| Command | Description |
|---------|-------------|
| `opprs stats overview` | Get system-wide statistics |
| `opprs stats leaderboard` | Get player leaderboard |

#### Leaderboard

```bash
opprs stats leaderboard
opprs stats leaderboard --limit 25 --type rating
```

| Option | Description | Default |
|--------|-------------|---------|
| `--limit <number>` | Number of players | `10` |
| `--type <type>` | Leaderboard type: `ranking`, `rating` | `ranking` |

### Import

| Command | Description |
|---------|-------------|
| `opprs import matchplay <tournamentId>` | Import tournament from Matchplay |

#### Import from Matchplay

```bash
opprs import matchplay 12345
opprs import matchplay 12345 --event-booster CERTIFIED
opprs import matchplay 12345 --api-token YOUR_TOKEN
```

| Option | Description |
|--------|-------------|
| `--event-booster <type>` | `NONE`, `CERTIFIED`, `CERTIFIED_PLUS`, `CHAMPIONSHIP_SERIES`, `MAJOR` |
| `--api-token <token>` | Matchplay API token for private tournaments |

### Users (Admin Only)

::: warning
These commands require admin privileges.
:::

| Command | Description |
|---------|-------------|
| `opprs users list` | List users with pagination |
| `opprs users get <id>` | Get user by ID |
| `opprs users update <id>` | Update user role |
| `opprs users delete <id>` | Delete a user |

#### Update User Role

```bash
opprs users update abc123 --role ADMIN
```

| Option | Description |
|--------|-------------|
| `--role <role>` | User role: `USER`, `ADMIN` (required) |

## Output Formats

### Table Output (Default)

Commands display data in formatted tables:

```
┌─────────────┬──────────┬────────┐
│ Name        │ Rating   │ Rank   │
├─────────────┼──────────┼────────┤
│ John Doe    │ 1650     │ 1      │
│ Jane Smith  │ 1580     │ 2      │
└─────────────┴──────────┴────────┘
```

### JSON Output

Use `--json` for machine-readable output:

```bash
opprs players list --json
opprs players get abc123 --json | jq '.rating'
```

## Example Workflows

### Register and View Rankings

```bash
# Create an account
opprs register -e player@example.com -n "John Doe"

# Login
opprs login -e player@example.com

# View top players
opprs stats leaderboard --limit 20

# Search for your profile
opprs players search "John Doe"
```

### Import Tournament from Matchplay

```bash
# Import a public tournament
opprs import matchplay 12345

# Import with event booster
opprs import matchplay 12345 --event-booster MAJOR

# Import private tournament with API token
opprs import matchplay 12345 --api-token mp_abc123
```

### Scripting with JSON Output

```bash
# Get player IDs for scripting
opprs players list --json | jq '.[].id'

# Export tournament results
opprs tournaments results abc123 --json > results.json

# Pipe results to another command
opprs stats overview --json | jq '.totalPlayers'
```

## Error Handling

The CLI provides clear error messages for common issues:

- **Authentication errors**: Invalid credentials or expired tokens
- **Permission errors**: Insufficient permissions for the operation
- **Not found errors**: Resource does not exist
- **Validation errors**: Invalid input parameters
- **Network errors**: Connection issues with the API

## Development

### Testing

```bash
pnpm --filter @opprs/cli run test
pnpm --filter @opprs/cli run test:watch
pnpm --filter @opprs/cli run test:coverage
```

### Code Quality

```bash
pnpm --filter @opprs/cli run lint
pnpm --filter @opprs/cli run lint:fix
pnpm --filter @opprs/cli run typecheck
```

### Project Structure

```
apps/cli/
├── src/
│   ├── commands/         # Command implementations
│   │   ├── auth.ts       # Login, register, logout, whoami
│   │   ├── players.ts    # Player CRUD and queries
│   │   ├── tournaments.ts # Tournament management
│   │   ├── results.ts    # Result management
│   │   ├── stats.ts      # Statistics endpoints
│   │   ├── import.ts     # External imports
│   │   └── users.ts      # User management (admin)
│   ├── config/           # Configuration and storage
│   ├── utils/            # Output formatting and errors
│   ├── client.ts         # API client initialization
│   └── index.ts          # CLI entry point
├── tests/                # Unit tests
└── package.json
```

For more details, see the [CLI README](https://github.com/themcaffee/OPPR/tree/main/apps/cli).
