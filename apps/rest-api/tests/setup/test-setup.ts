import { beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read DATABASE_URL from file created by globalSetup (must happen before prisma import)
const envFile = path.resolve(__dirname, '.test-env');
if (fs.existsSync(envFile) && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = fs.readFileSync(envFile, 'utf-8').trim();
}

// Import prisma after DATABASE_URL is set in the environment
const { prisma } = await import('@opprs/db-prisma');

beforeEach(async () => {
  // Clean all tables before each test (order matters due to foreign keys)
  await prisma.entry.deleteMany();
  await prisma.standing.deleteMany();
  await prisma.match.deleteMany();
  await prisma.round.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.location.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.player.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
