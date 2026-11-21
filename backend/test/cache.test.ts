import { describe, expect, it } from 'bun:test';
import { app } from '../src/app';
import { FlatsService } from '../src/modules/flats/service';
import { cacheService } from '../src/services/cache';

describe('Google Valkey Caching Layer & APIs', () => {
  it('stores and retrieves items correctly', async () => {
    await cacheService.set('test:key1', { message: 'hello valkey' });
    const cached = await cacheService.get<{ message: string }>('test:key1');
    expect(cached).toBeDefined();
    expect(cached?.message).toBe('hello valkey');
  });

  it('deletes items with del()', async () => {
    await cacheService.set('test:key_del', 'value123');
    expect(await cacheService.get<string>('test:key_del')).toBe('value123');

    await cacheService.del('test:key_del');
    expect(await cacheService.get<string>('test:key_del')).toBeNull();
  });

  it('deletes items by pattern with delByPattern()', async () => {
    await cacheService.set('properties:prop_xyz:details', { name: 'Flat 1' });
    await cacheService.set('properties:prop_xyz:doc:1', { file: 'doc.pdf' });
    await cacheService.set('properties:prop_abc:details', { name: 'Flat 2' });

    await cacheService.delByPattern('properties:prop_xyz*');

    expect(await cacheService.get('properties:prop_xyz:details')).toBeNull();
    expect(await cacheService.get('properties:prop_xyz:doc:1')).toBeNull();
    expect(await cacheService.get('properties:prop_abc:details')).toBeDefined();
  });

  it('cache-aside wrap() calls fetcher only once on cache miss', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { count: callCount, timestamp: Date.now() };
    };

    const first = await cacheService.wrap('test:wrap_key', 60, fetcher);
    expect(first.count).toBe(1);
    expect(callCount).toBe(1);

    const second = await cacheService.wrap('test:wrap_key', 60, fetcher);
    expect(second.count).toBe(1);
    expect(callCount).toBe(1); // Fetcher was not called second time!
  });

  it('GET /api/health includes cache status', async () => {
    const res = await app.handle(new Request('http://localhost/api/health'));
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      status: string;
      cache: {
        enabled: boolean;
        connected: boolean;
        provider: string;
      };
    };

    expect(body.cache).toBeDefined();
    expect(body.cache.enabled).toBe(true);
    expect(['valkey', 'memory', 'disabled']).toContain(body.cache.provider);
  });

  it('FlatsService.getCities uses cache effectively', async () => {
    const cities1 = await FlatsService.getCities();
    expect(cities1.length).toBeGreaterThan(0);

    // Second call reads from cache
    const cities2 = await FlatsService.getCities();
    expect(cities2).toEqual(cities1);
  });

  it('FlatsService.getSocieties caches search query results', async () => {
    const res1 = await FlatsService.getSocieties({ city: 'pune', limit: 5 });
    expect(res1.societies).toBeDefined();

    const res2 = await FlatsService.getSocieties({ city: 'pune', limit: 5 });
    expect(res2).toEqual(res1);
  });
});
