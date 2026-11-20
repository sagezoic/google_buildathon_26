import { Storage, type StorageOptions, type Bucket, type File } from '@google-cloud/storage';
import { env } from '../config/env';
import { gcpClientOptions } from './gcp-auth';

export interface UploadOptions {
  filename: string;
  content: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface UploadResult {
  filename: string;
  bucket: string;
  size: number;
  contentType: string;
  publicUrl: string;
}

export interface StoredFileInfo {
  name: string;
  size: number;
  updated: string;
  contentType: string;
  publicUrl: string;
}

export interface SignedUploadUrlResult {
  url: string;
  expiresAt: string;
  filename: string;
  bucket: string;
}

export interface SignedDownloadUrlResult {
  url: string;
  expiresAt: string;
  filename: string;
}

export interface StorageHealthResult {
  status: 'healthy' | 'unhealthy';
  bucket: string;
  projectId: string;
  exists: boolean;
  message?: string;
}

class StorageServiceImpl {
  private client: Storage | null = null;

  public getClient(): Storage {
    if (!this.client) {
      const options: StorageOptions = gcpClientOptions();

      this.client = new Storage(options);
    }

    return this.client;
  }

  public getBucket(bucketName = env.GCS_BUCKET_NAME): Bucket {
    return this.getClient().bucket(bucketName);
  }

  public async checkHealth(bucketName = env.GCS_BUCKET_NAME): Promise<StorageHealthResult> {
    try {
      const bucket = this.getBucket(bucketName);
      const [exists] = await bucket.exists();

      return {
        status: exists ? 'healthy' : 'unhealthy',
        bucket: bucketName,
        projectId: env.GCP_PROJECT_ID,
        exists,
        message: exists ? 'Storage bucket accessible' : 'Bucket does not exist or access denied',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        bucket: bucketName,
        projectId: env.GCP_PROJECT_ID,
        exists: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  public async uploadFile(options: UploadOptions): Promise<UploadResult> {
    const { filename, content, contentType = 'application/octet-stream', metadata = {}, isPublic = false } = options;
    const bucket = this.getBucket();
    const file = bucket.file(filename);

    const buffer = Buffer.isBuffer(content)
      ? content
      : typeof content === 'string'
        ? Buffer.from(content, 'utf8')
        : Buffer.from(content);

    await file.save(buffer, {
      contentType,
      metadata: {
        ...metadata,
      },
      resumable: false,
    });

    if (isPublic) {
      try {
        await file.makePublic();
      } catch (err) {
        console.warn(`[StorageService] Note: Could not make ${filename} public (uniform bucket access may be enabled):`, err);
      }
    }

    return {
      filename,
      bucket: bucket.name,
      size: buffer.length,
      contentType,
      publicUrl: `https://storage.googleapis.com/${bucket.name}/${filename}`,
    };
  }

  public async downloadFile(filename: string): Promise<{ content: Buffer; contentType: string; size: number }> {
    const bucket = this.getBucket();
    const file = bucket.file(filename);

    const [content] = await file.download();
    const [metadata] = await file.getMetadata();

    return {
      content,
      contentType: (metadata.contentType as string) || 'application/octet-stream',
      size: Number(metadata.size || content.length),
    };
  }

  public async deleteFile(filename: string): Promise<{ success: boolean; filename: string }> {
    const bucket = this.getBucket();
    const file = bucket.file(filename);
    await file.delete({ ignoreNotFound: true });

    return {
      success: true,
      filename,
    };
  }

  public async listFiles(options?: { prefix?: string; maxResults?: number }): Promise<StoredFileInfo[]> {
    const bucket = this.getBucket();
    const [files] = await bucket.getFiles({
      prefix: options?.prefix,
      maxResults: options?.maxResults ?? 100,
    });

    return files.map((file: File) => {
      const meta = file.metadata;
      return {
        name: file.name,
        size: Number(meta.size || 0),
        updated: (meta.updated as string) || new Date().toISOString(),
        contentType: (meta.contentType as string) || 'application/octet-stream',
        publicUrl: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
      };
    });
  }

  public async getSignedUploadUrl(options: {
    filename: string;
    contentType: string;
    expiresInMinutes?: number;
  }): Promise<SignedUploadUrlResult> {
    const { filename, contentType, expiresInMinutes = 15 } = options;
    const bucket = this.getBucket();
    const file = bucket.file(filename);

    const expiresAtMs = Date.now() + expiresInMinutes * 60 * 1000;
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: expiresAtMs,
      contentType,
    });

    return {
      url,
      expiresAt: new Date(expiresAtMs).toISOString(),
      filename,
      bucket: bucket.name,
    };
  }

  public async getSignedDownloadUrl(options: {
    filename: string;
    expiresInMinutes?: number;
  }): Promise<SignedDownloadUrlResult> {
    const { filename, expiresInMinutes = 60 } = options;
    const bucket = this.getBucket();
    const file = bucket.file(filename);

    const expiresAtMs = Date.now() + expiresInMinutes * 60 * 1000;
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: expiresAtMs,
    });

    return {
      url,
      expiresAt: new Date(expiresAtMs).toISOString(),
      filename,
    };
  }
}

export const StorageService = new StorageServiceImpl();
