import type {
  OpprsClientOptions,
  TokenPair,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  User,
} from './types/index.js';
import {
  OpprsApiError,
  OpprsAuthError,
  OpprsForbiddenError,
  OpprsNotFoundError,
  OpprsValidationError,
  OpprsConflictError,
  OpprsNetworkError,
  OpprsTimeoutError,
  OpprsExternalServiceError,
} from './errors.js';
import { PlayersResource } from './resources/players.js';
import { TournamentsResource } from './resources/tournaments.js';
import { ResultsResource } from './resources/results.js';
import { StatsResource } from './resources/stats.js';
import { ImportResource } from './resources/import.js';

const DEFAULT_BASE_URL = '/api/v1';
const DEFAULT_TIMEOUT = 30000;
const TOKEN_REFRESH_THRESHOLD_MS = 60000; // Refresh 1 minute before expiry

/**
 * Client for the OPPRS REST API
 */
export class OpprsClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly fetchImpl: typeof fetch;
  private readonly onTokenRefresh?: (_t: TokenPair) => void;
  private readonly onAuthError?: () => void;

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(options: OpprsClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.onTokenRefresh = options.onTokenRefresh;
    this.onAuthError = options.onAuthError;

    if (options.accessToken) {
      this.accessToken = options.accessToken;
    }
    if (options.refreshToken) {
      this.refreshToken = options.refreshToken;
    }
  }

  // ==================== Authentication Management ====================

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      false
    ); // Don't require auth for login

    this.setTokens(response);
    return response;
  }

  /**
   * Logout and invalidate tokens
   */
  async logout(): Promise<void> {
    if (!this.refreshToken) {
      this.clearTokens();
      return;
    }

    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken } satisfies RefreshRequest),
      });
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  /**
   * Check if client has valid authentication
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Set tokens externally (e.g., from storage)
   */
  setTokensFromStorage(tokens: TokenPair): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenExpiresAt = Date.now() + tokens.expiresIn * 1000;
  }

  private setTokens(response: LoginResponse | (RefreshResponse & { refreshToken?: string })): void {
    this.accessToken = response.accessToken;
    if ('refreshToken' in response && response.refreshToken) {
      this.refreshToken = response.refreshToken;
    }
    this.tokenExpiresAt = Date.now() + response.expiresIn * 1000;

    if (this.onTokenRefresh && this.refreshToken) {
      this.onTokenRefresh({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresIn: response.expiresIn,
      });
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
  }

  private async ensureValidToken(): Promise<void> {
    // If no token, nothing to refresh
    if (!this.accessToken) {
      return;
    }

    // Check if token needs refresh
    const needsRefresh =
      this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt - TOKEN_REFRESH_THRESHOLD_MS;

    if (!needsRefresh) {
      return;
    }

    // If already refreshing, wait for that to complete
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    // No refresh token means we can't refresh
    if (!this.refreshToken) {
      return;
    }

    // Start refresh
    this.refreshPromise = this.performTokenRefresh();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<void> {
    if (!this.refreshToken) {
      throw new OpprsAuthError('No refresh token available');
    }

    try {
      const response = await this.request<RefreshResponse>(
        '/auth/refresh',
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken } satisfies RefreshRequest),
        },
        false
      );

      this.setTokens(response);
    } catch (error) {
      // If refresh fails, clear tokens and notify
      this.clearTokens();
      if (this.onAuthError) {
        this.onAuthError();
      }
      throw error;
    }
  }

  // ==================== HTTP Request Infrastructure ====================

  private async request<T>(path: string, options?: RequestInit, requireAuth = true): Promise<T> {
    if (requireAuth) {
      await this.ensureValidToken();
    }

    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (this.accessToken && requireAuth) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const response = await this.fetchImpl(url, {
        ...options,
        headers: {
          ...headers,
          ...(options?.headers as Record<string, string>),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response, path);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof OpprsApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new OpprsTimeoutError(this.timeout);
      }

      throw new OpprsNetworkError(
        'Network request failed',
        error instanceof Error ? error : undefined
      );
    }
  }

  private async handleErrorResponse(response: Response, path: string): Promise<never> {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
      error?: string;
      details?: Record<string, unknown>;
      service?: string;
    } | null;

    const message = body?.message ?? `Request failed with status ${response.status}`;

    switch (response.status) {
      case 400:
        throw new OpprsValidationError(message, body?.details);
      case 401:
        throw new OpprsAuthError(message);
      case 403:
        throw new OpprsForbiddenError(message);
      case 404: {
        // Try to extract resource type from path
        const resourceMatch = path.match(/\/([a-z]+)(?:\/([^/]+))?/i);
        if (resourceMatch?.[2]) {
          throw new OpprsNotFoundError(resourceMatch[1] ?? 'Resource', resourceMatch[2]);
        }
        throw new OpprsNotFoundError('Resource', 'unknown');
      }
      case 409:
        throw new OpprsConflictError(message, body?.details);
      case 502:
        throw new OpprsExternalServiceError(message, body?.service ?? 'external');
      default:
        throw new OpprsApiError(message, response.status, body?.error ?? 'Error', body?.details);
    }
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // ==================== Resource Properties ====================

  /**
   * Players resource
   */
  get players(): PlayersResource {
    return new PlayersResource(this.request.bind(this), this.buildQueryString.bind(this));
  }

  /**
   * Tournaments resource
   */
  get tournaments(): TournamentsResource {
    return new TournamentsResource(this.request.bind(this), this.buildQueryString.bind(this));
  }

  /**
   * Results resource
   */
  get results(): ResultsResource {
    return new ResultsResource(this.request.bind(this), this.buildQueryString.bind(this));
  }

  /**
   * Stats resource
   */
  get stats(): StatsResource {
    return new StatsResource(this.request.bind(this), this.buildQueryString.bind(this));
  }

  /**
   * Import resource
   */
  get import(): ImportResource {
    return new ImportResource(this.request.bind(this));
  }
}
