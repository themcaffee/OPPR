import { execSync } from 'child_process';
import path from 'path';

async function globalTeardown() {
  // Only tear down in CI or if explicitly requested
  if (process.env.CI || process.env.E2E_STOP_DOCKER === 'true') {
    console.log('Stopping Docker Compose services...');
    const rootDir = path.resolve(__dirname, '../../../../..');

    try {
      execSync('docker compose --profile seed down -v', {
        cwd: rootDir,
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Failed to stop Docker services:', error);
    }
  }

  console.log('Global teardown complete');
}

export default globalTeardown;
