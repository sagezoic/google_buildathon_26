import { afterAll, beforeAll, describe, expect, it, spyOn } from 'bun:test';
import { eq } from 'drizzle-orm';
import { app } from '../src/app';
import { closeDb, getDb, testDbConnection } from '../src/db/client';
import { properties } from '../src/db/schema';
import {
  chatSchema,
  checkSchema,
  documentBlock,
  normalizeChat,
  normalizeReport,
  type DocContext,
} from '../src/modules/ai/report';
import { DocumentAiService } from '../src/services/documentai';
import { GeminiService, type GenerateJsonOptions } from '../src/services/gemini';
import { StorageService } from '../src/services/storage';
import { TranslateService } from '../src/services/translate';

const dbCheck = await testDbConnection();
const hasDatabase = dbCheck.connected;
const PDF = new TextEncoder().encode('%PDF-1.7\n%fake');

const doc = (ref: string, over: Partial<DocContext> = {}): DocContext => ({
  ref, id: `doc_${ref}`, slot: 'agreement', filename: `${ref}.pdf`, pages: 3, lang: 'mr',
  originalText: 'मूळ मजकूर', translatedText: 'Original text', attached: true, ...over,
});

const finding = (severity: string, document = 'D1', title = `${severity} finding`) => ({
  title, titleShort: title, severity, body: 'Body.', bodyShort: 'Body.', quote: '"…दोन वारस…"',
  quoteEn: '"…two heirs…"', document, page: 3, location: 'clause 2',
});

describe('normalizeReport', () => {
  const docs = [doc('D1'), doc('D2', { filename: 'NOC.jpg', slot: 'extra' })];

  it('derives STOP from any high finding and sorts high, medium, clear', () => {
    const r = normalizeReport({ title: 'Resale flat', headline: 'h', findings: [finding('clear'), finding('high'), finding('medium', 'D2')] }, docs);
    expect(r.verdict).toBe('stop');
    expect(r.findings.map((f) => f.severity)).toEqual(['high', 'medium', 'clear']);
    expect(r.counts).toEqual({ high: 1, medium: 1, clear: 1 });
    expect(r.findings[1].source).toEqual({ documentId: 'doc_D2', filename: 'NOC.jpg', slot: 'extra', page: 3, location: 'clause 2' });
  });

  it('gives PROCEED with no high finding, and ignores a verdict the model made up', () => {
    const r = normalizeReport({ verdict: 'stop', findings: [finding('medium'), finding('clear')] } as never, docs);
    expect(r.verdict).toBe('proceed');
    expect(r.headline).toContain('Nothing in these documents stops');
  });

  it('drops findings that cite an unknown document or have a bad severity', () => {
    const r = normalizeReport({ findings: [finding('high', 'D9'), finding('critical'), finding('clear')] }, docs);
    expect(r.findings).toHaveLength(1);
    expect(r.verdict).toBe('proceed');
  });

  it('rejects a non-positive or fractional page', () => {
    const r = normalizeReport({ findings: [{ ...finding('clear'), page: 0 }, { ...finding('medium'), page: 2.5 }] }, docs);
    expect(r.findings.every((f) => f.source.page === null)).toBe(true);
  });
});

describe('normalizeChat', () => {
  const docs = [doc('D1')];

  it('keeps cited answers and de-duplicates citations', () => {
    const c = normalizeChat({ answer: 'Prakash Kulkarni.', found: true, citations: [{ document: 'D1', page: 1, quote: 'x' }, { document: 'D1', page: 1, quote: 'y' }] }, docs);
    expect(c.found).toBe(true);
    expect(c.citations).toHaveLength(1);
    expect(c.citations[0].documentId).toBe('doc_D1');
  });

  it('treats an answer with no valid citation as not found', () => {
    const c = normalizeChat({ answer: 'Maybe 2015.', found: true, citations: [{ document: 'D7', page: 1, quote: 'x' }] }, docs);
    expect(c.found).toBe(false);
    expect(c.citations).toEqual([]);
  });
});

describe('prompt building', () => {
  it('limits cited documents to the refs supplied', () => {
    const s = checkSchema(['D1', 'D2']) as { properties: { findings: { items: { properties: { document: { enum: string[] } } } } } };
    expect(s.properties.findings.items.properties.document.enum).toEqual(['D1', 'D2']);
    const c = chatSchema([]) as { properties: { citations: { items: { properties: { document: { enum: string[] } } } } } };
    expect(c.properties.citations.items.properties.document.enum).toEqual(['none']);
  });

  it('escapes file names so a document cannot close its own tag', () => {
    const block = documentBlock(doc('D1', { filename: 'a"><evil>.pdf', translatedText: null }));
    expect(block).toContain('filename="a&quot;&gt;&lt;evil&gt;.pdf"');
    expect(block).not.toContain('<english_translation>');
  });
});

const json = (method: string, body: unknown) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

describe('AI API validation (no database needed)', () => {
  it('rejects an unknown check kind', async () => {
    const res = await app.handle(new Request('http://localhost/api/properties/prop_x/checks', json('POST', { kind: 'castle' })));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { code: number }).code).toBe(400);
  });

  it('rejects an empty chat message', async () => {
    const res = await app.handle(new Request('http://localhost/api/properties/prop_x/chat', json('POST', { message: '' })));
    expect(res.status).toBe(400);
  });
});

