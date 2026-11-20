import { Elysia, t } from 'elysia';
import { env } from '../config/env';

export const infoRoutes = new Elysia()
  // Root welcome endpoint
  .get(
    '/',
    () => ({
      message: 'Welcome to Realdha Backend API',
      status: 'active',
      environment: env.NODE_ENV,
      runtime: 'bun',
      framework: 'elysia',
      endpoints: {
        health: '/health',
        api_health: '/api/health',
        info: '/api/info',
        swagger: '/swagger',
      },
    }),
    {
      detail: {
        summary: 'Root Welcome Endpoint',
        tags: ['General'],
        description: 'Root endpoint providing API information and available route directory.',
      },
      response: t.Object({
        message: t.String(),
        status: t.String(),
        environment: t.String(),
        runtime: t.String(),
        framework: t.String(),
        endpoints: t.Object({
          health: t.String(),
          api_health: t.String(),
          info: t.String(),
          swagger: t.String(),
        }),
      }),
    }
  )
  // API info endpoint
  .get(
    '/api/info',
    () => ({
      service: 'realdha-backend',
      version: '1.0.0',
      description: 'Realdha Backend API running on Google Cloud Run with Bun & Elysia',
      runtime: 'bun',
      framework: 'elysia',
    }),
    {
      detail: {
        summary: 'API Metadata',
        tags: ['General'],
        description: 'Metadata including service name, version, and runtime framework details.',
      },
      response: t.Object({
        service: t.String(),
        version: t.String(),
        description: t.String(),
        runtime: t.String(),
        framework: t.String(),
      }),
    }
  );
