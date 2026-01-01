#!/bin/bash

# =============================================================================
# OPPR Zero-Downtime Deployment Script
# =============================================================================
# This script performs rolling updates of Docker services without downtime
# Usage: ./deploy.sh [--tag=<version>] [--host=<server>] [--key=<ssh-key>]
# =============================================================================

set -e  # Exit on error

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

DEPLOY_DIR="/opt/oppr"
IMAGE_TAG="${IMAGE_TAG:-latest}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
REMOTE_HOST="${REMOTE_HOST:-}"

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
OPPR Zero-Downtime Deployment Script

Usage: $0 [OPTIONS]

Options:
    --tag=<version>       Docker image tag to deploy (default: latest)
    --host=<server>       Remote server hostname/IP (required if REMOTE_HOST not set)
    --key=<path>          Path to SSH private key (default: ~/.ssh/id_rsa)
    --dry-run             Show what would be deployed without executing
    --help                Show this help message

Environment Variables:
    REMOTE_HOST           Remote server hostname/IP
    IMAGE_TAG             Docker image tag
    SSH_KEY               Path to SSH private key

Examples:
    # Deploy latest version
    $0 --host=oppr.example.com

    # Deploy specific version
    $0 --host=oppr.example.com --tag=v1.2.3

    # Use environment variables
    REMOTE_HOST=oppr.example.com IMAGE_TAG=v1.2.3 $0

    # Use with Terraform output
    $0 --host=\$(cd ../terraform && terraform output -raw effective_ip)
EOF
}

remote_exec() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@"$REMOTE_HOST" "$@"
}

check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1

    log_info "Checking health of $service..."

    while [ $attempt -le $max_attempts ]; do
        if remote_exec "docker compose -f $DEPLOY_DIR/docker-compose.yml ps $service | grep -q 'Up'"; then
            log_success "$service is healthy"
            return 0
        fi

        log_warning "Waiting for $service to be healthy (attempt $attempt/$max_attempts)..."
        sleep 2
        ((attempt++))
    done

    log_error "$service failed to become healthy"
    return 1
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
        --key=*)
            SSH_KEY="${arg#*=}"
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

if [ ! -f "$SSH_KEY" ]; then
    log_error "SSH key not found: $SSH_KEY"
    exit 1
fi

# -----------------------------------------------------------------------------
# Deployment
# -----------------------------------------------------------------------------

log_info "==================================================================="
log_info "OPPR Zero-Downtime Deployment"
log_info "==================================================================="
log_info "Remote Host: $REMOTE_HOST"
log_info "Image Tag:   $IMAGE_TAG"
log_info "SSH Key:     $SSH_KEY"
log_info "Deploy Dir:  $DEPLOY_DIR"
log_info "Dry Run:     $DRY_RUN"
log_info "==================================================================="

if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
    exit 0
fi

# Test SSH connection
log_info "Testing SSH connection..."
if ! remote_exec "echo 'SSH connection successful'"; then
    log_error "Failed to connect to $REMOTE_HOST"
    exit 1
fi
log_success "SSH connection established"

# Check if deployment directory exists
log_info "Checking deployment directory..."
if ! remote_exec "[ -d $DEPLOY_DIR ]"; then
    log_error "Deployment directory $DEPLOY_DIR does not exist on remote server"
    log_info "Please run 'terraform apply' first to provision the infrastructure"
    exit 1
fi

# Update docker-compose.yml with new image tag (if not latest)
if [ "$IMAGE_TAG" != "latest" ]; then
    log_info "Updating docker-compose.yml with tag: $IMAGE_TAG"
    remote_exec "sed -i 's/:latest/:$IMAGE_TAG/g' $DEPLOY_DIR/docker-compose.yml"
fi

# Pull new images
log_info "Pulling Docker images (tag: $IMAGE_TAG)..."
remote_exec "cd $DEPLOY_DIR && docker compose pull"
log_success "Images pulled successfully"

# Deploy services with zero downtime (rolling update)
log_info "Starting rolling deployment..."

# Update frontend first (stateless, safest)
log_info "Updating frontend-next..."
remote_exec "cd $DEPLOY_DIR && docker compose up -d --no-deps --build frontend-next"
check_service_health "frontend-next"

# Update REST API (may have brief connection errors during reload)
log_info "Updating rest-api..."
remote_exec "cd $DEPLOY_DIR && docker compose up -d --no-deps --build rest-api"
check_service_health "rest-api"

# Restart Caddy to ensure routing is correct (very brief interruption)
log_info "Restarting Caddy reverse proxy..."
remote_exec "cd $DEPLOY_DIR && docker compose restart caddy"
check_service_health "caddy"

# Show final status
log_info "Checking final service status..."
remote_exec "cd $DEPLOY_DIR && docker compose ps"

log_success "==================================================================="
log_success "Deployment completed successfully!"
log_success "==================================================================="
log_info "Services are now running with image tag: $IMAGE_TAG"
log_info ""
log_info "View logs:"
log_info "  ssh -i $SSH_KEY root@$REMOTE_HOST 'cd $DEPLOY_DIR && docker compose logs -f'"
log_info ""
log_info "Rollback if needed:"
log_info "  $0 --host=$REMOTE_HOST --tag=<previous-version>"
