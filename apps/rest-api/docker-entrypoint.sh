#!/bin/sh
set -e

echo "=== OPPR REST API Container Starting ==="

# Navigate to db-prisma package for Prisma commands
cd /app/packages/db-prisma

# Run migrations if enabled (default: true)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "Running database migrations..."
    npx prisma migrate deploy
    echo "Migrations completed successfully."
else
    echo "Skipping migrations (RUN_MIGRATIONS=${RUN_MIGRATIONS})"
fi

# Run seeding if SEED_DATABASE is set to true
if [ "${SEED_DATABASE:-false}" = "true" ]; then
    echo "Seeding database..."
    npx tsx prisma/seed.ts
    echo "Database seeded successfully."
fi

# Navigate back to rest-api and start the application
cd /app/apps/rest-api
echo "Starting REST API server..."
exec "$@"
