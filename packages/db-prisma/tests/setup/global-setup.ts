import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let container: StartedPostgreSqlContainer | null = null;
const envFile = path.resolve(__dirname, '.test-env');

export async function setup() {
  let databaseUrl = process.env.DATABASE_URL;

  // If DATABASE_URL is not set, start a container
  if (!databaseUrl) {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('oppr_test')
      .withUsername('test')
      .withPassword('test')
      .start();

    databaseUrl = container.getConnectionUri();
  }

  // Write DATABASE_URL to a temp file for the test process to read
  fs.writeFileSync(envFile, databaseUrl);

  // Get the package directory
  const packageDir = path.resolve(__dirname, '../..');

  // Run Prisma migrations to create schema
  execSync('npx prisma db push --skip-generate', {
    cwd: packageDir,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });

  // Return teardown function
  return async () => {
    // Clean up the env file
    if (fs.existsSync(envFile)) {
      fs.unlinkSync(envFile);
    }
    if (container) {
      await container.stop();
    }
  };
}
