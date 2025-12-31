# =============================================================================
# Outputs
# =============================================================================

output "droplet_ip" {
  description = "Public IP address of the droplet"
  value       = digitalocean_droplet.oppr.ipv4_address
}

output "reserved_ip" {
  description = "Reserved IP address (if enabled)"
  value       = var.enable_reserved_ip ? digitalocean_reserved_ip.oppr[0].ip_address : null
}

output "effective_ip" {
  description = "IP address to use (reserved IP if enabled, otherwise droplet IP)"
  value       = var.enable_reserved_ip ? digitalocean_reserved_ip.oppr[0].ip_address : digitalocean_droplet.oppr.ipv4_address
}

output "ssh_command" {
  description = "SSH command to connect to the droplet"
  value       = "ssh root@${var.enable_reserved_ip ? digitalocean_reserved_ip.oppr[0].ip_address : digitalocean_droplet.oppr.ipv4_address}"
}

output "application_url" {
  description = "Application URL"
  value       = var.domain != "" ? "https://${var.domain}" : "http://${var.enable_reserved_ip ? digitalocean_reserved_ip.oppr[0].ip_address : digitalocean_droplet.oppr.ipv4_address}"
}

output "api_docs_url" {
  description = "API documentation URL"
  value       = var.domain != "" ? "https://${var.domain}/docs" : "http://${var.enable_reserved_ip ? digitalocean_reserved_ip.oppr[0].ip_address : digitalocean_droplet.oppr.ipv4_address}/docs"
}

output "dns_instructions" {
  description = "DNS configuration instructions"
  value       = var.domain != "" ? "Create an A record: ${var.domain} -> ${var.enable_reserved_ip ? digitalocean_reserved_ip.oppr[0].ip_address : digitalocean_droplet.oppr.ipv4_address}" : "No domain configured. Access via IP address."
}

# =============================================================================
# Sensitive Outputs (for backup/recovery)
# =============================================================================

output "postgres_password" {
  description = "PostgreSQL password (save securely)"
  value       = local.postgres_password
  sensitive   = true
}

output "jwt_secret" {
  description = "JWT access token secret (save securely)"
  value       = local.jwt_secret
  sensitive   = true
}

output "jwt_refresh_secret" {
  description = "JWT refresh token secret (save securely)"
  value       = local.jwt_refresh_secret
  sensitive   = true
}
