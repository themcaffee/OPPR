/**
 * Configuration options for OpprsClient
 */
export interface OpprsClientOptions {
  /**
   * Base URL for the OPPRS API
   * @default '/api/v1'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Initial access token (optional - can also use login())
   */
  accessToken?: string;

  /**
   * Initial refresh token (optional - for persisting sessions)
   */
  refreshToken?: string;

  /**
   * Callback when tokens are refreshed (for persisting to storage)
   */
  /**
   * Callback when tokens are refreshed (for persisting to storage)
   * @param _t - Token pair
   */
  onTokenRefresh?: (_t: TokenPair) => void;

  /**
   * Callback when authentication fails and refresh is not possible
   */
  onAuthError?: () => void;

  /**
   * Custom fetch implementation (for testing or special environments)
   */
  fetch?: typeof fetch;
}

/**
 * Token pair returned from authentication endpoints
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
