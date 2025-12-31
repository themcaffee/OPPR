# =============================================================================
# Required Variables
# =============================================================================

variable "do_token" {
  description = "Digital Ocean API token"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "SSH public key for droplet access"
  type        = string
}

# =============================================================================
# Droplet Configuration
# =============================================================================

variable "droplet_name" {
  description = "Name of the droplet"
  type        = string
  default     = "oppr-server"
}

variable "droplet_size" {
  description = "Droplet size slug (e.g., s-1vcpu-1gb, s-1vcpu-2gb, s-2vcpu-2gb, s-2vcpu-4gb)"
  type        = string
  default     = "s-1vcpu-2gb"
}

variable "droplet_region" {
  description = "Digital Ocean region (e.g., nyc1, sfo3, lon1, ams3)"
  type        = string
  default     = "nyc1"
}

variable "droplet_image" {
  description = "Droplet OS image"
  type        = string
  default     = "ubuntu-24-04-x64"
}

# =============================================================================
# Networking
# =============================================================================

variable "domain" {
  description = "Domain name for the application (optional, for Caddy HTTPS). Leave empty to use IP address."
  type        = string
  default     = ""
}

variable "enable_reserved_ip" {
  description = "Attach a reserved (static) IP to the droplet"
  type        = bool
  default     = false
}

# =============================================================================
# Docker Images
# =============================================================================

variable "github_owner" {
  description = "GitHub owner/org for GHCR images (e.g., your GitHub username)"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to deploy (e.g., latest, 1.0.0)"
  type        = string
  default     = "latest"
}

# =============================================================================
# Application Secrets (auto-generated if not provided)
# =============================================================================

variable "postgres_password" {
  description = "PostgreSQL password (auto-generated if not provided)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT access token secret (auto-generated if not provided)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "jwt_refresh_secret" {
  description = "JWT refresh token secret (auto-generated if not provided)"
  type        = string
  default     = ""
  sensitive   = true
}

# =============================================================================
# SSH Configuration
# =============================================================================

variable "ssh_private_key_path" {
  description = "Path to SSH private key for provisioning (default: ~/.ssh/id_rsa)"
  type        = string
  default     = "~/.ssh/id_rsa"
}

# =============================================================================
# Tags
# =============================================================================

variable "tags" {
  description = "Tags to apply to resources"
  type        = list(string)
  default     = ["oppr", "production"]
}
