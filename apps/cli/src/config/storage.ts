import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { TokenPair } from '@opprs/rest-api-client';
import { CONFIG_DIR, CONFIG_FILE } from './constants.js';

export interface CliConfig {
  apiUrl?: string;
  tokens?: TokenPair;
  userEmail?: string;
}

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function loadConfig(): CliConfig {
  ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content) as CliConfig;
  } catch {
    return {};
  }
}

export function saveConfig(config: CliConfig): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function getTokens(): TokenPair | undefined {
  return loadConfig().tokens;
}

export function saveTokens(tokens: TokenPair, email: string): void {
  const config = loadConfig();
  config.tokens = tokens;
  config.userEmail = email;
  saveConfig(config);
}

export function clearTokens(): void {
  const config = loadConfig();
  delete config.tokens;
  delete config.userEmail;
  saveConfig(config);
}

export function getSavedApiUrl(): string | undefined {
  return loadConfig().apiUrl;
}

export function saveApiUrl(url: string): void {
  const config = loadConfig();
  config.apiUrl = url;
  saveConfig(config);
}
