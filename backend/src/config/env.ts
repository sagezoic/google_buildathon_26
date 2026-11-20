export interface EnvConfig {
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL?: string;
  DATABASE_URL_DIRECT?: string;
  SCRAPER_DELAY_MS: number;
  GCP_PROJECT_ID: string;
  GCS_BUCKET_NAME: string;
  GOOGLE_APPLICATION_CREDENTIALS?: string;
  GCP_SERVICE_ACCOUNT_KEY?: string;
  GCS_CLIENT_EMAIL?: string;
  GCS_PRIVATE_KEY?: string;
  DOCAI_LOCATION: string;
  DOCAI_PROCESSOR_ID?: string;
  TRANSLATE_LOCATION: string;
  MAX_UPLOAD_MB: number;
}

function parseEnv(): EnvConfig {
  const port = parseInt(process.env.PORT || '8080', 10);
  const host = process.env.HOST || '0.0.0.0';
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['NODE_ENV'];
  const databaseUrl = process.env.DATABASE_URL;
  const databaseUrlDirect = process.env.DATABASE_URL_DIRECT;
  const scraperDelayMs = parseInt(process.env.SCRAPER_DELAY_MS || '1000', 10);
  const gcpProjectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'trusty-bearing-515217-f0';
  const gcsBucketName = process.env.GCS_BUCKET_NAME || 'realdha-storage-trusty-bearing-515217-f0';
  const googleAppCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const gcpServiceAccountKey = process.env.GCP_SERVICE_ACCOUNT_KEY || process.env.GCP_SERVICE_ACCOUNT_KEY_BASE64;
  const gcsClientEmail = process.env.GCS_CLIENT_EMAIL;
  const gcsPrivateKey = process.env.GCS_PRIVATE_KEY ? process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

  const maxUploadMb = parseInt(process.env.MAX_UPLOAD_MB || '20', 10);

  return {
    DOCAI_LOCATION: process.env.DOCAI_LOCATION || 'us',
    DOCAI_PROCESSOR_ID: process.env.DOCAI_PROCESSOR_ID,
    TRANSLATE_LOCATION: process.env.TRANSLATE_LOCATION || 'global',
    MAX_UPLOAD_MB: Number.isNaN(maxUploadMb) ? 20 : maxUploadMb,
    PORT: Number.isNaN(port) ? 8080 : port,
    HOST: host,
    NODE_ENV: nodeEnv,
    DATABASE_URL: databaseUrl,
    DATABASE_URL_DIRECT: databaseUrlDirect,
    SCRAPER_DELAY_MS: Number.isNaN(scraperDelayMs) ? 1000 : scraperDelayMs,
    GCP_PROJECT_ID: gcpProjectId,
    GCS_BUCKET_NAME: gcsBucketName,
    GOOGLE_APPLICATION_CREDENTIALS: googleAppCredentials,
    GCP_SERVICE_ACCOUNT_KEY: gcpServiceAccountKey,
    GCS_CLIENT_EMAIL: gcsClientEmail,
    GCS_PRIVATE_KEY: gcsPrivateKey,
  };
}

export const env = parseEnv();
