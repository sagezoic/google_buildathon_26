import express from 'express';
import cors from 'cors';

const app = express();
const port = parseInt(process.env.PORT, 10) || 8080;
const environment = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// Cloud Run Liveness / Readiness health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'realdha-backend',
    environment,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'realdha-backend',
    environment,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Sample API info endpoint
app.get('/api/info', (req, res) => {
  res.status(200).json({
    service: 'realdha-backend',
    version: '1.0.0',
    description: 'Realdha Backend API running on Google Cloud Run'
  });
});

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Realdha Backend API',
    status: 'active',
    environment,
    endpoints: {
      health: '/health',
      api_health: '/api/health',
      info: '/api/info'
    }
  });
});

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

export default app;
