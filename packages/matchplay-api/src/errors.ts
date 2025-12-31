/**
 * Base error class for Matchplay API errors
 */
export class MatchplayApiError extends Error {
  public readonly statusCode: number;
  public readonly response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'MatchplayApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * Error thrown when authentication fails (401)
 */
export class MatchplayAuthError extends MatchplayApiError {
  constructor(message = 'Authentication required or invalid token') {
    super(message, 401);
    this.name = 'MatchplayAuthError';
  }
}

/**
 * Error thrown when a resource is not found (404)
 */
export class MatchplayNotFoundError extends MatchplayApiError {
  public readonly resource: string;
  public readonly resourceId: number | string;

  constructor(resource: string, id: number | string) {
    super(`${resource} with id '${id}' not found`, 404);
    this.name = 'MatchplayNotFoundError';
    this.resource = resource;
    this.resourceId = id;
  }
}

/**
 * Error thrown for network-level failures
 */
export class MatchplayNetworkError extends Error {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'MatchplayNetworkError';
    this.cause = cause;
  }
}

/**
 * Error thrown when a request times out
 */
export class MatchplayTimeoutError extends MatchplayNetworkError {
  public readonly timeout: number;

  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'MatchplayTimeoutError';
    this.timeout = timeout;
  }
}

/**
 * Error thrown when data transformation fails
 */
export class TransformError extends Error {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message);
    this.name = 'TransformError';
    this.field = field;
    this.value = value;
  }
}
