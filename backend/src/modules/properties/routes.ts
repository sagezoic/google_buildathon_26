import { Elysia, t } from 'elysia';
import type { Property } from '../../db/schema';
import { PropertiesService } from './service';

const nullable = <T extends ReturnType<typeof t.String> | ReturnType<typeof t.Number>>(s: T) => t.Union([s, t.Null()]);

const PropertyBody = t.Object({
  type: t.Union([t.Literal('apartment'), t.Literal('plot'), t.Literal('commercial')]),
  gat: t.Optional(t.String()),
  village: t.Optional(t.String()),
  taluka: t.Optional(t.String()),
  district: t.Optional(t.String()),
  address: t.Optional(t.String()),
  lat: t.Optional(t.Number()),
  lng: t.Optional(t.Number()),
  area: t.Optional(t.String()),
  area_unit: t.Optional(t.String()),
  stage: t.Optional(t.Union([t.Literal('details'), t.Literal('documents'), t.Literal('checked')])),
});

const PropertyDto = t.Object({
  id: t.String(),
  type: t.String(),
  gat: nullable(t.String()),
  village: nullable(t.String()),
  taluka: nullable(t.String()),
  district: nullable(t.String()),
  address: nullable(t.String()),
  lat: nullable(t.Number()),
  lng: nullable(t.Number()),
  area: nullable(t.String()),
  area_unit: nullable(t.String()),
  stage: t.String(),
  created_at: t.String(),
  updated_at: t.String(),
});

const DocumentDto = t.Object({
  id: t.String(),
  slot: t.String(),
  filename: t.String(),
  mime: t.String(),
  size: t.Number(),
  status: t.String(),
  pages: nullable(t.Number()),
  lang: nullable(t.String()),
  fields: t.Union([t.Record(t.String(), t.Unknown()), t.Null()]),
  error: nullable(t.String()),
});

const DocumentDetailDto = t.Composite([
  DocumentDto,
  t.Object({ originalText: t.String(), translatedText: nullable(t.String()) }),
]);

const propertyDto = (p: Property) => ({
  id: p.id,
  type: p.type,
  gat: p.gat,
  village: p.village,
  taluka: p.taluka,
  district: p.district,
  address: p.address,
  lat: p.lat,
  lng: p.lng,
  area: p.area,
  area_unit: p.area_unit,
  stage: p.stage,
  created_at: p.created_at.toISOString(),
  updated_at: p.updated_at.toISOString(),
});

const idParams = t.Object({ id: t.String() });
const docParams = t.Object({ id: t.String(), docId: t.String() });

export const propertiesRoutes = new Elysia({ prefix: '/api/properties' })
  /** POST /api/properties: create a property draft. */
  .post('/', async ({ body }) => propertyDto(await PropertiesService.create(body)), {
    body: PropertyBody,
    detail: { summary: 'Create property draft', tags: ['Properties'] },
    response: PropertyDto,
  })

  /** PUT /api/properties/:id: update the draft details or stage. */
  .put('/:id', async ({ params, body }) => propertyDto(await PropertiesService.update(params.id, body)), {
    params: idParams,
    body: t.Partial(PropertyBody),
    detail: { summary: 'Update property draft', tags: ['Properties'] },
    response: PropertyDto,
  })

  /** GET /api/properties/:id: the property with its documents (no extracted text). */
  .get(
    '/:id',
    async ({ params }) => {
      const { property, documents } = await PropertiesService.get(params.id);
      return { property: propertyDto(property), documents };
    },
    {
      params: idParams,
      detail: { summary: 'Get property with documents', tags: ['Properties'] },
      response: t.Object({ property: PropertyDto, documents: t.Array(DocumentDto) }),
    },
  )

  /** POST /api/properties/:id/documents: multipart upload to Cloud Storage. */
  .post('/:id/documents', ({ params, body }) => PropertiesService.addDocument(params.id, body.slot, body.file), {
    params: idParams,
    body: t.Object({
      file: t.File({ description: 'PDF, JPG or PNG' }),
      slot: t.String({ description: 'extract | card | na | mutation | deed | agreement | extra' }),
    }),
    detail: {
      summary: 'Upload property document',
      tags: ['Properties'],
      description: 'Stores the file in Cloud Storage. A non-"extra" slot replaces any earlier file in that slot.',
    },
    response: DocumentDto,
  })

  /** DELETE /api/properties/:id/documents/:docId */
  .delete(
    '/:id/documents/:docId',
    async ({ params }) => {
      await PropertiesService.deleteDocument(params.id, params.docId);
      return { success: true };
    },
    {
      params: docParams,
      detail: { summary: 'Delete property document', tags: ['Properties'] },
      response: t.Object({ success: t.Boolean() }),
    },
  )

  /** GET /api/properties/:id/documents/:docId: includes original and English text. */
  .get('/:id/documents/:docId', ({ params }) => PropertiesService.getDocument(params.id, params.docId), {
    params: docParams,
    detail: { summary: 'Get document with extracted text', tags: ['Properties'] },
    response: DocumentDetailDto,
  })

  /** POST /api/properties/:id/documents/:docId/process: OCR, detect language, translate, extract fields. */
  .post(
    '/:id/documents/:docId/process',
    ({ params, query }) => PropertiesService.processDocument(params.id, params.docId, query.force === 'true'),
    {
      params: docParams,
      query: t.Object({ force: t.Optional(t.String()) }),
      detail: {
        summary: 'Process document (Document AI + Translation)',
        tags: ['Properties'],
        description:
          'Reads the document with Document AI, detects its language, translates to English when needed and extracts key fields. Already-processed documents return the stored result unless force=true.',
      },
      response: DocumentDetailDto,
    },
  );
