# @opprs/cli

Command-line interface for OPPRS (Open Pinball Player Ranking System). Provides full access to the OPPRS REST API for managing players, tournaments, results, and rankings.

## Installation

### From Source (Development)

```bash
# Clone the repository
git clone https://github.com/your-org/OPPR.git
cd OPPR

# Install dependencies
pnpm install

# Build the CLI
pnpm --filter @opprs/cli run build

# Run the CLI
pnpm --filter @opprs/cli run start -- --help
```

### Development Mode

```bash
# Run with auto-reload
pnpm --filter @opprs/cli run dev -- [command]
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

# 5. Search for a tournament
opprs tournaments search "pinball"

# 6. Get system statistics
opprs stats overview
```

## Configuration

### Config File

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

### Global Options

These options can be used with any command:

| Option | Description | Default |
|--------|-------------|---------|
| `--api-url <url>` | API base URL | `http://localhost:3000/api/v1` |
| `--json` | Output as JSON instead of table format | `false` |
| `--no-color` | Disable colored output | `false` |

## Commands

### Authentication

#### `opprs login`

Authenticate with the OPPRS API.

```bash
opprs login
opprs login -e user@example.com -p password
```

| Option | Description |
|--------|-------------|
| `-e, --email <email>` | Email address |
| `-p, --password <password>` | Password (interactive prompt recommended) |

#### `opprs logout`

Clear stored credentials.

```bash
opprs logout
```

#### `opprs whoami`

Show current authenticated user.

```bash
opprs whoami
```

#### `opprs register`

Create a new account.

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

#### `opprs players list`

List players with pagination.

```bash
opprs players list
opprs players list --page 2 --limit 50
opprs players list --sort-by rating --sort-order desc --rated
```

| Option | Description | Default |
|--------|-------------|---------|
| `--page <number>` | Page number | `1` |
| `--limit <number>` | Items per page | `20` |
| `--sort-by <field>` | Sort field: `rating`, `ranking`, `name`, `eventCount`, `createdAt` | - |
| `--sort-order <order>` | Sort order: `asc`, `desc` | - |
| `--rated` | Only show rated players | `false` |

#### `opprs players get <id>`

Get player by ID.

```bash
opprs players get abc123
```

#### `opprs players search <query>`

Search players by name or email.

```bash
opprs players search "john"
opprs players search "john" --limit 5
```

| Option | Description | Default |
|--------|-------------|---------|
| `--limit <number>` | Maximum results | `10` |

#### `opprs players create`

Create a new player.

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

#### `opprs players update <id>`

Update an existing player.

```bash
opprs players update abc123 --name "Jane Doe"
opprs players update abc123 --rating 1600 --ranking 50
```

| Option | Description |
|--------|-------------|
| `--name <name>` | Player name |
| `--email <email>` | Player email |
| `--rating <rating>` | Rating value |
| `--ranking <ranking>` | Ranking position |

#### `opprs players delete <id>`

Delete a player.

```bash
opprs players delete abc123
```

#### `opprs players results <id>`

Get tournament results for a player.

```bash
opprs players results abc123
```

#### `opprs players stats <id>`

Get statistics for a player.

```bash
opprs players stats abc123
```

#### `opprs players top-rating`

Get top players by rating.

```bash
opprs players top-rating
opprs players top-rating --limit 25
```

| Option | Description | Default |
|--------|-------------|---------|
| `--limit <number>` | Number of players | `10` |

#### `opprs players top-ranking`

Get top players by ranking.

```bash
opprs players top-ranking
opprs players top-ranking --limit 25
```

| Option | Description | Default |
|--------|-------------|---------|
| `--limit <number>` | Number of players | `10` |

### Tournaments

#### `opprs tournaments list`

List tournaments with pagination.

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
| `--sort-by <field>` | Sort field: `date`, `name`, `firstPlaceValue`, `createdAt` | - |
| `--sort-order <order>` | Sort order: `asc`, `desc` | - |
| `--event-booster <type>` | Filter by booster type | - |

#### `opprs tournaments get <id>`

Get tournament by ID.

```bash
opprs tournaments get abc123
```

#### `opprs tournaments search <query>`

Search tournaments by name or location.

```bash
opprs tournaments search "state championship"
opprs tournaments search "seattle" --limit 5
```

| Option | Description | Default |
|--------|-------------|---------|
| `--limit <number>` | Maximum results | `10` |

#### `opprs tournaments create`

Create a new tournament.

```bash
opprs tournaments create --name "Weekly Tournament" --date 2024-01-15
opprs tournaments create --name "State Championship" --date 2024-06-01 --location "Seattle, WA" --event-booster CHAMPIONSHIP_SERIES
```

| Option | Description |
|--------|-------------|
| `--name <name>` | Tournament name (required) |
| `--date <date>` | Tournament date in ISO format (required) |
| `--location <location>` | Tournament location |
| `--event-booster <type>` | Booster type: `NONE`, `CERTIFIED`, `CERTIFIED_PLUS`, `CHAMPIONSHIP_SERIES`, `MAJOR` |
| `--external-id <id>` | External ID |

#### `opprs tournaments update <id>`

