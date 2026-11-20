import app from './app.js';

const port = parseInt(process.env.PORT, 10) || 8080;
const environment = process.env.NODE_ENV || 'development';

// Start HTTP server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[realdha-backend] Server listening on port ${port} (environment: ${environment})`);
});

// Handle graceful shutdown for Google Cloud Run container restarts
const gracefulShutdown = (signal) => {
  console.log(`[realdha-backend] ${signal} signal received: closing HTTP server...`);
  server.close(() => {
    console.log('[realdha-backend] HTTP server closed gracefully.');
    process.exit(0);
  });

  // Force close after 10 seconds if connections refuse to terminate
  setTimeout(() => {
    console.error('[realdha-backend] Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
