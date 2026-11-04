/**
 * Document Storage Service - Supabase Storage integration for document uploads
 */

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UploadResult {
  path: string;
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface DocumentUploadOptions {
  bucket?: string;
  folder?: string;
  allowedTypes?: string[];
  maxSizeBytes?: number;
}

const DEFAULT_OPTIONS: DocumentUploadOptions = {
  bucket: 'health-documents',
  folder: 'uploads',
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
};

export class DocumentStorageService {
  private supabase = getSupabaseClient();
  private isDemoMode = !isSupabaseConfigured;

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File,
    userId: string,
    options: DocumentUploadOptions = {}
  ): Promise<UploadResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Validate file type
    if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${opts.allowedTypes.join(', ')}`);
    }

    // Validate file size
    if (opts.maxSizeBytes && file.size > opts.maxSizeBytes) {
      throw new Error(`File size ${file.size} bytes exceeds maximum allowed size of ${opts.maxSizeBytes} bytes`);
    }

    if (this.isDemoMode) {
      // Demo mode: return mock result
      const mockPath = `${opts.folder}/${userId}/${Date.now()}-${file.name}`;
      return {
        path: mockPath,
        url: `https://demo.example.com/${mockPath}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${opts.folder}/${userId}/${timestamp}-${sanitizedName}`;

    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from(opts.bucket!)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(opts.bucket!)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    userId: string,
    options: DocumentUploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    for (const file of files) {
      const result = await this.uploadFile(file, userId, options);
      results.push(result);
    }
    return results;
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(path: string, bucket: string = 'health-documents'): Promise<boolean> {
    if (this.isDemoMode) return true;

    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    return !error;
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(
    path: string,
    bucket: string = 'health-documents',
    expiresIn: number = 3600
  ): Promise<string | null> {
    if (this.isDemoMode) return `https://demo.example.com/signed/${path}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) return null;
    return data.signedUrl;
  }

  /**
   * List files in a user's folder
   */
  async listUserFiles(
    userId: string,
    bucket: string = 'health-documents',
    folder: string = 'uploads'
  ): Promise<Array<{ name: string; path: string; size: number; createdAt: string }>> {
    if (this.isDemoMode) return [];

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(`${folder}/${userId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) return [];

    return data.map((file: { name: string; metadata?: { size?: number }; created_at?: string }) => ({
      name: file.name,
      path: `${folder}/${userId}/${file.name}`,
      size: file.metadata?.size ?? 0,
      createdAt: file.created_at ?? new Date().toISOString(),
    }));
  }
}

export const documentStorageService = new DocumentStorageService();