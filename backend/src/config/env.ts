export interface EnvConfig {
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

function parseEnv(): EnvConfig {
  const port = parseInt(process.env.PORT || '8080', 10);
  const host = process.env.HOST || '0.0.0.0';
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'];

  return {
    PORT: Number.isNaN(port) ? 8080 : port,
    HOST: host,
    NODE_ENV: nodeEnv,
  };
}

export const env = parseEnv();
