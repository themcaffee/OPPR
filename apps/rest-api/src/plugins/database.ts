import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { connect, disconnect, testConnection } from '@opprs/db-prisma';

export default fp(
  async (fastify: FastifyInstance) => {
    await connect();

    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    fastify.log.info('Database connected successfully');

    fastify.addHook('onClose', async () => {
      fastify.log.info('Closing database connection');
      await disconnect();
    });
  },
  { name: 'database' }
);
