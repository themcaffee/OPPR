# Frontend (Next.js)

The web interface for OPPRS, built with [Next.js 15](https://nextjs.org/) and React 19. Provides a modern, responsive UI for player registration, tournament management, and rankings display.

## Features

- **Player Registration** - Sign up and manage player profiles
- **Authentication** - Secure JWT-based login with refresh tokens
- **Tournament Browsing** - View upcoming and past tournaments
- **Leaderboards** - Real-time rankings and rating displays
- **Player Profiles** - Detailed stats, tournament history, and performance metrics
- **Responsive Design** - Mobile-first UI built with Tailwind CSS 4
- **Form Validation** - Client-side validation with Zod schemas
- **Type Safety** - Full TypeScript support throughout

## Prerequisites

- Node.js 22+
- pnpm 9+
- REST API running (see [REST API docs](/rest-api))

## Development Setup

### 1. Install Dependencies

From the repository root:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` in `apps/frontend-next/`:

```bash
# REST API endpoint
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Analytics, etc.
```

### 3. Start Development Server

```bash
pnpm --filter frontend-next dev
```

The app will be available at `http://localhost:3001`.

### Scripts

| Script      | Description                    |
| ----------- | ------------------------------ |
| `dev`       | Start development server       |
| `build`     | Build for production           |
| `start`     | Start production server        |
| `lint`      | Run ESLint                     |
| `typecheck` | Type check with TypeScript     |

Run scripts with:

```bash
pnpm --filter frontend-next <script>
```

## User Interface

### Pages

**Authentication**
- `/sign-in` - Player login with email/password
- `/register` - New player registration

**Public Pages**
- `/` - Homepage with system overview
- `/leaderboard` - Top players by ranking or rating
- `/tournaments` - Browse tournaments
- `/players` - Search players

**Player Dashboard** (authenticated)
- `/dashboard` - Personal stats and recent tournaments
- `/profile` - Edit profile information
- `/tournaments/new` - Create a tournament (admin)

### Components

**UI Components** (`components/ui/`)
- `Button` - Primary/secondary action buttons
- `Card` - Content containers
- `Input` - Form input fields
- `FormField` - Form field with label and error display

**Feature Components** (`components/auth/`)
- `SignInForm` - Login form with validation
- `RegisterForm` - Registration form with validation

**Layout Components**
- Root layout with navigation
- Auth layout (centered card)

## Architecture

### App Router Structure

```
app/
├── layout.tsx              # Root layout with global nav
├── page.tsx                # Homepage
├── (auth)/                 # Auth route group
│   ├── layout.tsx          # Centered card layout
│   ├── sign-in/page.tsx    # Sign-in page
│   └── register/page.tsx   # Registration page
├── dashboard/              # Protected routes
├── leaderboard/            # Public leaderboard
└── tournaments/            # Tournament pages
```

### API Integration

The frontend uses the REST API client (if available) or fetch directly:

```typescript
// Example API call
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/players`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const players = await response.json();
```

### Form Validation

Forms use `react-hook-form` with Zod schemas:

```typescript
// lib/validations/auth.ts
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
```

## Tech Stack

| Technology       | Purpose                        |
| ---------------- | ------------------------------ |
| Next.js 15       | React framework with App Router |
| React 19         | UI library                     |
| Tailwind CSS 4   | Utility-first styling          |
| Zod              | Schema validation              |
| react-hook-form  | Form state management          |
| TypeScript       | Type safety                    |

## Project Structure

```
apps/frontend-next/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page (/)
│   ├── globals.css         # Global styles (Tailwind)
│   └── (auth)/             # Auth route group
│       ├── layout.tsx      # Auth layout (centered card)
│       ├── sign-in/        # Sign-in page
│       └── register/       # Registration page
├── components/             # React components
│   ├── ui/                 # Generic UI (Button, Card, Input, FormField)
│   └── auth/               # Auth components (SignInForm, RegisterForm)
├── lib/                    # Utilities
│   └── validations/        # Zod schemas for form validation
├── Dockerfile              # Multi-stage Docker build
├── next.config.ts          # Next.js configuration
└── package.json
```

## State Management

The frontend uses React's built-in state management:

- **useState/useReducer** - Local component state
- **Context API** - Authentication state, user session
- **Server Components** - Data fetching with Next.js 15 App Router
- **Client Components** - Interactive forms and dynamic UI

### Authentication Flow

```typescript
// Example auth context usage
import { useAuth } from '@/contexts/AuthContext';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    redirect('/sign-in');
  }

  return <div>Welcome, {user.name}!</div>;
}
```

## Styling

The app uses **Tailwind CSS 4** for styling:

- Utility-first approach for rapid development
- Custom theme configuration in `tailwind.config.ts`
- Responsive design with mobile-first breakpoints
- Dark mode support (if enabled)

Example component:

```tsx
export function Button({ children, variant = 'primary' }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      )}
    >
      {children}
    </button>
  );
}
```

## Docker Deployment

The frontend includes a multi-stage Dockerfile optimized for production deployment.

### Building the Image

From the repository root:

```bash
docker build -f apps/frontend-next/Dockerfile -t opprs-frontend .
```

The build:
1. Uses Node.js 22 Alpine as the base
2. Installs monorepo dependencies with pnpm
3. Builds `@opprs/core` and the frontend using Turbo
4. Creates a minimal production image with Next.js standalone output

### Running the Container

```bash
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3000 \
  opprs-frontend
```

The app will be available at `http://localhost:3001`.

### Docker Compose

Run the entire stack including frontend, API, and database:

```bash
docker compose up
```

### Environment Variables

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `PORT` | Port the server listens on | `3000` |
| `HOSTNAME` | Hostname to bind to | `0.0.0.0` |
| `NEXT_PUBLIC_API_URL` | REST API base URL | Required |

## Development

### Testing

```bash
# Run tests (when available)
pnpm --filter frontend-next test

# Type checking
pnpm --filter frontend-next typecheck
```

### Code Quality

```bash
# Lint
pnpm --filter frontend-next lint

# Format with Prettier
pnpm --filter frontend-next format
```

## Customization

### Adding New Pages

Create a new route in the `app/` directory:

```tsx
// app/players/page.tsx
export default async function PlayersPage() {
  const players = await fetchPlayers();

  return (
    <div>
      <h1>Players</h1>
      {players.map(player => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
```

### Adding UI Components

Create reusable components in `components/ui/`:

```tsx
// components/ui/badge.tsx
export function Badge({ children, variant = 'default' }) {
  return (
    <span className={cn('px-2 py-1 rounded text-sm', variants[variant])}>
      {children}
    </span>
  );
}
```

## What's Next?

- Explore the [REST API](/rest-api) to understand backend integration
- Review [Database Schema](/db-prisma) for data models
- Check out the [demo app](https://themcaffee.github.io/OPPR/demo/) for interactive examples
