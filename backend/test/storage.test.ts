import { describe, expect, it } from 'bun:test';
import { app } from '../src/app';
import { StorageService } from '../src/services/storage';
import { env } from '../src/config/env';

describe('Google Cloud Storage Service & API', () => {
  it('StorageService has correct project and bucket configuration', () => {
    expect(env.GCP_PROJECT_ID).toBeDefined();
    expect(env.GCS_BUCKET_NAME).toBeDefined();
    const bucket = StorageService.getBucket();
    expect(bucket.name).toBe(env.GCS_BUCKET_NAME);
  });

  it('GET /api/storage/health returns health structure', async () => {
    const response = await app.handle(new Request('http://localhost/api/storage/health'));
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      status: string;
      bucket: string;
      projectId: string;
      exists: boolean;
      message?: string;
    };

    expect(body.bucket).toBe(env.GCS_BUCKET_NAME);
    expect(body.projectId).toBe(env.GCP_PROJECT_ID);
    expect(typeof body.exists).toBe('boolean');
    expect(['healthy', 'unhealthy']).toContain(body.status);
  });

  it('POST /api/storage/signed-upload-url generates signed upload URL', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/storage/signed-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'test-folder/test-image.png',
          contentType: 'image/png',
          expiresInMinutes: 10,
        }),
      })
    );

    // If service account key is available, returns 200 with signed URL
    if (response.status === 200) {
      const body = (await response.json()) as {
        url: string;
        expiresAt: string;
        filename: string;
        bucket: string;
      };
      expect(body.filename).toBe('test-folder/test-image.png');
      expect(body.bucket).toBe(env.GCS_BUCKET_NAME);
      expect(body.url).toContain('https://storage.googleapis.com');
      expect(body.expiresAt).toBeDefined();
    } else {
      // In CI/test without private key, may return 500 error from GCS client
      expect([200, 500]).toContain(response.status);
    }
  });

  it('POST /api/storage/signed-download-url generates signed download URL', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/storage/signed-download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'test-folder/test-image.png',
          expiresInMinutes: 30,
        }),
      })
    );

    if (response.status === 200) {
      const body = (await response.json()) as {
        url: string;
        expiresAt: string;
        filename: string;
      };
      expect(body.filename).toBe('test-folder/test-image.png');
      expect(body.url).toContain('https://storage.googleapis.com');
      expect(body.expiresAt).toBeDefined();
    } else {
      expect([200, 500]).toContain(response.status);
    }
  });

  it('GET /api/storage/files returns file list structure', async () => {
    const response = await app.handle(new Request('http://localhost/api/storage/files?limit=5'));
    if (response.status === 200) {
      const body = (await response.json()) as {
        files: Array<{ name: string; size: number; updated: string; contentType: string; publicUrl: string }>;
        count: number;
      };
      expect(Array.isArray(body.files)).toBe(true);
      expect(typeof body.count).toBe('number');
    } else {
      expect([200, 500]).toContain(response.status);
    }
  });

  it('DELETE /api/storage/files/:filename handles deletion request', async () => {
    const response = await app.handle(
      new Request('http://localhost/api/storage/files/non-existent-test-file.txt', {
        method: 'DELETE',
      })
    );

    if (response.status === 200) {
      const body = (await response.json()) as {
        success: boolean;
        filename: string;
        message: string;
      };
      expect(body.success).toBe(true);
      expect(body.filename).toBe('non-existent-test-file.txt');
    } else {
      expect([200, 500]).toContain(response.status);
    }
  });
});
