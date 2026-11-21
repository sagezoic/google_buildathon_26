import { describe, expect, it } from 'bun:test';
import { app } from '../src/app';

describe('Flats API Routes', () => {
  it('GET /api/flats/compare returns 400 if ids query parameter is missing', async () => {
    const res = await app.handle(new Request('http://localhost/api/flats/compare'));
    expect(res.status).toBe(400);

    const body = (await res.json()) as any;
    expect(body.error).toBe('Validation Error');
  });

  it('GET /api/flats/compare returns 400 if less than 2 ids are provided', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/flats/compare?ids=mb_1')
    );
    expect(res.status).toBe(400);

    const body = (await res.json()) as any;
    expect(body.message).toContain('between 2 and 5 society ids');
  });

  it('GET /api/flats/societies returns 400 on invalid sort parameter', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/flats/societies?sort=invalid_sort')
    );
    expect(res.status).toBe(400);
  });

  it('GET /api/flats/societies/mb_5020563 returns 200 with Marvel Brisa details', async () => {
    const res = await app.handle(new Request('http://localhost/api/flats/societies/mb_5020563'));
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.society).toBeDefined();
    expect(body.society.id).toBe('mb_5020563');
    expect(body.society.name).toBe('Marvel Brisa');
    expect(body.society.locality).toBe('Balewadi');
    expect(body.society.images.length).toBeGreaterThan(0);
    expect(body.society.bhk_prices.length).toBeGreaterThan(0);
  });

  it('GET /api/flats/societies returns 200 with list of societies', async () => {
    const res = await app.handle(new Request('http://localhost/api/flats/societies?city=pune'));
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.societies).toBeDefined();
    expect(body.societies.length).toBeGreaterThan(0);
    expect(body.total).toBeGreaterThan(0);
  });

  it('GET /api/flats/cities returns 200 with supported cities', async () => {
    const res = await app.handle(new Request('http://localhost/api/flats/cities'));
    expect(res.status).toBe(200);

    const body = (await res.json()) as any;
    expect(body.cities).toBeDefined();
    expect(body.cities.some((c: any) => c.slug === 'pune')).toBe(true);
  });

  it('GET /swagger exposes Flats endpoints documentation', async () => {
    const res = await app.handle(new Request('http://localhost/swagger/json'));
    if (res.status === 200) {
      const swaggerJson = (await res.json()) as any;
      expect(swaggerJson.paths['/api/flats/societies']).toBeDefined();
      expect(swaggerJson.paths['/api/flats/cities']).toBeDefined();
      expect(swaggerJson.paths['/api/flats/localities']).toBeDefined();
      expect(swaggerJson.paths['/api/flats/compare']).toBeDefined();
      expect(swaggerJson.paths['/api/flats/societies/{id}']).toBeDefined();
    }
  });
});
