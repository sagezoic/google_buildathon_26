import Redis, { type RedisOptions } from 'ioredis';
import { env } from '../config/env';

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number | null; // null means no expiration
}

export interface CacheStatus {
  enabled: boolean;
  connected: boolean;
  provider: 'valkey' | 'memory' | 'disabled';
  keyCount?: number;
  error?: string;
}

class CacheService {
  private client: Redis | null = null;
  private memoryStore: Map<string, CacheEntry> = new Map();
  private isConnected = false;
  private hasLoggedConnectionError = false;
  private readonly isEnabled: boolean;

  constructor() {
    this.isEnabled = env.VALKEY_ENABLED;

    if (!this.isEnabled) {
      console.log('[realdha-cache] Valkey caching is explicitly disabled.');
      return;
    }

    this.initializeClient();
  }

  private initializeClient(): void {
    const valkeyUrl = env.VALKEY_URL;
    const valkeyHost = env.VALKEY_HOST;

    if (!valkeyUrl && !valkeyHost) {
      // In local development or testing when no Valkey instance is configured,
      // fallback to memory transparently without noisy connection attempts.
      return;
    }

    try {
      const redisOptions: RedisOptions = {
        lazyConnect: true,
        connectTimeout: 5000,
        maxRetriesPerRequest: 2,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > 5) {
            if (!this.hasLoggedConnectionError) {
              console.warn('[realdha-cache] Valkey connection retry limit reached. Operating in fallback mode.');
              this.hasLoggedConnectionError = true;
            }
            return null; // Stop reconnecting after 5 attempts
          }
          return Math.min(times * 500, 2000);
        },
      };

      if (env.VALKEY_PASSWORD) {
        redisOptions.password = env.VALKEY_PASSWORD;
      }

      if (env.VALKEY_TLS) {
        redisOptions.tls = {};
      }

      if (valkeyUrl) {
        this.client = new Redis(valkeyUrl, redisOptions);
      } else if (valkeyHost) {
        this.client = new Redis({
          ...redisOptions,
          host: valkeyHost,
          port: env.VALKEY_PORT,
        });
      }

      if (this.client) {
        this.client.on('connect', () => {
          this.isConnected = true;
          this.hasLoggedConnectionError = false;
          console.log('[realdha-cache] Connected to Google Valkey cache.');
        });

        this.client.on('ready', () => {
          this.isConnected = true;
        });

        this.client.on('error', (err: Error) => {
          this.isConnected = false;
          if (!this.hasLoggedConnectionError) {
            console.warn('[realdha-cache] Valkey connection warning (falling back to memory):', err.message);
            this.hasLoggedConnectionError = true;
          }
        });

        this.client.on('close', () => {
          this.isConnected = false;
        });

        // Eagerly connect in the background without blocking startup
        this.client.connect().catch((err) => {
          if (!this.hasLoggedConnectionError) {
            console.warn('[realdha-cache] Initial Valkey connect failed, using in-memory cache:', err.message);
            this.hasLoggedConnectionError = true;
          }
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[realdha-cache] Failed to initialize Valkey client:', msg);
      this.client = null;
    }
  }

  /**
   * Retrieves an item from cache.
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled) return null;

    if (this.client && this.isConnected) {
      try {
        const raw = await this.client.get(key);
        if (raw === null) return null;
        return JSON.parse(raw) as T;
      } catch (err) {
        // Fallback to memory on read failure
      }
    }

    // In-memory fallback
    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Stores an item in cache with an optional TTL in seconds.
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.isEnabled) return;

    const payload = JSON.stringify(value);

    if (this.client && this.isConnected) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.client.set(key, payload, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, payload);
        }
      } catch (err) {
        // Fallback to memory on write failure
      }
    }

    // Always keep memory fallback up to date
    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value, expiresAt });

    // Limit memory store size to 2000 entries
    if (this.memoryStore.size > 2000) {
      this.cleanupExpiredMemory();
    }
  }

  /**
   * Deletes one or more keys from cache.
   */
  async del(keyOrKeys: string | string[]): Promise<void> {
    if (!this.isEnabled) return;

    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    if (keys.length === 0) return;

    if (this.client && this.isConnected) {
      try {
        await this.client.del(...keys);
      } catch (err) {
        // Ignore
      }
    }

    for (const k of keys) {
      this.memoryStore.delete(k);
    }
  }

  /**
   * Invalidates all keys matching a prefix or pattern (e.g. "properties:prop_123*").
   * Uses non-blocking SCAN for Valkey to prevent blocking the event loop.
   */
  async delByPattern(pattern: string): Promise<void> {
    if (!this.isEnabled) return;

    // Remove from in-memory store
    const regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryStore.keys()) {
      if (regexPattern.test(key)) {
        this.memoryStore.delete(key);
      }
    }

    if (!this.client || !this.isConnected) return;

    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      // Invalidation error logged but does not throw
      console.warn('[realdha-cache] delByPattern error:', err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Cache-Aside wrapper: Returns cached data if available; otherwise executes fetcher, caches, and returns.
   */
  async wrap<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) {
      return fetcher();
    }

    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const fresh = await fetcher();
    // Cache the fresh result asynchronously without slowing down the immediate response
    if (fresh !== null && fresh !== undefined) {
      this.set(key, fresh, ttlSeconds).catch(() => {});
    }

    return fresh;
  }

  /**
   * Health status for the health check probe.
   */
  async getStatus(): Promise<CacheStatus> {
    if (!this.isEnabled) {
      return { enabled: false, connected: false, provider: 'disabled' };
    }

    if (this.client && this.isConnected) {
      try {
        const pong = await this.client.ping();
        if (pong === 'PONG') {
          return {
            enabled: true,
            connected: true,
            provider: 'valkey',
          };
        }
      } catch (err) {
        return {
          enabled: true,
          connected: false,
          provider: 'memory',
          keyCount: this.memoryStore.size,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    return {
      enabled: true,
      connected: this.client !== null && this.isConnected,
      provider: 'memory',
      keyCount: this.memoryStore.size,
    };
  }

  /**
   * Periodic or capacity-triggered cleanup of expired in-memory items.
   */
  private cleanupExpiredMemory(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Flushes all cache keys (useful in test suites).
   */
  async flush(): Promise<void> {
    this.memoryStore.clear();
    if (this.client && this.isConnected) {
      try {
        await this.client.flushdb();
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Graceful disconnect for container shutdown.
   */
  async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
      this.client = null;
    }
    this.memoryStore.clear();
  }
}

export const cacheService = new CacheService();
export { CacheService };
