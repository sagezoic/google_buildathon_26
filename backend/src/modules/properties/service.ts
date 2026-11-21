import { and, asc, eq } from 'drizzle-orm';
import { env } from '../../config/env';
import { getDb } from '../../db/client';
import {
  properties,
  propertyDocuments,
  type NewProperty,
  type Property,
  type PropertyDocument,
} from '../../db/schema';
import { badRequest, notFound, tooLarge } from '../../lib/errors';
import { DocumentAiService } from '../../services/documentai';
import { StorageService } from '../../services/storage';
import { TranslateService } from '../../services/translate';
import { extractFields } from './extract';

export const SLOTS = ['extract', 'card', 'na', 'mutation', 'deed', 'agreement', 'extra'] as const;
export type Slot = (typeof SLOTS)[number];

export type PropertyInput = Partial<Omit<NewProperty, 'id' | 'created_at' | 'updated_at'>>;

/** Document fields returned to the client. Text is served separately by getDocument. */
export interface DocumentSummary {
  id: string;
  slot: string;
  filename: string;
  mime: string;
  size: number;
  status: string;
  pages: number | null;
  lang: string | null;
  fields: Record<string, unknown> | null;
  error: string | null;
}

export interface DocumentDetail extends DocumentSummary {
  originalText: string;
  translatedText: string | null;
}

/** Identifies the real file type from its first bytes; the extension and client MIME are not trusted. */
export function sniffMime(buf: Uint8Array): 'application/pdf' | 'image/jpeg' | 'image/png' | null {
  if (buf.length >= 5 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46 && buf[4] === 0x2d) {
    return 'application/pdf';
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  return null;
}

const safeName = (name: string) =>
  name.normalize('NFKD').replace(/[^\w.\-]+/g, '_').replace(/^\.+/, '').slice(-80) || 'file';

const summary = (d: PropertyDocument): DocumentSummary => ({
  id: d.id,
  slot: d.slot,
  filename: d.filename,
  mime: d.mime,
  size: d.size,
  status: d.status,
  pages: d.pages,
  lang: d.detected_lang,
  fields: d.fields,
  error: d.error,
});

const detail = (d: PropertyDocument): DocumentDetail => ({
  ...summary(d),
  originalText: d.original_text ?? '',
  translatedText: d.translated_text,
});

export const PropertiesService = {
  async create(input: PropertyInput & { type: string }): Promise<Property> {
    const [row] = await getDb()
      .insert(properties)
      .values({ ...input, id: `prop_${crypto.randomUUID()}` })
      .returning();
    return row;
  },

  async update(id: string, input: PropertyInput): Promise<Property> {
    const [row] = await getDb()
      .update(properties)
      .set({ ...input, updated_at: new Date() })
      .where(eq(properties.id, id))
      .returning();
    if (!row) throw notFound('Property not found.');
    return row;
  },

  async get(id: string): Promise<{ property: Property; documents: DocumentSummary[] }> {
    const db = getDb();
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    if (!property) throw notFound('Property not found.');
    const docs = await db
      .select()
      .from(propertyDocuments)
      .where(eq(propertyDocuments.property_id, id))
      .orderBy(asc(propertyDocuments.created_at));
    return { property, documents: docs.map(summary) };
  },

  async addDocument(propertyId: string, slot: string, file: File): Promise<DocumentSummary> {
    if (!(SLOTS as readonly string[]).includes(slot)) throw badRequest(`Unknown document slot "${slot}".`);
    const maxBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
    if (file.size > maxBytes) throw tooLarge(`${file.name} is larger than ${env.MAX_UPLOAD_MB} MB.`);
    if (file.size === 0) throw badRequest(`${file.name} is empty.`);

    const content = Buffer.from(await file.arrayBuffer());
    const mime = sniffMime(content);
    if (!mime) throw badRequest(`${file.name} is not a PDF, JPG or PNG.`);

    const db = getDb();
    const [property] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, propertyId));
    if (!property) throw notFound('Property not found.');

    const id = `doc_${crypto.randomUUID()}`;
    const gcsPath = `properties/${propertyId}/${slot}/${id}-${safeName(file.name)}`;
    await StorageService.uploadFile({ filename: gcsPath, content, contentType: mime });

    // A single-document slot is replaced; "extra" accumulates.
    const previous =
      slot === 'extra'
        ? []
        : await db
            .select()
            .from(propertyDocuments)
            .where(and(eq(propertyDocuments.property_id, propertyId), eq(propertyDocuments.slot, slot)));

    const [row] = await db
      .insert(propertyDocuments)
      .values({ id, property_id: propertyId, slot, filename: file.name, mime, size: file.size, gcs_path: gcsPath })
      .returning();

    for (const old of previous) {
      await db.delete(propertyDocuments).where(eq(propertyDocuments.id, old.id));
      await StorageService.deleteFile(old.gcs_path).catch((e) =>
        console.warn('[properties] Could not delete replaced file', old.gcs_path, e),
      );
    }
    return summary(row);
  },

  async deleteDocument(propertyId: string, docId: string): Promise<void> {
    const doc = await this.findDocument(propertyId, docId);
    await getDb().delete(propertyDocuments).where(eq(propertyDocuments.id, doc.id));
    await StorageService.deleteFile(doc.gcs_path).catch((e) =>
      console.warn('[properties] Could not delete file', doc.gcs_path, e),
    );
  },

  async findDocument(propertyId: string, docId: string): Promise<PropertyDocument> {
    const [doc] = await getDb()
      .select()
      .from(propertyDocuments)
      .where(and(eq(propertyDocuments.id, docId), eq(propertyDocuments.property_id, propertyId)));
    if (!doc) throw notFound('Document not found.');
    return doc;
  },

  async getDocument(propertyId: string, docId: string): Promise<DocumentDetail> {
    return detail(await this.findDocument(propertyId, docId));
  },

  /** The stored original, for viewing in the browser. The MIME type is the sniffed one saved at upload. */
  async getDocumentFile(propertyId: string, docId: string): Promise<{ content: Buffer; mime: string; filename: string }> {
    const doc = await this.findDocument(propertyId, docId);
    const { content } = await StorageService.downloadFile(doc.gcs_path);
    return { content, mime: doc.mime, filename: doc.filename };
  },

  /** Download → OCR → detect language → translate to English → extract fields → persist. Idempotent unless `force`. */
  async processDocument(propertyId: string, docId: string, force = false): Promise<DocumentDetail> {
    const doc = await this.findDocument(propertyId, docId);
    if (doc.status === 'processed' && !force) return detail(doc);

    const db = getDb();
    const setDoc = (values: Partial<PropertyDocument>) =>
      db
        .update(propertyDocuments)
        .set({ ...values, updated_at: new Date() })
        .where(eq(propertyDocuments.id, docId))
        .returning();

    await setDoc({ status: 'processing', error: null });
    try {
      const { content } = await StorageService.downloadFile(doc.gcs_path);
      const ocr = await DocumentAiService.ocr(content, doc.mime);
      if (!ocr.text.trim()) throw badRequest('No readable text was found in this document.');

      const translation = await TranslateService.toEnglish(ocr.text);
      const fields = extractFields(ocr.text, translation.translated ?? ocr.text);

      const [row] = await setDoc({
        status: 'processed',
        pages: ocr.pageCount,
        detected_lang: translation.lang,
        original_text: ocr.text,
        translated_text: translation.translated,
        fields: { ...fields },
        error: null,
      });
      return detail(row);
    } catch (error) {
      await setDoc({ status: 'failed', error: error instanceof Error ? error.message : String(error) }).catch(() => {});
      throw error;
    }
  },
};
