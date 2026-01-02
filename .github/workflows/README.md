# GitHub Actions Workflows

This directory contains CI/CD workflows for the OPPR project.

## Workflows

### CI (`ci.yml`)
Runs on every push and pull request:
- Linting
- Type checking
- Unit tests
- Build verification

### Publish Docker Image (`docker-publish.yml`)
Publishes Docker images to GitHub Container Registry:
- **Canary builds**: On every push to `main` (tagged as `version-canary.sha`)
- **Stable builds**: On release creation (tagged as `version` and `latest`)

Images:
- `ghcr.io/[owner]/oppr-rest-api`
- `ghcr.io/[owner]/oppr-frontend`

### Deploy to Production (`deploy-production.yml`)
Deploys the application to production server:
- **Automatic**: After successful Docker image publish to `main`
- **Manual**: Via workflow dispatch with custom image tag

### Deploy to GitHub Pages (`deploy.yml`)
Deploys documentation and demo app to GitHub Pages:
- Runs on every push to `main`
- Deploys VitePress docs and demo app

## Setup for Production Deployment

To enable automated deployments to your VPS, configure the following secrets and variables:

### Required Secrets

Go to **Settings → Secrets and variables → Actions → New repository secret**:

#### `DEPLOY_SSH_KEY`
SSH private key for server access.

Generate a new SSH key pair:
```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
```

Add the public key to your server:
```bash
# Copy public key to server
ssh-copy-id -i deploy_key.pub root@your-server.com

# Or manually append to authorized_keys
cat deploy_key.pub | ssh root@your-server.com "cat >> ~/.ssh/authorized_keys"
```

Add the **private key** contents to the `DEPLOY_SSH_KEY` secret:
```bash
cat deploy_key
```

#### `DEPLOY_HOST`
The hostname or IP address of your production server.

Examples:
- `oppr.example.com`
- `123.45.67.89`
- If using Terraform: `$(terraform output -raw effective_ip)`

### Optional Variables

Go to **Settings → Secrets and variables → Actions → Variables tab → New repository variable**:

#### `APP_URL`
The public URL of your application (for health checks and deployment notifications).

Example: `https://oppr.example.com`

## Using the Workflows

### Automated Deployment (Recommended)

1. Push to `main` branch or create a release
2. Docker images are built and published automatically
3. After successful image publish, deployment to production starts automatically
4. Monitor deployment in the Actions tab

### Manual Deployment

Useful for rollbacks or deploying specific versions:

1. Go to **Actions → Deploy to Production → Run workflow**
2. Select branch: `main`
3. Enter image tag (e.g., `latest`, `v1.2.3`, `1.0.0-canary.abc123`)
4. Select environment: `production` or `staging`
5. Click **Run workflow**

### Finding Image Tags

To find available image tags:

1. Go to your repository's **Packages** section
2. Click on `oppr-rest-api` or `oppr-frontend`
3. View available tags under **Recent tagged image versions**

Or use Docker CLI:
```bash
# List tags using GitHub API
gh api /user/packages/container/oppr-rest-api/versions | jq '.[].metadata.container.tags'
```

## Environment Configuration

The workflows support multiple environments (e.g., `production`, `staging`).

To add a staging environment:

1. Create a staging server with Terraform:
   ```bash
   cd deploy/terraform
   terraform workspace new staging
   terraform apply -var="droplet_name=oppr-staging"
   ```

2. Add staging secrets/variables:
   - `DEPLOY_HOST` (environment-specific)
   - `DEPLOY_SSH_KEY` (can reuse or create separate)
   - `APP_URL` (environment-specific)

3. Deploy to staging:
   ```bash
   # Via workflow dispatch
   Actions → Deploy to Production → Run workflow → Select "staging"
   ```

## Rollback

If a deployment causes issues, rollback to a previous version:

1. Find the previous working image tag:
   - Check Packages section
   - Or use a specific version like `v1.2.0`

2. Run manual deployment with the old tag:
   ```bash
   Actions → Deploy to Production → Run workflow
   Tag: v1.2.0 (or specific canary version)
   ```

3. The deployment script will perform a rolling update to the old version

## Troubleshooting

### SSH Connection Failed

Check:
- `DEPLOY_HOST` secret is correct
- `DEPLOY_SSH_KEY` contains the full private key (including `-----BEGIN` and `-----END` lines)
- Server allows SSH access from GitHub Actions IPs
- SSH key is added to server's `~/.ssh/authorized_keys`

Test locally:
```bash
ssh -i deploy_key root@your-server.com
```

### Deployment Script Failed

Check deployment logs in Actions tab. Common issues:
- Docker images not found (wrong tag or not published yet)
- Docker Compose files missing on server (run `terraform apply` first)
- Services failed health checks (check server logs)

SSH to server and check:
```bash
ssh root@your-server.com
cd /opt/oppr
docker compose logs -f
```

### Health Check Failed

The health check failure doesn't stop deployment (it's a warning). Check:
- Is `APP_URL` variable set correctly?
- Does your REST API expose a `/health` endpoint?
- Is Caddy configured correctly?

## Security Best Practices

- ✅ Use separate SSH keys for deployment (not your personal key)
- ✅ Limit SSH key permissions to specific commands (optional)
- ✅ Use GitHub environment protection rules (require approvals for production)
- ✅ Store all secrets in GitHub Secrets (never commit them)
- ✅ Rotate SSH keys periodically
- ✅ Use separate environments for staging and production
