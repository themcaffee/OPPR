# Database Migrations Guide

This guide explains how to manage database migrations with oppr-db using Prisma.

## Overview

Prisma Migrate is a declarative database migration system that:
- Generates SQL migration files from your Prisma schema changes
- Applies migrations to your database
- Tracks migration history
- Supports rollback and reset operations

## Initial Setup

### 1. Set up your database connection

Create a `.env` file in your project root:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/oppr_db?schema=public"
```

### 2. Install dependencies

```bash
npm install oppr-db @prisma/client
npm install -D prisma
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

## Creating the Initial Migration

If you're starting fresh, create the initial migration:

```bash
# Development - creates migration and applies it
npx prisma migrate dev --name init

# Production - deploy existing migrations
npx prisma migrate deploy
```

This will:
1. Create the `prisma/migrations` directory
2. Generate SQL migration files
3. Apply the migration to your database
4. Generate the Prisma Client

## Development Workflow

### Making Schema Changes

1. Edit the Prisma schema in `node_modules/oppr-db/prisma/schema.prisma`
   (Or create your own schema that extends oppr-db)

2. Create and apply the migration:

```bash
npx prisma migrate dev --name describe_your_change
```

Examples:
```bash
npx prisma migrate dev --name add_player_location
npx prisma migrate dev --name update_tournament_fields
```

### Viewing Migration Status

Check which migrations have been applied:

```bash
npx prisma migrate status
```

### Resetting the Database

WARNING: This deletes all data!

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Create a new database
3. Apply all migrations
4. Run seed scripts (if configured)

## Production Deployment

### Applying Migrations

In production, use `migrate deploy` instead of `migrate dev`:

```bash
npx prisma migrate deploy
```

This:
- Only applies pending migrations
- Does not create new migrations
- Does not drop the database
- Safe for production use

### Example CI/CD Pipeline

```yaml
# Example GitHub Actions workflow
deploy:
  steps:
    - name: Install dependencies
      run: npm ci

    - name: Run migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}

    - name: Deploy application
      run: npm run deploy
```

## Common Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply a new migration (development)
npx prisma migrate dev --name migration_name

# Apply pending migrations (production)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Push schema changes without migrations (prototyping only)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed the database
npx prisma db seed
```

## Migration Files

Migrations are stored in `prisma/migrations/` directory:

```
prisma/
  migrations/
    20240315120000_init/
      migration.sql
    20240320140000_add_player_location/
      migration.sql
    migration_lock.toml
```

Each migration contains:
- Timestamp prefix for ordering
- Descriptive name
- SQL file with migration commands

## Troubleshooting

### Migration Failed

If a migration fails:

1. Check the error message
2. Fix the issue (database constraints, etc.)
3. Try again or use `migrate resolve`:

```bash
npx prisma migrate resolve --applied migration_name
```

### Schema Drift Detected

If Prisma detects differences between your schema and database:

```bash
# In development
npx prisma migrate dev

# To sync without migrations (not recommended for production)
npx prisma db push
```

### Reset After Failed Migration

```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Best Practices

1. **Always version control migrations**
   - Commit migration files to git
   - Never edit applied migrations

2. **Test migrations before production**
   - Run on staging environment first
   - Verify data integrity

3. **Use descriptive migration names**
   - `add_player_email` ✓
   - `update_schema` ✗

4. **Backup before major migrations**
   - Always backup production data
   - Test rollback procedures

5. **Use `migrate deploy` in production**
   - Never use `migrate dev` in production
   - Never use `db push` in production

6. **Keep schema changes small**
   - One logical change per migration
   - Easier to rollback if needed

## Advanced Topics

### Custom Migration SQL

You can edit migration SQL before applying:

1. Create migration:
```bash
npx prisma migrate dev --create-only --name custom_migration
```

2. Edit the SQL file in `prisma/migrations/`

3. Apply the migration:
```bash
npx prisma migrate dev
```

### Rollback Strategies

Prisma doesn't have built-in rollback. To rollback:

1. Use database backup
2. Create a new forward migration to undo changes
3. Manually run SQL to revert (not recommended)

### Multiple Environments

Use different DATABASE_URL for each environment:

```bash
# .env.development
DATABASE_URL="postgresql://user:pass@localhost:5432/oppr_dev"

# .env.production
DATABASE_URL="postgresql://user:pass@prod-host:5432/oppr_prod"
```

Load the appropriate .env file in your deployment process.

## Resources

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Migration Troubleshooting](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