Update an existing tournament.

```bash
opprs tournaments update abc123 --name "Updated Name"
opprs tournaments update abc123 --event-booster MAJOR
```

| Option | Description |
|--------|-------------|
| `--name <name>` | Tournament name |
| `--date <date>` | Tournament date |
| `--location <location>` | Tournament location |
| `--event-booster <type>` | Booster type |
| `--external-id <id>` | External ID |

#### `opprs tournaments delete <id>`

Delete a tournament.

```bash
opprs tournaments delete abc123
```

#### `opprs tournaments results <id>`

Get results/standings for a tournament.

```bash
opprs tournaments results abc123
```

#### `opprs tournaments stats <id>`

Get statistics for a tournament.

```bash
opprs tournaments stats abc123
```

#### `opprs tournaments recent`

Get recent tournaments.

```bash
opprs tournaments recent
opprs tournaments recent --limit 20
```

| Option | Description | Default |
|--------|-------------|---------|
| `--limit <number>` | Number of tournaments | `10` |

#### `opprs tournaments majors`

Get major tournaments.

```bash
opprs tournaments majors
opprs tournaments majors --limit 5
```

| Option | Description | Default |
|--------|-------------|---------|
| `--limit <number>` | Number of tournaments | `10` |

### Results

#### `opprs results list`

List results with pagination.

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
| `--sort-by <field>` | Sort field: `position`, `totalPoints`, `decayedPoints`, `createdAt` | - |
| `--sort-order <order>` | Sort order: `asc`, `desc` | - |

#### `opprs results get <id>`

Get result by ID.

```bash
opprs results get abc123
```

#### `opprs results create`

Create a new result.

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

#### `opprs results batch-create`

Create multiple results from stdin. Reads a JSON array of result objects.

```bash
echo '[{"playerId":"abc","tournamentId":"xyz","position":1}]' | opprs results batch-create
cat results.json | opprs results batch-create
```

#### `opprs results update <id>`

Update an existing result.

```bash
opprs results update abc123 --position 2
opprs results update abc123 --opted-out
```

| Option | Description |
|--------|-------------|
| `--position <number>` | Position/placement |
| `--opted-out` | Player opted out flag |

#### `opprs results delete <id>`

Delete a result.

```bash
opprs results delete abc123
```

#### `opprs results recalculate-decay`

Recalculate time decay for all results.

```bash
opprs results recalculate-decay
```

### Stats

#### `opprs stats overview`

Get system-wide statistics.

```bash
opprs stats overview
opprs stats overview --json
```

#### `opprs stats leaderboard`

Get player leaderboard.

```bash
opprs stats leaderboard
opprs stats leaderboard --limit 25 --type rating
```

| Option | Description | Default |
|--------|-------------|---------|
| `--limit <number>` | Number of players | `10` |
| `--type <type>` | Leaderboard type: `ranking`, `rating` | `ranking` |

### Import

#### `opprs import matchplay <tournamentId>`

Import tournament data from Matchplay.

```bash
opprs import matchplay 12345
opprs import matchplay 12345 --event-booster CERTIFIED
opprs import matchplay 12345 --api-token YOUR_TOKEN
```

| Option | Description |
|--------|-------------|
| `--event-booster <type>` | Booster type: `NONE`, `CERTIFIED`, `CERTIFIED_PLUS`, `CHAMPIONSHIP_SERIES`, `MAJOR` |
| `--api-token <token>` | Matchplay API token for private tournaments |

### Users (Admin Only)

#### `opprs users list`

List users with pagination.

```bash
opprs users list
opprs users list --page 2 --limit 50
```

| Option | Description | Default |
|--------|-------------|---------|
| `--page <number>` | Page number | `1` |
| `--limit <number>` | Items per page | `20` |
| `--sort-by <field>` | Sort field: `email`, `role`, `createdAt` | - |
| `--sort-order <order>` | Sort order: `asc`, `desc` | - |

#### `opprs users get <id>`

Get user by ID.

```bash
opprs users get abc123
```

#### `opprs users update <id>`

Update user role.

```bash
opprs users update abc123 --role ADMIN
```

| Option | Description |
|--------|-------------|
| `--role <role>` | User role: `USER`, `ADMIN` (required) |

#### `opprs users delete <id>`

Delete a user.

```bash
opprs users delete abc123
```

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

## Error Handling

The CLI provides clear error messages for common issues:

- **Authentication errors**: Invalid credentials or expired tokens
- **Permission errors**: Insufficient permissions for the operation
- **Not found errors**: Resource does not exist
- **Validation errors**: Invalid input parameters
- **Network errors**: Connection issues with the API

## Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm

### Building

```bash
pnpm --filter @opprs/cli run build
```

### Testing

```bash
# Run tests
pnpm --filter @opprs/cli run test

# Watch mode
pnpm --filter @opprs/cli run test:watch

# Coverage
pnpm --filter @opprs/cli run test:coverage
```

### Linting

```bash
pnpm --filter @opprs/cli run lint
pnpm --filter @opprs/cli run lint:fix
```

### Type Checking

```bash
pnpm --filter @opprs/cli run typecheck
```
