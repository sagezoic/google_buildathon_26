import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { healthRoutes } from './routes/health';
import { infoRoutes } from './routes/info';
import { flatsRoutes } from './modules/flats/routes';
import { storageRoutes } from './routes/storage';

export const app = new Elysia()
  // Global CORS middleware
  .use(cors())
  // OpenAPI / Swagger Documentation
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Realdha Backend API',
          version: '1.0.0',
          description: 'High-performance API built with Bun and Elysia for Google Cloud Run',
        },
        tags: [
          { name: 'Health', description: 'Health check and probe endpoints' },
          { name: 'General', description: 'General service info and root endpoints' },
          { name: 'Flats', description: 'Flat Finder society search, localities, and details' },
          { name: 'Storage', description: 'Google Cloud Storage operations, signed URLs, and file management' },
        ],
      },
    })
  )
  // Global error handling conforming to backend patterns
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        error: 'Not Found',
        message: 'The requested resource was not found.',
        code: 404,
      };
    }

    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        error: 'Validation Error',
        message: error.message,
        code: 400,
      };
    }

    console.error('[realdha-backend] Server error:', error);
    set.status = 500;
    return {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.',
      code: 500,
    };
  })
  // Mount routes
  .use(healthRoutes)
  .use(infoRoutes)
  .use(flatsRoutes)
  .use(storageRoutes);

export default app;
