/**
 * Generates unique test user credentials for each test run.
 * Uses timestamp and random suffix to ensure uniqueness.
 */
export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export function generateTestUser(prefix = 'e2e'): TestUser {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const uniqueId = `${timestamp}-${random}`;

  return {
    name: `Test User ${uniqueId}`,
    email: `${prefix}-${uniqueId}@test.example.com`,
    password: 'TestPassword123!',
  };
}
