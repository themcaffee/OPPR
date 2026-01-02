import { describe, it, expect } from 'vitest';
import {
  ApiError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ExternalServiceError,
} from '../../src/utils/errors.js';

describe('Error classes', () => {
  describe('ApiError', () => {
    it('should create an error with message and status code', () => {
      const error = new ApiError('Test error', 500);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ApiError');
    });
  });

  describe('NotFoundError', () => {
    it('should create a 404 error with resource info', () => {
      const error = new NotFoundError('Player', 'abc123');
      expect(error.message).toBe("Player with id 'abc123' not found");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('BadRequestError', () => {
    it('should create a 400 error', () => {
      const error = new BadRequestError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('BadRequestError');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create a 401 error with default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create a 401 error with custom message', () => {
      const error = new UnauthorizedError('Token expired');
      expect(error.message).toBe('Token expired');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create a 403 error with default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('ForbiddenError');
    });

    it('should create a 403 error with custom message', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('ConflictError', () => {
    it('should create a 409 error', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create a 502 error with service info', () => {
      const error = new ExternalServiceError('Matchplay', 'Connection timeout');
      expect(error.message).toBe('Matchplay error: Connection timeout');
      expect(error.statusCode).toBe(502);
      expect(error.name).toBe('ExternalServiceError');
      expect(error.service).toBe('Matchplay');
    });
  });
});
