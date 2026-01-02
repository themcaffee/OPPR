#!/bin/bash

# =============================================================================
# OPPR Database Migration Script
# =============================================================================
# This script runs Prisma migrations on the production database before deployment
# Usage: ./migrate.sh [--tag=<version>] [--host=<server>] [--key=<ssh-key>]
# =============================================================================

set -e  # Exit on error

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

DEPLOY_DIR="/opt/oppr"
IMAGE_TAG="${IMAGE_TAG:-latest}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
SSH_USER="${SSH_USER:-root}"
REMOTE_HOST="${REMOTE_HOST:-}"
REGISTRY="ghcr.io"
GITHUB_OWNER="${GITHUB_OWNER:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# Functions
# -----------------------------------------------------------------------------

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_usage() {
    cat << EOF
OPPR Database Migration Script

Usage: $0 [OPTIONS]

Options:
    --tag=<version>       Docker image tag to use (default: latest)
    --host=<server>       Remote server hostname/IP (required if REMOTE_HOST not set)
    --user=<username>     SSH username for remote connection (default: root)
    --key=<path>          Path to SSH private key (default: ~/.ssh/id_rsa)
    --owner=<github-user> GitHub owner for GHCR images (required if GITHUB_OWNER not set)
    --dry-run             Show what would be executed without running
    --help                Show this help message

Environment Variables:
    REMOTE_HOST           Remote server hostname/IP
    IMAGE_TAG             Docker image tag
    SSH_USER              SSH username for remote connection
    SSH_KEY               Path to SSH private key
    GITHUB_OWNER          GitHub owner for GHCR images

Examples:
    # Run migrations for latest version
    $0 --host=oppr.example.com --owner=themcaffee

    # Run migrations for specific version
    $0 --host=oppr.example.com --tag=v1.2.3 --owner=themcaffee

    # Use environment variables
    REMOTE_HOST=oppr.example.com IMAGE_TAG=v1.2.3 GITHUB_OWNER=themcaffee $0
EOF
}

remote_exec() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$REMOTE_HOST" "$@"
}

# -----------------------------------------------------------------------------
# Parse Arguments
# -----------------------------------------------------------------------------

DRY_RUN=false

for arg in "$@"; do
    case $arg in
        --tag=*)
            IMAGE_TAG="${arg#*=}"
            ;;
        --host=*)
            REMOTE_HOST="${arg#*=}"
            ;;
        --user=*)
            SSH_USER="${arg#*=}"
            ;;
        --key=*)
            SSH_KEY="${arg#*=}"
            ;;
        --owner=*)
            GITHUB_OWNER="${arg#*=}"
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
        --help|-h)
            print_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $arg"
            print_usage
            exit 1
            ;;
    esac
done

# -----------------------------------------------------------------------------
# Validation
# -----------------------------------------------------------------------------

if [ -z "$REMOTE_HOST" ]; then
    log_error "Remote host not specified. Use --host=<server> or set REMOTE_HOST environment variable."
    print_usage
    exit 1
fi

if [ -z "$GITHUB_OWNER" ]; then
    log_error "GitHub owner not specified. Use --owner=<github-user> or set GITHUB_OWNER environment variable."
    print_usage
    exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
    log_error "SSH key not found: $SSH_KEY"
    exit 1
fi

# -----------------------------------------------------------------------------
# Migration
# -----------------------------------------------------------------------------

IMAGE_NAME="$REGISTRY/$GITHUB_OWNER/oppr-rest-api:$IMAGE_TAG"

log_info "==================================================================="
log_info "OPPR Database Migration"
log_info "==================================================================="
log_info "Remote Host:  $REMOTE_HOST"
log_info "SSH User:     $SSH_USER"
log_info "Image:        $IMAGE_NAME"
log_info "SSH Key:      $SSH_KEY"
log_info "Deploy Dir:   $DEPLOY_DIR"
log_info "Dry Run:      $DRY_RUN"
log_info "==================================================================="

if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
    log_info "Would execute:"
    log_info "  1. Pull image: docker pull $IMAGE_NAME"
    log_info "  2. Run migrations: docker run --rm --env-file $DEPLOY_DIR/.env ..."
    exit 0
fi

# Test SSH connection
log_info "Testing SSH connection..."
if ! remote_exec "echo 'SSH connection successful'" > /dev/null 2>&1; then
    log_error "Failed to connect to $REMOTE_HOST"
    exit 1
fi
log_success "SSH connection established"

# Check if deployment directory exists
log_info "Checking deployment directory..."
if ! remote_exec "[ -d $DEPLOY_DIR ]"; then
    log_error "Deployment directory $DEPLOY_DIR does not exist on remote server"
    exit 1
fi

# Pull the new image first
log_info "Pulling Docker image: $IMAGE_NAME"
if ! remote_exec "docker pull $IMAGE_NAME"; then
    log_error "Failed to pull image: $IMAGE_NAME"
    exit 1
fi
log_success "Image pulled successfully"

# Determine the network name
NETWORK_NAME=$(remote_exec "docker network ls --filter name=oppr --format '{{.Name}}' | grep -E 'oppr.*network' | head -1" || true)
if [ -z "$NETWORK_NAME" ]; then
    log_warning "Could not find oppr network, using oppr_oppr-network as default"
    NETWORK_NAME="oppr_oppr-network"
fi
log_info "Using network: $NETWORK_NAME"

# Run migrations
log_info "Running database migrations..."
MIGRATION_START=$(date +%s)

# Construct DATABASE_URL from POSTGRES_PASSWORD (matches docker-compose.yml format)
# The .env file has POSTGRES_PASSWORD but not DATABASE_URL, so we construct it here
if remote_exec "docker run --rm \
    --env-file $DEPLOY_DIR/.env \
    -e DATABASE_URL=\"postgresql://oppr:\$(grep POSTGRES_PASSWORD $DEPLOY_DIR/.env | cut -d= -f2)@postgres:5432/oppr_db?schema=public\" \
    --network $NETWORK_NAME \
    $IMAGE_NAME \
    sh -c 'cd /app/packages/db-prisma && npx prisma migrate deploy'"; then

    MIGRATION_END=$(date +%s)
    MIGRATION_DURATION=$((MIGRATION_END - MIGRATION_START))

    log_success "==================================================================="
    log_success "Migrations completed successfully!"
    log_success "==================================================================="
    log_info "Duration: ${MIGRATION_DURATION}s"
    log_info "Image: $IMAGE_NAME"
else
    log_error "==================================================================="
    log_error "Migration FAILED!"
    log_error "==================================================================="
    log_error "The deployment will be aborted."
    log_error "Please investigate the migration error and fix before retrying."
    log_error ""
    log_error "To check migration status manually:"
    log_error "  ssh $SSH_USER@$REMOTE_HOST"
    log_error "  docker run --rm --env-file $DEPLOY_DIR/.env -e DATABASE_URL=\"postgresql://oppr:\$(grep POSTGRES_PASSWORD $DEPLOY_DIR/.env | cut -d= -f2)@postgres:5432/oppr_db?schema=public\" --network $NETWORK_NAME $IMAGE_NAME sh -c 'cd /app/packages/db-prisma && npx prisma migrate status'"
    exit 1
fi
