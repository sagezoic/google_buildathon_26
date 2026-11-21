import type { Content, Part } from '@google/genai';
import { and, asc, desc, eq } from 'drizzle-orm';
import { env } from '../../config/env';
import { getDb } from '../../db/client';
import {
  properties,
  propertyChatMessages,
  propertyChecks,
  propertyDocuments,
  type Property,
  type PropertyChatMessage,
  type PropertyCheck,
  type PropertyDocument,
} from '../../db/schema';
import { badRequest, notFound } from '../../lib/errors';
import { GeminiService, ThinkingLevel } from '../../services/gemini';
import { StorageService } from '../../services/storage';
import { PropertiesService } from '../properties/service';
import {
  CHAT_SYSTEM,
  CHECK_SYSTEM,
  chatSchema,
  checkInstruction,
  checkSchema,
  documentBlock,
  factsBlock,
  normalizeChat,
  normalizeReport,
  type ChatCitation,
  type CheckKind,
  type CheckReport,
  type DocContext,
} from './report';

/** Raw file bytes sent inline per check. Larger sets fall back to OCR text for the remaining files. */
const INLINE_BUDGET_BYTES = 15 * 1024 * 1024;
/** Chat turns replayed to Gemini as history. */
const HISTORY_TURNS = 12;
/** Cap on document text per chat request (characters). */
const CHAT_TEXT_BUDGET = 400_000;

export interface CheckDto {
  id: string;
  propertyId: string;
  kind: string;
  status: string;
  verdict: 'stop' | 'proceed' | null;
  report: CheckReport | null;
  docIds: string[];
  model: string;
  error: string | null;
  createdAt: string;
}

export interface ChatMessageDto {
  id: string;
  role: 'user' | 'model';
  text: string;
  found: boolean | null;
  citations: ChatCitation[];
  createdAt: string;
}

const checkDto = (c: PropertyCheck): CheckDto => ({
  id: c.id,
  propertyId: c.property_id,
  kind: c.kind,
  status: c.status,
  verdict: c.verdict === 'stop' || c.verdict === 'proceed' ? c.verdict : null,
  report: (c.report as CheckReport | null) ?? null,
  docIds: c.doc_ids,
  model: c.model,
  error: c.error,
  createdAt: c.created_at.toISOString(),
});

const messageDto = (m: PropertyChatMessage): ChatMessageDto => ({
  id: m.id,
  role: m.role === 'model' ? 'model' : 'user',
  text: m.text,
  found: m.found,
  citations: (m.citations as ChatCitation[] | null) ?? [],
  createdAt: m.created_at.toISOString(),
});

async function loadProperty(propertyId: string): Promise<Property> {
  const [property] = await getDb().select().from(properties).where(eq(properties.id, propertyId));
  if (!property) throw notFound('Property not found.');
  return property;
}

async function loadDocuments(propertyId: string): Promise<PropertyDocument[]> {
  return getDb()
    .select()
    .from(propertyDocuments)
    .where(eq(propertyDocuments.property_id, propertyId))
    .orderBy(asc(propertyDocuments.created_at));
}

const toContext = (d: PropertyDocument, i: number, attached: boolean): DocContext => ({
  ref: `D${i + 1}`,
  id: d.id,
  slot: d.slot,
  filename: d.filename,
  pages: d.pages,
  lang: d.detected_lang,
  originalText: d.original_text ?? '',
  translatedText: d.translated_text,
  attached,
});

