import express from 'express';
import cors from 'cors';

const app = express();
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

export default app;
