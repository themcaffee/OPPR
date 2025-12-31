#!/bin/bash
# =============================================================================
# OPPR VPS Setup Script
# This script is executed via cloud-init user_data on droplet creation
# =============================================================================

set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo "=== Starting OPPR server setup ==="

# Update system packages
echo "=== Updating system packages ==="
apt-get update
apt-get upgrade -y

# Install prerequisites
echo "=== Installing prerequisites ==="
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# =============================================================================
# Install Docker
# =============================================================================

echo "=== Installing Docker ==="

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# =============================================================================
# Prepare Application Directory
# =============================================================================

echo "=== Preparing application directory ==="

mkdir -p /opt/oppr

# =============================================================================
# Configure System
# =============================================================================

echo "=== Configuring system ==="

# Set timezone to UTC
timedatectl set-timezone UTC

# Configure automatic security updates
apt-get install -y unattended-upgrades
cat >> /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Automatic-Reboot "false";
EOF

# =============================================================================
# Setup Complete
# =============================================================================

echo "=== Setup complete ==="
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"
