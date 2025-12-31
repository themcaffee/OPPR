# =============================================================================
# Random Secrets Generation (if not provided)
# =============================================================================

resource "random_password" "postgres" {
  count   = var.postgres_password == "" ? 1 : 0
  length  = 32
  special = false
}

resource "random_password" "jwt" {
  count   = var.jwt_secret == "" ? 1 : 0
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh" {
  count   = var.jwt_refresh_secret == "" ? 1 : 0
  length  = 64
  special = false
}

locals {
  postgres_password  = var.postgres_password != "" ? var.postgres_password : random_password.postgres[0].result
  jwt_secret         = var.jwt_secret != "" ? var.jwt_secret : random_password.jwt[0].result
  jwt_refresh_secret = var.jwt_refresh_secret != "" ? var.jwt_refresh_secret : random_password.jwt_refresh[0].result

  # Use provided domain or "localhost" for IP-only access
  effective_domain = var.domain != "" ? var.domain : "localhost"
}

# =============================================================================
# SSH Key
# =============================================================================

resource "digitalocean_ssh_key" "oppr" {
  name       = "${var.droplet_name}-key"
  public_key = var.ssh_public_key
}

# =============================================================================
# Droplet
# =============================================================================

resource "digitalocean_droplet" "oppr" {
  name     = var.droplet_name
  region   = var.droplet_region
  size     = var.droplet_size
  image    = var.droplet_image
  ssh_keys = [digitalocean_ssh_key.oppr.fingerprint]
  tags     = var.tags

  # User data script to install Docker (runs on first boot)
  user_data = file("${path.module}/scripts/setup.sh")

  connection {
    type        = "ssh"
    user        = "root"
    host        = self.ipv4_address
    private_key = file(pathexpand(var.ssh_private_key_path))
    timeout     = "10m"
  }

  # Wait for cloud-init to complete
  provisioner "remote-exec" {
    inline = [
      "echo 'Waiting for cloud-init to complete...'",
      "cloud-init status --wait",
      "echo 'Cloud-init completed successfully'"
    ]
  }

  # Create application directory
  provisioner "remote-exec" {
    inline = [
      "mkdir -p /opt/oppr"
    ]
  }

  # Copy environment file
  provisioner "file" {
    content = templatefile("${path.module}/templates/.env.tpl", {
      domain             = local.effective_domain
      postgres_password  = local.postgres_password
      jwt_secret         = local.jwt_secret
      jwt_refresh_secret = local.jwt_refresh_secret
    })
    destination = "/opt/oppr/.env"
  }

  # Copy docker-compose file
  provisioner "file" {
    content = templatefile("${path.module}/templates/docker-compose.production.yml.tpl", {
      github_owner = var.github_owner
      image_tag    = var.image_tag
    })
    destination = "/opt/oppr/docker-compose.yml"
  }

  # Copy Caddyfile
  provisioner "file" {
    source      = "${path.module}/../Caddyfile"
    destination = "/opt/oppr/Caddyfile"
  }

  # Deploy the application
  provisioner "remote-exec" {
    inline = [
      "cd /opt/oppr",
      "echo 'Pulling Docker images...'",
      "docker compose pull",
      "echo 'Starting services...'",
      "docker compose up -d",
      "echo 'Waiting for services to be healthy...'",
      "sleep 10",
      "docker compose ps",
      "echo 'Deployment completed successfully!'"
    ]
  }
}

# =============================================================================
# Reserved IP (optional)
# =============================================================================

resource "digitalocean_reserved_ip" "oppr" {
  count  = var.enable_reserved_ip ? 1 : 0
  region = var.droplet_region
}

resource "digitalocean_reserved_ip_assignment" "oppr" {
  count      = var.enable_reserved_ip ? 1 : 0
  ip_address = digitalocean_reserved_ip.oppr[0].ip_address
  droplet_id = digitalocean_droplet.oppr.id
}
