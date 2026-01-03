import { chromium, type FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const DOCKER_STARTUP_TIMEOUT = 120000; // 2 minutes
const HEALTH_CHECK_INTERVAL = 2000; // 2 seconds

async function waitForHealthy(url: string, timeout: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`Health check passed: ${url}`);
        return;
      }
    } catch {
      // Service not ready yet
    }
    await new Promise((r) => setTimeout(r, HEALTH_CHECK_INTERVAL));
  }
  throw new Error(`Health check timeout: ${url}`);
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:8080';

  // Start Docker Compose services (if in CI or explicitly requested)
  if (process.env.CI || process.env.E2E_START_DOCKER === 'true') {
    console.log('Starting Docker Compose services...');
    const rootDir = path.resolve(__dirname, '../../../../..');

    execSync('docker compose --profile seed up -d --build --wait', {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        SEED_DATABASE: 'true',
        NODE_ENV: 'development',
      },
    });
  }

  // Wait for services to be healthy
  console.log('Waiting for services to be healthy...');
  await waitForHealthy(`${baseURL}/health`, DOCKER_STARTUP_TIMEOUT);
  await waitForHealthy(`${baseURL}/api/v1/health`, DOCKER_STARTUP_TIMEOUT);

  // Ensure auth directory exists
  const authDir = path.join(__dirname, '../.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Create authenticated state
  console.log('Setting up authentication state...');
  const browser = await chromium.launch();

  // Admin authentication
  const adminPage = await browser.newPage();
  await adminPage.goto(`${baseURL}/sign-in`);
  await adminPage.fill('#email', 'admin@example.com');
  await adminPage.fill('#password', 'password123');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForURL('**/dashboard', { timeout: 10000 });

  // Save admin auth state
  await adminPage.context().storageState({
    path: path.join(authDir, 'admin.json'),
  });

  await browser.close();
  console.log('Global setup complete');
}

export default globalSetup;