describe.skipIf(!hasDatabase)('AI API with database', () => {
  let propertyId = '';
  const calls: GenerateJsonOptions[] = [];
  const spies = [
    spyOn(StorageService, 'uploadFile').mockImplementation(async (o) => ({ filename: o.filename, bucket: 'test', size: 1, contentType: o.contentType ?? '', publicUrl: '' })),
    spyOn(StorageService, 'downloadFile').mockImplementation(async () => ({ content: Buffer.from(PDF), contentType: 'application/pdf', size: PDF.length })),
    spyOn(StorageService, 'deleteFile').mockImplementation(async (f) => ({ success: true, filename: f })),
    spyOn(DocumentAiService, 'ocr').mockImplementation(async () => ({ text: 'करारनामा: लता पाटील व अनिल पाटील, तीन वारसांपैकी दोन', pageCount: 3 })),
    spyOn(TranslateService, 'toEnglish').mockImplementation(async () => ({ lang: 'mr', confidence: 1, translated: 'Agreement: Lata Patil and Anil Patil, two of the three heirs' })),
    spyOn(GeminiService, 'generateJson').mockImplementation(async (opts: GenerateJsonOptions) => {
      calls.push(opts);
      if (opts.model && JSON.stringify(opts.schema).includes('headline')) {
        return { title: 'Resale flat · Flat 702', titleShort: 'Flat 702', headline: 'A co-owner has not released their share.', headlineShort: 'Do not pay yet.', findings: [finding('high'), finding('clear')] } as never;
      }
      return { answer: 'Two of the three heirs signed.', found: true, citations: [{ document: 'D1', page: 3, quote: 'तीन वारसांपैकी दोन' }] } as never;
    }),
  ];

  beforeAll(async () => {
    const res = await app.handle(new Request('http://localhost/api/properties', json('POST', { type: 'apartment', address: 'Flat 702, Sai Residency' })));
    propertyId = ((await res.json()) as { id: string }).id;
  });

  afterAll(async () => {
    spies.forEach((s) => s.mockRestore());
    if (propertyId) await getDb().delete(properties).where(eq(properties.id, propertyId));
    await closeDb();
  });

  it('refuses a check before any document is uploaded', async () => {
    const res = await app.handle(new Request(`http://localhost/api/properties/${propertyId}/checks`, json('POST', { kind: 'resale' })));
    expect(res.status).toBe(400);
  });

  it('OCRs unread documents, sends the file to Gemini and stores a STOP report', async () => {
    const form = new FormData();
    form.set('slot', 'agreement');
    form.set('file', new File([PDF], 'Agreement for sale.pdf'));
    await app.handle(new Request(`http://localhost/api/properties/${propertyId}/documents`, { method: 'POST', body: form }));

    const res = await app.handle(new Request(`http://localhost/api/properties/${propertyId}/checks`, json('POST', { kind: 'resale' })));
    expect(res.status).toBe(200);
    const check = (await res.json()) as { id: string; status: string; verdict: string; report: { counts: { high: number }; findings: { source: { filename: string } }[] } };
    expect(check.status).toBe('done');
    expect(check.verdict).toBe('stop');
    expect(check.report.counts.high).toBe(1);
    expect(check.report.findings[0].source.filename).toBe('Agreement for sale.pdf');

    const parts = calls[0].contents[0].parts ?? [];
    expect(parts.some((p) => p.inlineData?.mimeType === 'application/pdf')).toBe(true);
    expect(parts.some((p) => p.text?.includes('two of the three heirs'))).toBe(true);

    const latest = (await (await app.handle(new Request(`http://localhost/api/properties/${propertyId}/checks/latest`))).json()) as { id: string };
    expect(latest.id).toBe(check.id);
  });

  it('answers chat from the documents, stores both turns and clears them', async () => {
    const res = await app.handle(new Request(`http://localhost/api/properties/${propertyId}/chat`, json('POST', { message: 'Did all heirs sign?' })));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { answer: { role: string; found: boolean; citations: { page: number }[] } };
    expect(body.answer.role).toBe('model');
    expect(body.answer.found).toBe(true);
    expect(body.answer.citations[0].page).toBe(3);
    // The latest check report is part of the chat grounding.
    expect(calls.at(-1)!.system).toContain('<latest_check_report>');

    const list = (await (await app.handle(new Request(`http://localhost/api/properties/${propertyId}/chat`))).json()) as { messages: { role: string }[] };
    expect(list.messages.map((m) => m.role)).toEqual(['user', 'model']);

    await app.handle(new Request(`http://localhost/api/properties/${propertyId}/chat`, { method: 'DELETE' }));
    const after = (await (await app.handle(new Request(`http://localhost/api/properties/${propertyId}/chat`))).json()) as { messages: unknown[] };
    expect(after.messages).toEqual([]);
  });

  it('returns 404 for a check of another property', async () => {
    const res = await app.handle(new Request(`http://localhost/api/properties/${propertyId}/checks/chk_missing`));
    expect(res.status).toBe(404);
  });
});
