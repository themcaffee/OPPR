---
layout: home
hero:
  name: OPPRS
  text: Open Pinball Player Ranking System
  tagline: A complete ranking system with REST API, web interface, and calculation engine for competitive pinball
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/themcaffee/OPPR
features:
  - title: REST API
    details: Full-featured Fastify API with JWT authentication, player/tournament management, and OpenAPI documentation.
  - title: Web Interface
    details: Modern Next.js 15 application with React 19, Tailwind CSS, and responsive design.
  - title: Database Layer
    details: PostgreSQL persistence with Prisma ORM for players, tournaments, results, and ratings.
  - title: Calculation Engine
    details: TypeScript library implementing tournament scoring, TGP, TVA, Glicko ratings, and time decay.
---

## Quick Overview

OPPRS is a complete ranking system for competitive pinball tournaments:

- **REST API** - Fastify-based HTTP API with JWT auth, CRUD operations, leaderboards, and batch processing
- **Web Application** - Next.js frontend for player registration, tournament management, and rankings display
- **Database** - PostgreSQL with Prisma for persistent storage of players, tournaments, and results
- **Calculation Engine** - Core TypeScript library for tournament scoring, player ratings, and point distribution
- **OpenAPI Docs** - Interactive Swagger UI for API exploration and testing
- **Docker Ready** - Multi-stage Dockerfiles and docker-compose for easy deployment

## Getting Started

Run the full stack locally with Docker Compose:

```bash
docker compose up
```

Or install and run services individually:

```bash
pnpm install
pnpm --filter @opprs/db-prisma run db:generate
pnpm --filter rest-api dev    # API at http://localhost:3000
pnpm --filter frontend-next dev  # Frontend at http://localhost:3001
```

See the [Getting Started](/getting-started) guide for detailed setup instructions.
