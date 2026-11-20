import { Elysia, t } from 'elysia';
import { env } from '../config/env';

export const healthRoutes = new Elysia()
  // Cloud Run Liveness / Readiness health check
  .get(
    '/health',
    () => ({
      status: 'healthy',
      service: 'realdha-backend',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        summary: 'Cloud Run Health Check',
        tags: ['Health'],
        description: 'Liveness and readiness probe endpoint for Google Cloud Run.',
      },
      response: t.Object({
        status: t.String(),
        service: t.String(),
        environment: t.String(),
        uptime: t.Number(),
        timestamp: t.String(),
      }),
    }
  )
  // API namespace health check
  .get(
    '/api/health',
    () => ({
      status: 'healthy',
      service: 'realdha-backend',
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
    {
      detail: {
        summary: 'API Namespace Health Check',
        tags: ['Health'],
        description: 'Health status under the /api namespace.',
      },
      response: t.Object({
        status: t.String(),
        service: t.String(),
        environment: t.String(),
        uptime: t.Number(),
        timestamp: t.String(),
      }),
    }
  );
