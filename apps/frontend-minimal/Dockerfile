# =============================================================================
# Minimal static file server using Caddy
# =============================================================================
FROM caddy:2-alpine

# Copy static files to Caddy's default serve directory
COPY apps/frontend-minimal/public /srv

# Expose port
EXPOSE 80

# Use Caddy's file server mode
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":80"]
