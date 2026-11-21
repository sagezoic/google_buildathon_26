import { Elysia, t } from 'elysia';
import { env } from '../config/env';
import { testDbConnection } from '../db/client';
import { cacheService } from '../services/cache';

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
    async () => {
      const [dbCheck, cacheStatus] = await Promise.all([
        testDbConnection(),
        cacheService.getStatus(),
      ]);
      return {
        status: dbCheck.connected ? 'healthy' : dbCheck.status === 'unconfigured' ? 'healthy' : 'degraded',
        service: 'realdha-backend',
        environment: env.NODE_ENV,
        database: dbCheck,
        cache: cacheStatus,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };
    },
    {
      detail: {
        summary: 'API Namespace Health Check',
        tags: ['Health'],
        description: 'Health status under the /api namespace including database and Valkey cache checks.',
      },
      response: t.Object({
        status: t.String(),
        service: t.String(),
        environment: t.String(),
        database: t.Object({
          status: t.String(),
          connected: t.Boolean(),
          error: t.Optional(t.String()),
        }),
        cache: t.Object({
          enabled: t.Boolean(),
          connected: t.Boolean(),
          provider: t.String(),
          keyCount: t.Optional(t.Number()),
          error: t.Optional(t.String()),
        }),
        uptime: t.Number(),
        timestamp: t.String(),
      }),
    }
  );
