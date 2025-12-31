import { describe, it, expect } from 'vitest';
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
} from '../src/errors.js';

describe('Error classes', () => {
  describe('OpprsApiError', () => {
    it('should create error with all properties', () => {
      const error = new OpprsApiError('Test error', 500, 'Internal Server Error', {
        detail: 'test',
      });

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('OpprsApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.errorType).toBe('Internal Server Error');
      expect(error.details).toEqual({ detail: 'test' });
    });
  });

  describe('OpprsAuthError', () => {
    it('should create 401 error with default message', () => {
      const error = new OpprsAuthError();

      expect(error).toBeInstanceOf(OpprsApiError);
      expect(error.name).toBe('OpprsAuthError');
      expect(error.message).toBe('Authentication required or invalid token');
      expect(error.statusCode).toBe(401);
      expect(error.errorType).toBe('Unauthorized');
    });

    it('should create 401 error with custom message', () => {
      const error = new OpprsAuthError('Custom auth error');

      expect(error.message).toBe('Custom auth error');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('OpprsForbiddenError', () => {
    it('should create 403 error', () => {
      const error = new OpprsForbiddenError();

      expect(error).toBeInstanceOf(OpprsApiError);
      expect(error.name).toBe('OpprsForbiddenError');
      expect(error.statusCode).toBe(403);
      expect(error.errorType).toBe('Forbidden');
    });
  });

  describe('OpprsNotFoundError', () => {
    it('should create 404 error with resource info', () => {
      const error = new OpprsNotFoundError('Player', '123');

      expect(error).toBeInstanceOf(OpprsApiError);
      expect(error.name).toBe('OpprsNotFoundError');
      expect(error.message).toBe("Player with id '123' not found");
      expect(error.statusCode).toBe(404);
      expect(error.errorType).toBe('Not Found');
      expect(error.resource).toBe('Player');
      expect(error.resourceId).toBe('123');
    });
  });

  describe('OpprsValidationError', () => {
    it('should create 400 error with validation details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new OpprsValidationError('Validation failed', details);

      expect(error).toBeInstanceOf(OpprsApiError);
      expect(error.name).toBe('OpprsValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errorType).toBe('Bad Request');
      expect(error.details).toEqual(details);
    });
  });

  describe('OpprsConflictError', () => {
    it('should create 409 error', () => {
      const error = new OpprsConflictError('Resource already exists');

      expect(error).toBeInstanceOf(OpprsApiError);
      expect(error.name).toBe('OpprsConflictError');
      expect(error.statusCode).toBe(409);
      expect(error.errorType).toBe('Conflict');
    });
  });

  describe('OpprsNetworkError', () => {
    it('should create network error with cause', () => {
      const cause = new Error('Connection failed');
      const error = new OpprsNetworkError('Network failure', cause);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('OpprsNetworkError');
      expect(error.message).toBe('Network failure');
      expect(error.cause).toBe(cause);
    });
  });

  describe('OpprsTimeoutError', () => {
    it('should create timeout error with timeout value', () => {
      const error = new OpprsTimeoutError(5000);

      expect(error).toBeInstanceOf(OpprsNetworkError);
      expect(error.name).toBe('OpprsTimeoutError');
      expect(error.message).toBe('Request timed out after 5000ms');
      expect(error.timeout).toBe(5000);
    });
  });

  describe('OpprsExternalServiceError', () => {
    it('should create 502 error with service name', () => {
      const error = new OpprsExternalServiceError('Matchplay API unavailable', 'matchplay');

      expect(error).toBeInstanceOf(OpprsApiError);
      expect(error.name).toBe('OpprsExternalServiceError');
      expect(error.message).toBe('Matchplay API unavailable');
      expect(error.statusCode).toBe(502);
      expect(error.errorType).toBe('Bad Gateway');
      expect(error.service).toBe('matchplay');
    });
  });
});
