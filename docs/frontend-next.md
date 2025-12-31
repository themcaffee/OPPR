# Frontend (Next.js)

The `frontend-next` application is the web interface for OPPRS, built with [Next.js 15](https://nextjs.org/) and React 19.

## Prerequisites

- Node.js 22+
- pnpm 9+

## Development Setup

### 1. Install Dependencies

From the repository root:

```bash
pnpm install
```

### 2. Start Development Server

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

Run scripts with:

```bash
pnpm --filter frontend-next <script>
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

## Docker

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
docker run -p 3000:3000 opprs-frontend
```

The app will be available at `http://localhost:3000`.

### Docker Compose

You can also run the frontend using Docker Compose from the repository root:

```bash
docker compose up frontend
```

### Configuration

| Environment Variable | Description                     | Default |
| -------------------- | ------------------------------- | ------- |
| `PORT`               | Port the server listens on      | `3000`  |
| `HOSTNAME`           | Hostname to bind to             | `0.0.0.0` |
