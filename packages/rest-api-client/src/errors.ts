/**
 * Base error class for OPPRS API errors
 */
export class OpprsApiError extends Error {
  public readonly statusCode: number;
  public readonly errorType: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    errorType: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OpprsApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
  }
}

/**
 * Error thrown when authentication fails (401)
 */
export class OpprsAuthError extends OpprsApiError {
  constructor(message = 'Authentication required or invalid token') {
    super(message, 401, 'Unauthorized');
    this.name = 'OpprsAuthError';
  }
}

/**
 * Error thrown when access is forbidden (403)
 */
export class OpprsForbiddenError extends OpprsApiError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'Forbidden');
    this.name = 'OpprsForbiddenError';
  }
}

/**
 * Error thrown when a resource is not found (404)
 */
export class OpprsNotFoundError extends OpprsApiError {
  public readonly resource: string;
  public readonly resourceId: string;

  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 404, 'Not Found');
    this.name = 'OpprsNotFoundError';
    this.resource = resource;
    this.resourceId = id;
  }
}

/**
 * Error thrown for validation errors (400)
 */
export class OpprsValidationError extends OpprsApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'Bad Request', details);
    this.name = 'OpprsValidationError';
  }
}

/**
 * Error thrown for conflict errors (409)
 */
export class OpprsConflictError extends OpprsApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, 'Conflict', details);
    this.name = 'OpprsConflictError';
  }
}

/**
 * Error thrown for network-level failures
 */
export class OpprsNetworkError extends Error {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'OpprsNetworkError';
    this.cause = cause;
  }
}

/**
 * Error thrown when a request times out
 */
export class OpprsTimeoutError extends OpprsNetworkError {
  public readonly timeout: number;

  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'OpprsTimeoutError';
    this.timeout = timeout;
  }
}

/**
 * Error thrown when external service fails (502)
 */
export class OpprsExternalServiceError extends OpprsApiError {
  public readonly service: string;

  constructor(message: string, service: string) {
    super(message, 502, 'Bad Gateway');
    this.name = 'OpprsExternalServiceError';
    this.service = service;
  }
}
