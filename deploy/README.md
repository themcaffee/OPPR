# OPPR Deployment Guide

This guide covers deploying OPPR (Open Pinball Player Ranking System) on a VPS using Docker Compose and Caddy.

## Architecture

```
Internet
    |
[Caddy :80/:443] ─── Automatic HTTPS via Let's Encrypt
    |
    ├── /api/*, /docs, /health ──► [rest-api:3000]
    │                                    |
    │                              [postgres:5432]
    │
    └── /* ──────────────────────► [frontend-next:3000]

All services on: oppr-network (internal Docker bridge)
```

## Prerequisites

- VPS with Docker and Docker Compose installed
- Domain name pointing to your VPS IP (A record)
- Ports 80 and 443 open in firewall

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/themcaffee/OPPR.git
cd OPPR
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with production values:

```bash
# Required: Your domain
DOMAIN=oppr.example.com

# Required: Secure secrets (generate with: openssl rand -base64 32)
POSTGRES_PASSWORD=<secure-password>
JWT_SECRET=<secure-secret>
JWT_REFRESH_SECRET=<secure-secret>

# Production settings
NODE_ENV=production
NEXT_PUBLIC_API_URL=
```

### 3. Deploy

```bash
# Production deployment (excludes override file)
docker compose -f docker-compose.yml up -d
```

### 4. Verify

```bash
# Check all services are running
docker compose ps

# View Caddy logs (certificate provisioning)
docker compose logs -f caddy

# View API logs
docker compose logs -f rest-api
```

## DNS Configuration

Create an A record pointing your domain to your VPS IP:

| Type | Name | Value |
|------|------|-------|
| A | oppr.example.com | YOUR_VPS_IP |

Caddy will automatically provision and renew Let's Encrypt certificates.

## Commands

### Start services

```bash
# Production (with Caddy)
docker compose -f docker-compose.yml up -d

# Development (direct port access, no Caddy)
docker compose up -d
```

### Stop services

```bash
docker compose down
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f rest-api
docker compose logs -f frontend-next
docker compose logs -f caddy
```

### Seed database

```bash
docker compose --profile seed up seed
```

### Update deployment

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.yml up -d --build
```

### Zero-downtime update (individual services)

```bash
docker compose -f docker-compose.yml up -d --build --no-deps frontend-next
docker compose -f docker-compose.yml up -d --build --no-deps rest-api
```

## Local Development

For local development, the override file is automatically loaded:

```bash
docker compose up -d

# Access points:
# Frontend: http://localhost:3001
# API: http://localhost:3000
# API Docs: http://localhost:3000/docs
# PostgreSQL: localhost:5432
```

## Troubleshooting

### Caddy certificate issues

```bash
# Check Caddy logs
docker compose logs caddy

# Restart Caddy to retry certificate provisioning
docker compose restart caddy
```

**Rate limits**: Let's Encrypt has rate limits. For testing, use staging certificates by adding to Caddyfile:

```caddyfile
{
    acme_ca https://acme-staging-v02.api.letsencrypt.org/directory
}
```

### Database connection issues

```bash
# Check PostgreSQL is healthy
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Connect directly
docker compose exec postgres psql -U oppr -d oppr_db
```

### Container not starting

```bash
# Check container status
docker compose ps -a

# View container logs
docker compose logs <service-name>

# Rebuild from scratch
docker compose down -v
docker compose -f docker-compose.yml up -d --build
```

## Security Checklist

- [ ] Strong `POSTGRES_PASSWORD` (use `openssl rand -base64 32`)
- [ ] Strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Domain configured with valid DNS
- [ ] Firewall allows only ports 80, 443, and SSH
- [ ] Regular backups of `postgres_data` volume

## Backup & Restore

### Backup database

```bash
docker compose exec postgres pg_dump -U oppr oppr_db > backup.sql
```

### Restore database

```bash
cat backup.sql | docker compose exec -T postgres psql -U oppr oppr_db
```

### Backup volumes

```bash
docker run --rm -v oppr_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```
