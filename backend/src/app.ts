import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { healthRoutes } from './routes/health';
import { infoRoutes } from './routes/info';
import { flatsRoutes } from './modules/flats/routes';
import { storageRoutes } from './routes/storage';
import { propertiesRoutes } from './modules/properties/routes';
import { chainRoutes } from './modules/chain/routes';
import { aiRoutes } from './modules/ai/routes';
import { ApiError } from './lib/errors';

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
          { name: 'Chain', description: 'Blockchain property tokens: lawyer approval, anchoring and document verification' },
          { name: 'Properties', description: 'Add Property drafts, document upload, OCR, translation and field extraction' },
          { name: 'AI', description: 'Gemini on Vertex AI: document checks (STOP / PROCEED reports) and chat about a property' },
        ],
      },
    })
  )
  // Global error handling conforming to backend patterns
  .onError(({ code, error, set }) => {
    if (error instanceof ApiError) {
      set.status = error.status;
      return {
        error: error.error,
        message: error.message,
        code: error.status,
      };
    }

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
    const causeMessage = (error as any)?.cause?.message || (error as any)?.cause;
    const baseMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    const detailedMessage = causeMessage ? `${baseMessage}\nCause: ${causeMessage}` : baseMessage;

    set.status = 500;
    return {
      error: 'Internal Server Error',
      message: detailedMessage,
      code: 500,
    };
  })
  // Mount routes
  .use(healthRoutes)
  .use(infoRoutes)
  .use(flatsRoutes)
  .use(storageRoutes)
  .use(propertiesRoutes)
  .use(aiRoutes)
  .use(chainRoutes);

export default app;
