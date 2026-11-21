import { Elysia, t } from 'elysia';
import { AiService } from './service';

const nullable = <T extends ReturnType<typeof t.String> | ReturnType<typeof t.Number>>(s: T) => t.Union([s, t.Null()]);

const DocSourceDto = t.Object({
  documentId: t.String(),
  filename: t.String(),
  slot: t.String(),
  page: nullable(t.Number()),
});

const FindingDto = t.Object({
  title: t.String(),
  titleShort: t.String(),
  severity: t.Union([t.Literal('high'), t.Literal('medium'), t.Literal('clear')]),
  body: t.String(),
  bodyShort: t.String(),
  quote: t.String(),
  quoteEn: t.String(),
  source: t.Composite([DocSourceDto, t.Object({ location: nullable(t.String()) })]),
});

const ReportDto = t.Object({
  verdict: t.Union([t.Literal('stop'), t.Literal('proceed')]),
  title: t.String(),
  titleShort: t.String(),
  headline: t.String(),
  headlineShort: t.String(),
  counts: t.Object({ high: t.Number(), medium: t.Number(), clear: t.Number() }),
  findings: t.Array(FindingDto),
});

const CheckDto = t.Object({
  id: t.String(),
  propertyId: t.String(),
  kind: t.String(),
  status: t.String(),
  verdict: t.Union([t.Literal('stop'), t.Literal('proceed'), t.Null()]),
  report: t.Union([ReportDto, t.Null()]),
  docIds: t.Array(t.String()),
  model: t.String(),
  error: nullable(t.String()),
  createdAt: t.String(),
});

const MessageDto = t.Object({
  id: t.String(),
  role: t.Union([t.Literal('user'), t.Literal('model')]),
  text: t.String(),
  found: t.Union([t.Boolean(), t.Null()]),
  citations: t.Array(t.Composite([DocSourceDto, t.Object({ quote: t.String() })])),
  createdAt: t.String(),
});

const idParams = t.Object({ id: t.String() });

export const aiRoutes = new Elysia({ prefix: '/api/properties' })
  /** POST /api/properties/:id/checks: OCR any unread documents, then Gemini cross-checks them all. */
  .post('/:id/checks', ({ params, body }) => AiService.runCheck(params.id, body.kind), {
    params: idParams,
    body: t.Object({
      kind: t.Union([t.Literal('resale'), t.Literal('under-construction'), t.Literal('plot'), t.Literal('commercial')]),
    }),
    detail: {
      summary: 'Run a Gemini document check',
      tags: ['AI'],
      description:
        'Reads every document of the property (Document AI OCR + translation, then Gemini on Vertex AI with the files attached) and returns a STOP / PROCEED report whose findings quote the page they come from. Takes up to a few minutes.',
    },
    response: CheckDto,
  })

  /** GET /api/properties/:id/checks/latest: the newest finished check. */
  .get('/:id/checks/latest', ({ params }) => AiService.latestCheckDto(params.id), {
    params: idParams,
    detail: { summary: 'Latest document check', tags: ['AI'] },
    response: CheckDto,
  })

  /** GET /api/properties/:id/checks/:checkId */
  .get('/:id/checks/:checkId', ({ params }) => AiService.getCheck(params.id, params.checkId), {
    params: t.Object({ id: t.String(), checkId: t.String() }),
    detail: { summary: 'Get a document check', tags: ['AI'] },
    response: CheckDto,
  })

  /** GET /api/properties/:id/chat: the stored conversation, oldest first. */
  .get('/:id/chat', async ({ params }) => ({ messages: await AiService.listMessages(params.id) }), {
    params: idParams,
    detail: { summary: 'Get property chat', tags: ['AI'] },
    response: t.Object({ messages: t.Array(MessageDto) }),
  })

  /** POST /api/properties/:id/chat: ask Gemini about this property's documents. */
  .post('/:id/chat', ({ params, body }) => AiService.ask(params.id, body.message), {
    params: idParams,
    body: t.Object({ message: t.String({ minLength: 1, maxLength: 2000 }) }),
    detail: {
      summary: 'Ask about a property',
      tags: ['AI'],
      description: "Gemini answers only from the property's processed documents and latest check, and cites them. Both turns are stored.",
    },
    response: t.Object({ question: MessageDto, answer: MessageDto }),
  })

  /** DELETE /api/properties/:id/chat: clear the conversation. */
  .delete(
    '/:id/chat',
    async ({ params }) => {
      await AiService.clearMessages(params.id);
      return { success: true };
    },
    {
      params: idParams,
      detail: { summary: 'Clear property chat', tags: ['AI'] },
      response: t.Object({ success: t.Boolean() }),
    },
  );
