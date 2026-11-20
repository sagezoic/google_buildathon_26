import { TranslationServiceClient } from '@google-cloud/translate';
import { env } from '../config/env';
import { ApiError, upstreamFailure } from '../lib/errors';
import { gcpClientOptions } from './gcp-auth';

/** Translation v3 allows 30k codepoints per request; stay well under it. */
const CHUNK_LIMIT = 20_000;
const DETECT_SAMPLE = 2_000;

export interface TranslationResult {
  /** BCP-47 code of the source text, e.g. 'mr', 'hi', 'en'. */
  lang: string;
  confidence: number;
  /** English text, or null when the source is already English or empty. */
  translated: string | null;
}

/** Splits text on blank lines, then single lines, so each chunk stays under the request limit. */
export function chunkText(text: string, limit = CHUNK_LIMIT): string[] {
  const chunks: string[] = [];
  let current = '';
  const push = (piece: string) => {
    if (current && current.length + piece.length > limit) {
      chunks.push(current);
      current = '';
    }
    current += piece;
  };

  for (const para of text.split(/(\n+)/)) {
    if (para.length <= limit) {
      push(para);
      continue;
    }
    // A single line longer than the limit: hard split.
    for (let i = 0; i < para.length; i += limit) push(para.slice(i, i + limit));
  }
  if (current) chunks.push(current);
  return chunks;
}

class TranslateServiceImpl {
  private client: TranslationServiceClient | null = null;

  private getClient(): TranslationServiceClient {
    if (!this.client) this.client = new TranslationServiceClient(gcpClientOptions());
    return this.client;
  }

  private get parent(): string {
    return `projects/${env.GCP_PROJECT_ID}/locations/${env.TRANSLATE_LOCATION}`;
  }

  public async detectLanguage(text: string): Promise<{ lang: string; confidence: number }> {
    const sample = text.trim().slice(0, DETECT_SAMPLE);
    if (!sample) return { lang: 'und', confidence: 0 };

    try {
      const [res] = await this.getClient().detectLanguage({
        parent: this.parent,
        content: sample,
        mimeType: 'text/plain',
      });
      const best = [...(res.languages ?? [])].sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
      return { lang: best?.languageCode || 'und', confidence: best?.confidence ?? 0 };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw upstreamFailure(`Language detection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async translateToEnglish(text: string, sourceLang?: string): Promise<string> {
    const parts: string[] = [];
    try {
      for (const chunk of chunkText(text)) {
        if (!chunk.trim()) {
          parts.push(chunk);
          continue;
        }
        const [res] = await this.getClient().translateText({
          parent: this.parent,
          contents: [chunk],
          mimeType: 'text/plain',
          sourceLanguageCode: sourceLang && sourceLang !== 'und' ? sourceLang : undefined,
          targetLanguageCode: 'en',
        });
        parts.push(res.translations?.[0]?.translatedText ?? '');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw upstreamFailure(`Translation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    return parts.join('');
  }

  /** Detects the language and translates to English unless it already is English. */
  public async toEnglish(text: string): Promise<TranslationResult> {
    if (!text.trim()) return { lang: 'und', confidence: 0, translated: null };
    const { lang, confidence } = await this.detectLanguage(text);
    if (lang === 'en') return { lang, confidence, translated: null };
    return { lang, confidence, translated: await this.translateToEnglish(text, lang) };
  }
}

export const TranslateService = new TranslateServiceImpl();
