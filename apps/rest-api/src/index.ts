import { buildApp } from './app.js';

const host = process.env.HOST ?? '0.0.0.0';
const port = parseInt(process.env.PORT ?? '3000', 10);

async function main() {
  const app = await buildApp({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  });

  try {
    await app.listen({ host, port });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
