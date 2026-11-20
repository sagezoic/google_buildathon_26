import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { env } from '../config/env';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const DEFAULT_CACHE_DIR = path.resolve(__dirname, '../../.cache');

export interface FetchOptions {
  delayMs?: number;
  cacheDir?: string;
  subDir?: string;
  maxRetries?: number;
}

/**
 * Concurrency limiter / semaphore to restrict parallel outgoing requests.
 */
class Semaphore {
  private active = 0;
  private queue: Array<() => void> = [];

  constructor(private readonly maxConcurrency: number) {}

  async acquire(): Promise<void> {
    if (this.active < this.maxConcurrency) {
      this.active++;
      return;
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.active++;
        resolve();
      });
    });
  }

  release(): void {
    this.active--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const defaultLimiter = new Semaphore(3);

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hashUrl(url: string): string {
  return crypto.createHash('sha1').update(url).digest('hex');
}

/**
 * Fetches an HTTP URL with:
 * - Desktop User-Agent
 * - Gzip disk cache in backend/.cache/ (keyed by SHA1 of URL)
 * - 3 retries with backoff (5s, 10s, 15s)
 * - Delay between requests (SCRAPER_DELAY_MS)
 * - Concurrency limited to 3
 */
export async function fetchWithCache(
  url: string,
  options: FetchOptions = {}
): Promise<string | null> {
  const cacheBase = options.cacheDir || DEFAULT_CACHE_DIR;
  const targetDir = options.subDir ? path.join(cacheBase, options.subDir) : cacheBase;
  const cacheKey = hashUrl(url);
  const cacheFile = path.join(targetDir, `${cacheKey}.html.gz`);

  // 1. Check disk cache
  try {
    const stat = await fs.stat(cacheFile);
    if (stat.size > 200) {
      const compressed = await fs.readFile(cacheFile);
      const decompressed = zlib.gunzipSync(compressed);
      return decompressed.toString('utf-8');
    }
  } catch {
    // Cache miss or read failure, proceed to fetch
  }

  // 2. Concurrency limiting
  await defaultLimiter.acquire();
  try {
    const maxRetries = options.maxRetries ?? 3;
    const delay = options.delayMs ?? env.SCRAPER_DELAY_MS;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': USER_AGENT,
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: AbortSignal.timeout(40000),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const html = await response.text();

        // Write to cache
        try {
          await fs.mkdir(targetDir, { recursive: true });
          const compressed = zlib.gzipSync(Buffer.from(html, 'utf-8'), { level: 9 });
          await fs.writeFile(cacheFile, compressed);
        } catch (cacheErr) {
          console.warn(`[scraper/http] Failed writing cache for ${url}:`, cacheErr);
        }

        if (delay > 0) {
          await sleep(delay);
        }

        return html;
      } catch (err) {
        console.warn(`[scraper/http] Attempt ${attempt} failed for ${url}:`, err);
        if (attempt < maxRetries) {
          await sleep(5000 * attempt);
        }
      }
    }

    return null;
  } finally {
    defaultLimiter.release();
  }
}
