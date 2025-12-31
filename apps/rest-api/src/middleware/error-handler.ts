import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyError } from 'fastify';
import { ApiError, ExternalServiceError } from '../utils/errors.js';

interface PrismaError extends Error {
  code?: string;
  meta?: { cause?: string };
}

export default fp(
  async (fastify: FastifyInstance) => {
    fastify.setErrorHandler((error: FastifyError, request, reply) => {
      const statusCode = error.statusCode ?? 500;

      if (statusCode >= 500) {
        request.log.error(error);
      }

      if (error.validation) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: error.validation,
        });
      }

      if (error instanceof ExternalServiceError) {
        return reply.status(error.statusCode).send({
          statusCode: error.statusCode,
          error: 'Bad Gateway',
          message: error.message,
          service: error.service,
        });
      }

      if (error instanceof ApiError) {
        return reply.status(error.statusCode).send({
          statusCode: error.statusCode,
          error: error.name,
          message: error.message,
        });
      }

      const prismaError = error as PrismaError;
      if (prismaError.code === 'P2025') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Resource not found',
        });
      }

      if (prismaError.code === 'P2002') {
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'Resource already exists',
        });
      }

      return reply.status(statusCode).send({
        statusCode,
        error: error.name ?? 'Error',
        message: error.message ?? 'An unexpected error occurred',
      });
    });
  },
  { name: 'error-handler' }
);
