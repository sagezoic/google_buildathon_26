import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { env } from '../config/env';
import { ApiError, unprocessable, upstreamFailure } from '../lib/errors';
import { gcpClientOptions } from './gcp-auth';

export interface OcrResult {
  text: string;
  pageCount: number;
}

class DocumentAiServiceImpl {
  private client: DocumentProcessorServiceClient | null = null;

  private getClient(): DocumentProcessorServiceClient {
    if (!this.client) {
      this.client = new DocumentProcessorServiceClient({
        ...gcpClientOptions(),
        apiEndpoint: `${env.DOCAI_LOCATION}-documentai.googleapis.com`,
      });
    }
    return this.client;
  }

  public isConfigured(): boolean {
    return !!env.DOCAI_PROCESSOR_ID;
  }

  /**
   * Reads a PDF or image with the Enterprise Document OCR processor (handles Devanagari).
   * Online processing allows 15 pages, or 30 for PDFs in imageless mode.
   */
  public async ocr(content: Buffer, mimeType: string): Promise<OcrResult> {
    if (!env.DOCAI_PROCESSOR_ID) {
      throw upstreamFailure('Document AI is not configured (DOCAI_PROCESSOR_ID is not set).');
    }

    const client = this.getClient();
    const name = client.processorPath(env.GCP_PROJECT_ID, env.DOCAI_LOCATION, env.DOCAI_PROCESSOR_ID);

    try {
      const [result] = await client.processDocument({
        name,
        rawDocument: { content: content.toString('base64'), mimeType },
        imagelessMode: mimeType === 'application/pdf',
      });
      const doc = result.document;
      return {
        text: doc?.text ?? '',
        pageCount: doc?.pages?.length ?? 0,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      if (/page limit|PAGE_LIMIT|exceed.*pages?/i.test(message)) {
        throw unprocessable('This document has too many pages to read online (maximum 30). Split it and upload the parts.');
      }
      console.error('[DocumentAiService] processDocument failed:', message);
      throw upstreamFailure(`Document AI could not read this file: ${message}`);
    }
  }
}

export const DocumentAiService = new DocumentAiServiceImpl();
