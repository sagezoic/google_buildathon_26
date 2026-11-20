import { describe, expect, it } from 'bun:test';
import { app } from '../src/app';

describe('Realdha Backend (Elysia + Bun)', () => {
  it('GET / returns 200 with active status and endpoints list', async () => {
    const response = await app.handle(new Request('http://localhost/'));
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      message: string;
      status: string;
      runtime: string;
      framework: string;
      endpoints: Record<string, string>;
    };
    expect(body.message).toBe('Welcome to Realdha Backend API');
    expect(body.status).toBe('active');
    expect(body.runtime).toBe('bun');
    expect(body.framework).toBe('elysia');
    expect(body.endpoints).toBeDefined();
    expect(body.endpoints.health).toBe('/health');
    expect(body.endpoints.swagger).toBe('/swagger');
  });

  it('GET /health returns 200 with healthy status for Cloud Run', async () => {
    const response = await app.handle(new Request('http://localhost/health'));
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      status: string;
      service: string;
      environment: string;
      uptime: number;
      timestamp: string;
    };
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('realdha-backend');
    expect(typeof body.uptime).toBe('number');
    expect(body.timestamp).toBeDefined();
  });

  it('GET /api/health returns 200 with healthy status', async () => {
    const response = await app.handle(new Request('http://localhost/api/health'));
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      status: string;
      service: string;
    };
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('realdha-backend');
  });

  it('GET /api/info returns 200 with metadata', async () => {
    const response = await app.handle(new Request('http://localhost/api/info'));
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      service: string;
      version: string;
      runtime: string;
      framework: string;
    };
    expect(body.service).toBe('realdha-backend');
    expect(body.version).toBe('1.0.0');
    expect(body.runtime).toBe('bun');
    expect(body.framework).toBe('elysia');
  });

  it('GET /unknown-route returns 404 with structured error', async () => {
    const response = await app.handle(new Request('http://localhost/unknown-route'));
    expect(response.status).toBe(404);

    const body = (await response.json()) as {
      error: string;
      message: string;
      code: number;
    };
    expect(body.error).toBe('Not Found');
    expect(body.code).toBe(404);
  });
});
