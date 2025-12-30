import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'demo/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts'
      ],
      thresholds: {
        lines: 45,
        functions: 40,
        branches: 80,
        statements: 45
      }
    }
  }
});
