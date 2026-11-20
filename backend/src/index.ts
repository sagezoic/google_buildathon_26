import { app } from './app';
import { env } from './config/env';

// Start listening on configured host and port
const server = app.listen({
  port: env.PORT,
  hostname: env.HOST,
});

console.log(
  `[realdha-backend] Server listening on http://${env.HOST}:${env.PORT} (environment: ${env.NODE_ENV})`
);
console.log(`[realdha-backend] Swagger documentation available at http://${env.HOST}:${env.PORT}/swagger`);

// Graceful shutdown handling for Cloud Run container lifecycle
const gracefulShutdown = async (signal: string) => {
  console.log(`[realdha-backend] ${signal} received: stopping server gracefully...`);
  try {
    app.stop();
    console.log('[realdha-backend] Server stopped successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[realdha-backend] Error during shutdown:', err);
    process.exit(1);
  }
};

// Force exit safety timeout for Cloud Run
const setForceTimeout = () => {
  setTimeout(() => {
    console.error('[realdha-backend] Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => {
  setForceTimeout();
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  setForceTimeout();
  gracefulShutdown('SIGINT');
});

export default server;
