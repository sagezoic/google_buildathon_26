export interface EnvConfig {
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL?: string;
  SCRAPER_DELAY_MS: number;
}

function parseEnv(): EnvConfig {
  const port = parseInt(process.env.PORT || '8080', 10);
  const host = process.env.HOST || '0.0.0.0';
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'];
  const databaseUrl = process.env.DATABASE_URL;
  const scraperDelayMs = parseInt(process.env.SCRAPER_DELAY_MS || '1000', 10);

  return {
    PORT: Number.isNaN(port) ? 8080 : port,
    HOST: host,
    NODE_ENV: nodeEnv,
    DATABASE_URL: databaseUrl,
    SCRAPER_DELAY_MS: Number.isNaN(scraperDelayMs) ? 1000 : scraperDelayMs,
  };
}

export const env = parseEnv();