export const AiService = {
  /**
   * Runs a Gemini document check over every document of the property.
   * Unprocessed documents are OCR'd and translated first; Gemini then reads each file and its text.
   */
  async runCheck(propertyId: string, kind: CheckKind): Promise<CheckDto> {
    const property = await loadProperty(propertyId);
    let docs = await loadDocuments(propertyId);
    if (!docs.length) throw badRequest('Upload at least one document before starting a check.');

    // OCR anything not read yet. A file Document AI cannot read is still sent to Gemini as a file.
    for (const d of docs.filter((x) => x.status !== 'processed')) {
      await PropertiesService.processDocument(propertyId, d.id).catch((e) =>
        console.warn('[ai] OCR failed, sending the file only:', d.id, e instanceof Error ? e.message : e),
      );
    }
    docs = await loadDocuments(propertyId);

    const db = getDb();
    const [row] = await db
      .insert(propertyChecks)
      .values({
        id: `chk_${crypto.randomUUID()}`,
        property_id: propertyId,
        kind,
        doc_ids: docs.map((d) => d.id),
        model: env.GEMINI_VERIFY_MODEL,
      })
      .returning();
    const finish = (values: Partial<PropertyCheck>) =>
      db
        .update(propertyChecks)
        .set({ ...values, updated_at: new Date() })
        .where(eq(propertyChecks.id, row.id))
        .returning();

    try {
      // Attach files smallest first so as many as possible fit the inline budget.
      let budget = INLINE_BUDGET_BYTES;
      const attach = new Set<string>();
      for (const d of [...docs].sort((a, b) => a.size - b.size)) {
        if (d.size <= budget) { attach.add(d.id); budget -= d.size; }
      }
      const contexts = docs.map((d, i) => toContext(d, i, attach.has(d.id)));
      const readable = contexts.filter((c) => c.attached || c.originalText.trim());
      if (!readable.length) throw badRequest('None of the documents could be read. Upload clearer scans and try again.');

      const parts: Part[] = [{ text: factsBlock(property) }];
      for (const c of readable) {
        if (c.attached) {
          const doc = docs.find((d) => d.id === c.id)!;
          const { content } = await StorageService.downloadFile(doc.gcs_path);
          parts.push({ text: `File for ${c.ref} (${c.filename}):` });
          parts.push({ inlineData: { mimeType: doc.mime, data: content.toString('base64') } });
        }
        parts.push({ text: documentBlock(c) });
      }
      parts.push({ text: checkInstruction(kind, readable) });

      const raw = await GeminiService.generateJson<Parameters<typeof normalizeReport>[0]>({
        model: env.GEMINI_VERIFY_MODEL,
        system: CHECK_SYSTEM,
        contents: [{ role: 'user', parts }],
        schema: checkSchema(readable.map((c) => c.ref)),
        thinking: ThinkingLevel.HIGH,
      });
      const report = normalizeReport(raw, readable);
      if (!report.findings.length) throw badRequest('Gemini did not return any findings for these documents. Try again.');

      const [done] = await finish({ status: 'done', verdict: report.verdict, report: { ...report }, error: null });
      return checkDto(done);
    } catch (error) {
      await finish({ status: 'failed', error: error instanceof Error ? error.message : String(error) }).catch(() => {});
      throw error;
    }
  },

  async getCheck(propertyId: string, checkId: string): Promise<CheckDto> {
    const [row] = await getDb()
      .select()
      .from(propertyChecks)
      .where(and(eq(propertyChecks.id, checkId), eq(propertyChecks.property_id, propertyId)));
    if (!row) throw notFound('Check not found.');
    return checkDto(row);
  },

  /** The newest finished check, or null when the property has none. */
  async latestCheck(propertyId: string): Promise<PropertyCheck | null> {
    const [row] = await getDb()
      .select()
      .from(propertyChecks)
      .where(and(eq(propertyChecks.property_id, propertyId), eq(propertyChecks.status, 'done')))
      .orderBy(desc(propertyChecks.created_at))
      .limit(1);
    return row ?? null;
  },

  async latestCheckDto(propertyId: string): Promise<CheckDto> {
    await loadProperty(propertyId);
    const row = await this.latestCheck(propertyId);
    if (!row) throw notFound('This property has no finished document check yet.');
    return checkDto(row);
  },

  async listMessages(propertyId: string): Promise<ChatMessageDto[]> {
    await loadProperty(propertyId);
    const rows = await getDb()
      .select()
      .from(propertyChatMessages)
      .where(eq(propertyChatMessages.property_id, propertyId))
      .orderBy(asc(propertyChatMessages.created_at));
    return rows.map(messageDto);
  },

  async clearMessages(propertyId: string): Promise<void> {
    await loadProperty(propertyId);
    await getDb().delete(propertyChatMessages).where(eq(propertyChatMessages.property_id, propertyId));
  },

  /** Answers a question from the property's processed documents and latest check. Stores both turns. */
  async ask(propertyId: string, message: string): Promise<{ question: ChatMessageDto; answer: ChatMessageDto }> {
    const question = message.trim();
    if (!question) throw badRequest('Type a question about this property.');
    const property = await loadProperty(propertyId);
    const db = getDb();

    const history = await db
      .select()
      .from(propertyChatMessages)
      .where(eq(propertyChatMessages.property_id, propertyId))
      .orderBy(desc(propertyChatMessages.created_at))
      .limit(HISTORY_TURNS * 2);

    const docs = (await loadDocuments(propertyId)).filter((d) => d.status === 'processed' && d.original_text?.trim());
    let used = 0;
    const contexts: DocContext[] = [];
    for (const [i, d] of docs.entries()) {
      const size = (d.original_text?.length ?? 0) + (d.translated_text?.length ?? 0);
      if (used + size > CHAT_TEXT_BUDGET) break;
      used += size;
      contexts.push(toContext(d, i, false));
    }

    let reply;
    if (!contexts.length) {
      reply = {
        answer: 'This property has no documents I can read yet. Upload its documents and run a check, then ask again.',
        found: false,
        citations: [] as ChatCitation[],
      };
    } else {
      const check = await this.latestCheck(propertyId);
      const grounding = [
        factsBlock(property),
        ...contexts.map(documentBlock),
        check?.report ? `<latest_check_report>\n${JSON.stringify(check.report)}\n</latest_check_report>` : '',
      ].filter(Boolean).join('\n\n');

      // Grounding lives in the system instruction (a stable prefix, so implicit caching applies);
      // contents are the alternating chat history and the new question.
      const past = history.reverse();
      while (past[0]?.role === 'model') past.shift(); // history must open with a user turn
      const contents: Content[] = [
        ...past.map((m): Content => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: question }] },
      ];
      const raw = await GeminiService.generateJson<Parameters<typeof normalizeChat>[0]>({
        model: env.GEMINI_CHAT_MODEL,
        system: `${CHAT_SYSTEM}\nCite documents by ref (${contexts.map((c) => c.ref).join(', ')}).\n\n${grounding}`,
        contents,
        schema: chatSchema(contexts.map((c) => c.ref)),
        thinking: ThinkingLevel.LOW,
      });
      reply = normalizeChat(raw, contexts);
    }

    const [q] = await db
      .insert(propertyChatMessages)
      .values({ id: `msg_${crypto.randomUUID()}`, property_id: propertyId, role: 'user', text: question })
      .returning();
    const [a] = await db
      .insert(propertyChatMessages)
      .values({
        id: `msg_${crypto.randomUUID()}`,
        property_id: propertyId,
        role: 'model',
        text: reply.answer,
        found: reply.found,
        citations: reply.citations.map((c) => ({ ...c })),
        model: contexts.length ? env.GEMINI_CHAT_MODEL : null,
        // One millisecond after the question so ordering by time is stable.
        created_at: new Date(q.created_at.getTime() + 1),
      })
      .returning();
    return { question: messageDto(q), answer: messageDto(a) };
  },
};
