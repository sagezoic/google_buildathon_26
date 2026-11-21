import { GoogleGenAI, ThinkingLevel, type Content } from '@google/genai';
import { env } from '../config/env';
import { ApiError, upstreamFailure } from '../lib/errors';
import { gcpClientOptions } from './gcp-auth';

export { ThinkingLevel };

export interface GenerateJsonOptions {
  model: string;
  system: string;
  contents: Content[];
  /** JSON Schema the reply must match (sent as responseJsonSchema). */
  schema: Record<string, unknown>;
  thinking?: ThinkingLevel;
  temperature?: number;
}

/**
 * Gemini on Vertex AI (Google Gen AI SDK, enterprise mode).
 * Auth follows gcpClientOptions(): an explicit key when one is configured,
 * otherwise Application Default Credentials (the Cloud Run service account).
 */
class GeminiServiceImpl {
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.client) {
      const { projectId, credentials, keyFilename } = gcpClientOptions();
      this.client = new GoogleGenAI({
        enterprise: true,
        project: projectId,
        location: env.VERTEX_LOCATION,
        googleAuthOptions: {
          projectId,
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
          ...(credentials ? { credentials } : {}),
          ...(keyFilename ? { keyFilename } : {}),
        },
      });
    }
    return this.client;
  }

  /** Generates a reply constrained to `schema` and returns it parsed. */
  public async generateJson<T>(opts: GenerateJsonOptions): Promise<T> {
    let text: string | undefined;
    try {
      const response = await this.getClient().models.generateContent({
        model: opts.model,
        contents: opts.contents,
        config: {
          systemInstruction: opts.system,
          responseMimeType: 'application/json',
          responseJsonSchema: opts.schema,
          temperature: opts.temperature ?? 0.2,
          ...(opts.thinking ? { thinkingConfig: { thinkingLevel: opts.thinking } } : {}),
        },
      });
      text = response.text;
    } catch (error) {
      throw toApiError(error, opts.model);
    }
    if (!text?.trim()) throw upstreamFailure('Gemini returned an empty reply. Try again.');
    try {
      return JSON.parse(text) as T;
    } catch {
      console.error('[GeminiService] Reply was not valid JSON:', text.slice(0, 500));
      throw upstreamFailure('Gemini returned a reply that could not be read. Try again.');
    }
  }
}

/** Maps SDK / HTTP failures to the API's error shape with a message the user can act on. */
function toApiError(error: unknown, model: string): ApiError {
  if (error instanceof ApiError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number })?.status;
  console.error(`[GeminiService] ${model} failed:`, message);
  if (status === 429 || /RESOURCE_EXHAUSTED|429/.test(message)) {
    return new ApiError(429, 'Too Many Requests', 'Gemini is busy right now (quota reached). Wait a minute and try again.');
  }
  if (status === 404 || /NOT_FOUND|404/.test(message)) {
    return upstreamFailure(`Gemini model ${model} is not available in ${env.VERTEX_LOCATION}. Check VERTEX_LOCATION and the model ID.`);
  }
  if (status === 403 || /PERMISSION_DENIED|403/.test(message)) {
    return upstreamFailure('The backend is not allowed to call Vertex AI. Check that aiplatform.googleapis.com is enabled and the service account has roles/aiplatform.user.');
  }
  return upstreamFailure(`Gemini could not complete the request: ${message}`);
}

export const GeminiService = new GeminiServiceImpl();
