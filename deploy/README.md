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

---

## Terraform Deployment (Digital Ocean)

For automated infrastructure provisioning on Digital Ocean, use the Terraform configuration in `terraform/`.

**Architecture Overview**:
- **Terraform**: Provisions infrastructure only (droplet, firewall, SSH keys, config files)
- **Deployment Script**: Handles application deployments with zero downtime
- **GitHub Actions**: Automates the entire CI/CD pipeline

This separation ensures:
- ✅ No downtime when running `terraform apply`
- ✅ Infrastructure changes don't trigger app restarts
- ✅ App deployments don't require Terraform

### Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.0.0
- Digital Ocean account with API token
- SSH key pair

### Quick Start

```bash
cd deploy/terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars with your configuration
cat > terraform.tfvars <<EOF
do_token       = "dop_v1_your_token_here"
ssh_public_key = "ssh-rsa AAAA... your-key"
github_owner   = "your-github-username"

# Optional configurations
droplet_size   = "s-1vcpu-2gb"    # or s-2vcpu-2gb, s-2vcpu-4gb
droplet_region = "nyc1"           # or sfo3, lon1, ams3
domain         = "oppr.example.com"  # leave empty for IP-only access
EOF

# Preview changes
terraform plan

# Deploy infrastructure
terraform apply

# Perform initial deployment
cd ../scripts
./deploy.sh --host=$(cd ../terraform && terraform output -raw effective_ip)
```

**Note**: Terraform creates the infrastructure and copies configuration files, but does NOT deploy the application. Use the deployment script or GitHub Actions for application deployments.

### Configuration Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `do_token` | Yes | - | Digital Ocean API token |
| `ssh_public_key` | Yes | - | SSH public key for access |
| `github_owner` | Yes | - | GitHub username/org for GHCR images |
| `droplet_size` | No | `s-1vcpu-2gb` | Droplet size slug |
| `droplet_region` | No | `nyc1` | DO region |
| `domain` | No | `""` | Domain for HTTPS (empty = IP access) |
| `enable_reserved_ip` | No | `false` | Use static IP |
| `image_tag` | No | `latest` | Docker image tag |

### Droplet Size Reference

| Size Slug | vCPUs | RAM | Monthly Cost |
|-----------|-------|-----|--------------|
| `s-1vcpu-1gb` | 1 | 1GB | ~$6/mo |
| `s-1vcpu-2gb` | 1 | 2GB | ~$12/mo |
| `s-2vcpu-2gb` | 2 | 2GB | ~$18/mo |
| `s-2vcpu-4gb` | 2 | 4GB | ~$24/mo |

### Outputs

After deployment, Terraform outputs useful information:

```bash
# View all outputs
terraform output

# Get SSH command
terraform output ssh_command

# Get sensitive secrets (for backup)
terraform output -json postgres_password
```

### Updating Deployed Application

**Important**: Terraform only provisions infrastructure. Application deployments are handled separately.

#### Option 1: GitHub Actions (Recommended)

Automated deployments via CI/CD:

```bash
# Automatic: Push to main or create a release
git push origin main

# Manual: Use workflow dispatch in GitHub Actions
# Go to Actions → Deploy to Production → Run workflow
# Enter image tag (e.g., latest, v1.2.3)
```

See `.github/workflows/README.md` for setup instructions.

#### Option 2: Manual Deployment Script

Use the zero-downtime deployment script:

```bash
# Deploy from your local machine
cd deploy
./scripts/deploy.sh --host=$(cd terraform && terraform output -raw effective_ip)

# Deploy specific version
./scripts/deploy.sh --host=oppr.example.com --tag=v1.2.3

# Use environment variables
REMOTE_HOST=oppr.example.com IMAGE_TAG=latest ./scripts/deploy.sh
```

#### Option 3: Direct SSH

SSH to server and update manually:

```bash
ssh root@$(terraform output -raw effective_ip)
cd /opt/oppr

# Zero-downtime rolling update
docker compose pull
docker compose up -d --no-deps --build frontend-next
docker compose up -d --no-deps --build rest-api
docker compose restart caddy

# Or full restart (brief downtime)
docker compose up -d
```

## Zero-Downtime Deployment Script

The `deploy/scripts/deploy.sh` script performs rolling updates without downtime.

### Usage

```bash
cd deploy/scripts

# Deploy latest version
./deploy.sh --host=oppr.example.com

# Deploy specific version
./deploy.sh --host=oppr.example.com --tag=v1.2.3

# Using environment variables
REMOTE_HOST=oppr.example.com IMAGE_TAG=v1.2.3 ./deploy.sh

# Dry run (preview without deploying)
./deploy.sh --host=oppr.example.com --dry-run

# Show help
./deploy.sh --help
```

### How It Works

1. **Pulls new Docker images** from GitHub Container Registry
2. **Updates services individually** with `--no-deps` flag:
   - Frontend (stateless, zero downtime)
   - REST API (brief connection blips possible)
   - Caddy (minimal interruption)
3. **Health checks** after each service update
4. **Rollback support** by deploying previous image tag

### Rollback Example

```bash
# Something went wrong with v1.2.3, rollback to v1.2.2
./deploy.sh --host=oppr.example.com --tag=v1.2.2
```

## GitHub Actions CI/CD

Automated deployments are configured via GitHub Actions workflows.

### Setup

See `.github/workflows/README.md` for detailed setup instructions.

**Required GitHub Secrets**:
- `DEPLOY_SSH_KEY`: SSH private key for server access
- `DEPLOY_HOST`: Server hostname or IP

**Optional GitHub Variables**:
- `APP_URL`: Application URL (for health checks)

### Workflow Pipeline

1. **CI** (`ci.yml`): Runs tests, linting, type checking on every push
2. **Publish Docker** (`docker-publish.yml`): Builds and pushes images to GHCR
   - Canary builds on push to `main`: `version-canary.sha`
   - Stable builds on release: `version` + `latest`
3. **Deploy Production** (`deploy-production.yml`): Deploys to server
   - Automatic: After successful Docker publish
   - Manual: Via workflow dispatch

### Deployment Triggers

**Automatic**:
```bash
# Push to main → builds canary image → auto-deploys
git push origin main
```

**Manual**:
1. Go to **Actions → Deploy to Production → Run workflow**
2. Select image tag (e.g., `latest`, `v1.2.3`, `1.0.0-canary.abc123`)
3. Click **Run workflow**

**On Release**:
```bash
# Create release → builds stable image (latest + version) → auto-deploys
gh release create v1.2.3 --generate-notes
```

### Finding Image Tags

Check available image tags:
- Go to repository **Packages** section
- Or use GitHub CLI: `gh api /user/packages/container/oppr-rest-api/versions`

### Destroy Infrastructure

```bash
terraform destroy
```

### State Management

The Terraform state file (`terraform.tfstate`) contains sensitive information. For team environments, consider using remote state:

```hcl
# Add to versions.tf for Terraform Cloud
terraform {
  cloud {
    organization = "your-org"
    workspaces {
      name = "oppr-production"
    }
  }
}
```
