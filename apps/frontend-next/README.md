# Frontend (Next.js)

The web interface for OPPRS (Open Pinball Player Ranking System), built with Next.js 15 and React 19.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Zod** - Schema validation
- **react-hook-form** - Form state management

## Development

### Prerequisites

- Node.js 22+
- pnpm 9+

### Setup

From the repository root:

```bash
pnpm install
```

### Running Locally

```bash
pnpm --filter frontend-next dev
```

The app will be available at `http://localhost:3000`.

### Scripts

| Script      | Description                    |
| ----------- | ------------------------------ |
| `dev`       | Start development server       |
| `build`     | Build for production           |
| `start`     | Start production server        |
| `lint`      | Run ESLint                     |
| `typecheck` | Type check with TypeScript     |

## Docker

### Building the Image

From the repository root:

```bash
docker build -f apps/frontend-next/Dockerfile -t opprs-frontend .
```

### Running the Container

```bash
docker run -p 3000:3000 opprs-frontend
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
apps/frontend-next/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── (auth)/             # Auth route group
│       ├── sign-in/        # Sign-in page
│       └── register/       # Registration page
├── components/             # React components
│   ├── ui/                 # Generic UI components
│   └── auth/               # Auth-specific components
├── lib/                    # Utilities
│   └── validations/        # Zod schemas
├── Dockerfile              # Multi-stage Docker build
├── next.config.ts          # Next.js configuration
└── package.json
```
