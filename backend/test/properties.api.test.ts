import { afterAll, beforeAll, describe, expect, it, spyOn } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { app } from '../src/app';
import { getDb, closeDb } from '../src/db/client';
import { properties } from '../src/db/schema';
import { DocumentAiService } from '../src/services/documentai';
import { StorageService } from '../src/services/storage';
import { TranslateService } from '../src/services/translate';
import { eq } from 'drizzle-orm';

const hasDatabase = !!process.env.DATABASE_URL;
const mrText = readFileSync(join(import.meta.dir, 'fixtures/712_extract_mr.txt'), 'utf8');
const PDF = new TextEncoder().encode('%PDF-1.7\n%fake');

const json = (body: unknown) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

function upload(propertyId: string, slot: string, bytes: Uint8Array, name: string) {
  const form = new FormData();
  form.set('slot', slot);
  form.set('file', new File([bytes], name));
  return app.handle(new Request(`http://localhost/api/properties/${propertyId}/documents`, { method: 'POST', body: form }));
}

// Spies on the singletons (not mock.module) so other test files keep the real services.
const spies = [
  spyOn(StorageService, 'uploadFile').mockImplementation(async (o) => ({
    filename: o.filename, bucket: 'test', size: 1, contentType: o.contentType ?? '', publicUrl: '',
  })),
  spyOn(StorageService, 'downloadFile').mockImplementation(async () => ({ content: Buffer.from(PDF), contentType: 'application/pdf', size: PDF.length })),
  spyOn(StorageService, 'deleteFile').mockImplementation(async (f) => ({ success: true, filename: f })),
];
const ocr = spyOn(DocumentAiService, 'ocr');
const toEnglish = spyOn(TranslateService, 'toEnglish');

afterAll(async () => {
  [...spies, ocr, toEnglish].forEach((s) => s.mockRestore());
  if (hasDatabase) await closeDb();
});

describe('Properties API validation (no database needed)', () => {
  it('rejects an unknown property type', async () => {
    const res = await app.handle(new Request('http://localhost/api/properties', json({ type: 'castle' })));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: number }).code).toBe(400);
  });

  it('rejects a file that is not PDF/JPG/PNG even if named .pdf', async () => {
    const res = await upload('prop_x', 'extract', new TextEncoder().encode('MZ not a pdf'), 'evil.pdf');
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string; message: string; code: number };
    expect(body.message).toContain('not a PDF, JPG or PNG');
  });

  it('rejects an unknown slot', async () => {
    const res = await upload('prop_x', 'passport', PDF, 'a.pdf');
    expect(res.status).toBe(400);
  });
});

describe.skipIf(!hasDatabase)('Properties API with database', () => {
  let propertyId = '';

  beforeAll(async () => {
    const res = await app.handle(new Request('http://localhost/api/properties', json({ type: 'plot', gat: '112/2', village: 'Kusgaon' })));
    expect(res.status).toBe(200);
    propertyId = ((await res.json()) as { id: string }).id;
  });

  afterAll(async () => {
    if (propertyId) await getDb().delete(properties).where(eq(properties.id, propertyId));
  });

  it('uploads, then replaces a document in the same slot', async () => {
    const first = (await (await upload(propertyId, 'extract', PDF, '7-12.pdf')).json()) as { id: string };
    const second = (await (await upload(propertyId, 'extract', PDF, '7-12-v2.pdf')).json()) as { id: string; filename: string };
    expect(second.id).not.toBe(first.id);

    const got = (await (await app.handle(new Request(`http://localhost/api/properties/${propertyId}`))).json()) as {
      documents: { slot: string; filename: string }[];
    };
    const extract = got.documents.filter((d) => d.slot === 'extract');
    expect(extract).toHaveLength(1);
    expect(extract[0].filename).toBe('7-12-v2.pdf');
  });

  it('processes a Marathi document: OCR, detect, translate, extract', async () => {
    ocr.mockResolvedValue({ text: mrText, pageCount: 2 });
    toEnglish.mockResolvedValue({ lang: 'mr', confidence: 0.99, translated: 'Name of occupant: Prakash Kulkarni' });

    const doc = (await (await upload(propertyId, 'card', PDF, 'card.pdf')).json()) as { id: string };
    const res = await app.handle(new Request(`http://localhost/api/properties/${propertyId}/documents/${doc.id}/process`, { method: 'POST' }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; lang: string; pages: number; translatedText: string; fields: { gat: string; ownerEn: string } };
    expect(body.status).toBe('processed');
    expect(body.lang).toBe('mr');
    expect(body.pages).toBe(2);
    expect(body.translatedText).toContain('Prakash');
    expect(body.fields.gat).toBe('112/2');
    expect(body.fields.ownerEn).toBe('Prakash Kulkarni');
  });

  it('skips translation text for English documents', async () => {
    ocr.mockResolvedValue({ text: 'Gat No. 112/2\nTotal area: 465 sq m', pageCount: 1 });
    toEnglish.mockResolvedValue({ lang: 'en', confidence: 1, translated: null });

    const doc = (await (await upload(propertyId, 'extra', PDF, 'agreement.pdf')).json()) as { id: string };
    const body = (await (await app.handle(new Request(`http://localhost/api/properties/${propertyId}/documents/${doc.id}/process`, { method: 'POST' }))).json()) as {
      lang: string; translatedText: string | null; fields: { areaSqm: number };
    };
    expect(body.lang).toBe('en');
    expect(body.translatedText).toBeNull();
    expect(body.fields.areaSqm).toBe(465);
  });

  it('marks the document failed when Document AI errors, and keeps the error shape', async () => {
    ocr.mockRejectedValue(Object.assign(new Error('boom'), { name: 'ApiError' }));
    const doc = (await (await upload(propertyId, 'na', PDF, 'na.pdf')).json()) as { id: string };
    const res = await app.handle(new Request(`http://localhost/api/properties/${propertyId}/documents/${doc.id}/process`, { method: 'POST' }));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string; message: string; code: number };
    expect(body.code).toBe(500);

    const after = (await (await app.handle(new Request(`http://localhost/api/properties/${propertyId}/documents/${doc.id}`))).json()) as { status: string; error: string };
    expect(after.status).toBe('failed');
    expect(after.error).toContain('boom');
  });

  it('returns 404 for an unknown property', async () => {
    const res = await app.handle(new Request('http://localhost/api/properties/prop_missing'));
    expect(res.status).toBe(404);
  });
});
