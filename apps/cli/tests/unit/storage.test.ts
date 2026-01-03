import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Mock the config constants to use a temp directory
const TEST_CONFIG_DIR = join(tmpdir(), '.opprs-test-' + Date.now());
const TEST_CONFIG_FILE = join(TEST_CONFIG_DIR, 'config.json');

vi.mock('../../src/config/constants.js', () => ({
  DEFAULT_API_URL: 'http://localhost:3000/api/v1',
  CONFIG_DIR: TEST_CONFIG_DIR,
  CONFIG_FILE: TEST_CONFIG_FILE,
}));

// Import after mocking
const { loadConfig, saveConfig, getTokens, saveTokens, clearTokens } = await import(
  '../../src/config/storage.js'
);

describe('storage', () => {
  beforeEach(() => {
    // Clean up test directory before each test
    if (existsSync(TEST_CONFIG_DIR)) {
      rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (existsSync(TEST_CONFIG_DIR)) {
      rmSync(TEST_CONFIG_DIR, { recursive: true });
    }
  });

  describe('loadConfig', () => {
    it('should return empty object when config file does not exist', () => {
      const config = loadConfig();
      expect(config).toEqual({});
    });

    it('should return parsed config when file exists', () => {
      mkdirSync(TEST_CONFIG_DIR, { recursive: true });
      const testConfig = { apiUrl: 'http://test.com', userEmail: 'test@test.com' };
      writeFileSync(TEST_CONFIG_FILE, JSON.stringify(testConfig));

      const config = loadConfig();
      expect(config).toEqual(testConfig);
    });

    it('should return empty object when file contains invalid JSON', () => {
      mkdirSync(TEST_CONFIG_DIR, { recursive: true });
      writeFileSync(TEST_CONFIG_FILE, 'invalid json');

      const config = loadConfig();
      expect(config).toEqual({});
    });
  });

  describe('saveConfig', () => {
    it('should create config directory and file', () => {
      const testConfig = { apiUrl: 'http://test.com' };
      saveConfig(testConfig);

      expect(existsSync(TEST_CONFIG_DIR)).toBe(true);
      expect(existsSync(TEST_CONFIG_FILE)).toBe(true);

      const content = readFileSync(TEST_CONFIG_FILE, 'utf-8');
      expect(JSON.parse(content)).toEqual(testConfig);
    });
  });

  describe('getTokens', () => {
    it('should return undefined when no tokens are saved', () => {
      const tokens = getTokens();
      expect(tokens).toBeUndefined();
    });

    it('should return saved tokens', () => {
      const testTokens = {
        accessToken: 'access123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };
      mkdirSync(TEST_CONFIG_DIR, { recursive: true });
      writeFileSync(TEST_CONFIG_FILE, JSON.stringify({ tokens: testTokens }));

      const tokens = getTokens();
      expect(tokens).toEqual(testTokens);
    });
  });

  describe('saveTokens', () => {
    it('should save tokens and email', () => {
      const testTokens = {
        accessToken: 'access123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };
      saveTokens(testTokens, 'user@test.com');

      const content = readFileSync(TEST_CONFIG_FILE, 'utf-8');
      const config = JSON.parse(content);
      expect(config.tokens).toEqual(testTokens);
      expect(config.userEmail).toBe('user@test.com');
    });
  });

  describe('clearTokens', () => {
    it('should remove tokens and email from config', () => {
      const testTokens = {
        accessToken: 'access123',
        refreshToken: 'refresh123',
        expiresIn: 3600,
      };
      saveTokens(testTokens, 'user@test.com');

      clearTokens();

      const content = readFileSync(TEST_CONFIG_FILE, 'utf-8');
      const config = JSON.parse(content);
      expect(config.tokens).toBeUndefined();
      expect(config.userEmail).toBeUndefined();
    });
  });
});
