import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from '../config/env';

// A type alias (not an interface) so it is assignable to the SDK clients' ClientOptions.
export type GcpClientOptions = {
  projectId: string;
  credentials?: Record<string, unknown>;
  keyFilename?: string;
};

/**
 * Resolves client options shared by every Google Cloud client (Storage, Document AI, Translation).
 * Order: inline JSON/base64 key, explicit client email + private key, key file path.
 * When none is set the options carry only the project, so clients fall back to
 * Application Default Credentials (the Cloud Run service account).
 */
export function gcpClientOptions(): GcpClientOptions {
  const options: GcpClientOptions = { projectId: env.GCP_PROJECT_ID };

  if (env.GCP_SERVICE_ACCOUNT_KEY) {
    try {
      const raw = env.GCP_SERVICE_ACCOUNT_KEY.trim();
      const decoded = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      options.credentials = parsed;
    } catch (error) {
      console.warn('[gcp-auth] Error parsing GCP_SERVICE_ACCOUNT_KEY:', error);
    }
  } else if (env.GCS_CLIENT_EMAIL && env.GCS_PRIVATE_KEY) {
    options.credentials = {
      client_email: env.GCS_CLIENT_EMAIL,
      private_key: env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  } else if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    const candidatePath = resolve(process.cwd(), env.GOOGLE_APPLICATION_CREDENTIALS);
    const resolvedPath = existsSync(candidatePath)
      ? candidatePath
      : existsSync(env.GOOGLE_APPLICATION_CREDENTIALS)
        ? env.GOOGLE_APPLICATION_CREDENTIALS
        : null;

    if (resolvedPath) {
      try {
        options.credentials = JSON.parse(readFileSync(resolvedPath, 'utf8'));
      } catch {
        options.keyFilename = resolvedPath;
      }
    }
  }

  return options;
}
