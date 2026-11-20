import { Elysia, t } from 'elysia';
import { StorageService } from '../services/storage';

export const storageRoutes = new Elysia({ prefix: '/api/storage' })
  /**
   * GET /api/storage/health
   * Check connection and access to the configured Google Cloud Storage bucket
   */
  .get(
    '/health',
    async () => {
      const result = await StorageService.checkHealth();
      return result;
    },
    {
      detail: {
        summary: 'Storage Health Check',
        tags: ['Storage'],
        description: 'Verifies connection and access to the configured Google Cloud Storage bucket.',
      },
      response: t.Object({
        status: t.String(),
        bucket: t.String(),
        projectId: t.String(),
        exists: t.Boolean(),
        message: t.Optional(t.String()),
      }),
    }
  )

  /**
   * GET /api/storage/files
   * List files in the configured bucket
   */
  .get(
    '/files',
    async ({ query }) => {
      const limit = query.limit ? parseInt(query.limit, 10) : 100;
      const files = await StorageService.listFiles({
        prefix: query.prefix,
        maxResults: limit,
      });

      return {
        files,
        count: files.length,
      };
    },
    {
      query: t.Object({
        prefix: t.Optional(t.String({ description: 'Filter files by prefix path' })),
        limit: t.Optional(t.String({ description: 'Max number of items to return (default: 100)' })),
      }),
      detail: {
        summary: 'List Storage Files',
        tags: ['Storage'],
        description: 'Lists stored files and their metadata from the storage bucket.',
      },
      response: t.Object({
        files: t.Array(
          t.Object({
            name: t.String(),
            size: t.Number(),
            updated: t.String(),
            contentType: t.String(),
            publicUrl: t.String(),
          })
        ),
        count: t.Number(),
      }),
    }
  )

  /**
   * POST /api/storage/upload
   * Directly upload file content (raw string or base64) to the bucket
   */
  .post(
    '/upload',
    async ({ body, set }) => {
      try {
        const contentBuffer = body.isBase64
          ? Buffer.from(body.content, 'base64')
          : Buffer.from(body.content, 'utf8');

        const result = await StorageService.uploadFile({
          filename: body.filename,
          content: contentBuffer,
          contentType: body.contentType || 'application/octet-stream',
          metadata: body.metadata,
        });

        return {
          success: true,
          file: result,
        };
      } catch (error) {
        set.status = 500;
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        };
      }
    },
    {
      body: t.Object({
        filename: t.String({ description: 'Destination filename in the bucket' }),
        content: t.String({ description: 'File content (plain string or base64)' }),
        contentType: t.Optional(t.String({ description: 'MIME type of the file' })),
        isBase64: t.Optional(t.Boolean({ description: 'Whether content is base64 encoded' })),
        metadata: t.Optional(t.Record(t.String(), t.String(), { description: 'Custom key-value metadata' })),
      }),
      detail: {
        summary: 'Upload File',
        tags: ['Storage'],
        description: 'Upload file content directly to Google Cloud Storage.',
      },
    }
  )

  /**
   * POST /api/storage/signed-upload-url
   * Generate signed v4 upload URL for direct browser/client-to-bucket uploads
   */
  .post(
    '/signed-upload-url',
    async ({ body }) => {
      const result = await StorageService.getSignedUploadUrl({
        filename: body.filename,
        contentType: body.contentType,
        expiresInMinutes: body.expiresInMinutes,
      });

      return result;
    },
    {
      body: t.Object({
        filename: t.String({ description: 'Target destination filename in the bucket' }),
        contentType: t.String({ description: 'Expected MIME type (e.g. image/jpeg, application/pdf)' }),
        expiresInMinutes: t.Optional(t.Number({ description: 'Expiration time in minutes (default: 15)' })),
      }),
      detail: {
        summary: 'Generate Signed Upload URL',
        tags: ['Storage'],
        description: 'Generates a signed V4 URL for uploading files directly from client to GCS.',
      },
      response: t.Object({
        url: t.String(),
        expiresAt: t.String(),
        filename: t.String(),
        bucket: t.String(),
      }),
    }
  )

  /**
   * POST /api/storage/signed-download-url
   * Generate signed v4 download URL for secure time-limited file downloads
   */
  .post(
    '/signed-download-url',
    async ({ body }) => {
      const result = await StorageService.getSignedDownloadUrl({
        filename: body.filename,
        expiresInMinutes: body.expiresInMinutes,
      });

      return result;
    },
    {
      body: t.Object({
        filename: t.String({ description: 'Filename to read/download from the bucket' }),
        expiresInMinutes: t.Optional(t.Number({ description: 'Expiration time in minutes (default: 60)' })),
      }),
      detail: {
        summary: 'Generate Signed Download URL',
        tags: ['Storage'],
        description: 'Generates a temporary signed download URL for private files.',
      },
      response: t.Object({
        url: t.String(),
        expiresAt: t.String(),
        filename: t.String(),
      }),
    }
  )

  /**
   * DELETE /api/storage/files/:filename
   * Delete a file from the bucket
   */
  .delete(
    '/files/:filename',
    async ({ params }) => {
      const result = await StorageService.deleteFile(params.filename);
      return {
        success: result.success,
        filename: result.filename,
        message: `File ${params.filename} deleted successfully`,
      };
    },
    {
      params: t.Object({
        filename: t.String({ description: 'Filename to delete' }),
      }),
      detail: {
        summary: 'Delete Stored File',
        tags: ['Storage'],
        description: 'Deletes an existing file from the Google Cloud Storage bucket.',
      },
      response: t.Object({
        success: t.Boolean(),
        filename: t.String(),
        message: t.String(),
      }),
    }
  );
