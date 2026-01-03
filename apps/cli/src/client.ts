import { OpprsClient, type TokenPair } from '@opprs/rest-api-client';
import { getTokens, saveTokens, clearTokens, loadConfig, DEFAULT_API_URL } from './config/index.js';

export function createClient(apiUrl: string): OpprsClient {
  const tokens = getTokens();
  const config = loadConfig();

  const client = new OpprsClient({
    baseUrl: apiUrl,
    accessToken: tokens?.accessToken,
    refreshToken: tokens?.refreshToken,
    onTokenRefresh: (newTokens: TokenPair) => {
      saveTokens(newTokens, config.userEmail ?? '');
    },
    onAuthError: () => {
      clearTokens();
    },
  });

  return client;
}

export interface GlobalOptions {
  apiUrl?: string;
  json?: boolean;
  color?: boolean;
}

export function getApiUrl(options: GlobalOptions): string {
  const config = loadConfig();
  return options.apiUrl ?? config.apiUrl ?? DEFAULT_API_URL;
}
