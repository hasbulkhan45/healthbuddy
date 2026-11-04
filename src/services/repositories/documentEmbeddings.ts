/**
 * Document Embeddings Repository for RAG
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type DocumentEmbeddingRow = Database['public']['Tables']['document_embeddings']['Row'];
type DocumentEmbeddingInsert = Database['public']['Tables']['document_embeddings']['Insert'];
type DocumentEmbeddingUpdate = Database['public']['Tables']['document_embeddings']['Update'];

export class DocumentEmbeddingsRepository extends BaseRepository<'document_embeddings'> {
  constructor() {
    super('document_embeddings');
  }

  async findByDocument(
    userId: string,
    documentType: DocumentEmbeddingRow['documentType'],
    documentId: string
  ): Promise<DocumentEmbeddingRow[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('document_type', documentType)
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true });

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as DocumentEmbeddingRow[];
  }

  async deleteByDocument(
    userId: string,
    documentType: DocumentEmbeddingRow['documentType'],
    documentId: string
  ): Promise<boolean> {
    let query = this.getClient()
      .from(this.tableName)
      .delete()
      .eq('user_id', userId)
      .eq('document_type', documentType)
      .eq('document_id', documentId);

    const { error } = await this.executeQuery(query);
    return !error;
  }

  async createEmbedding(
    embedding: DocumentEmbeddingInsert
  ): Promise<DocumentEmbeddingRow | null> {
    return this.create(embedding);
  }

  async createEmbeddings(
    embeddings: DocumentEmbeddingInsert[]
  ): Promise<DocumentEmbeddingRow[]> {
    const results: DocumentEmbeddingRow[] = [];
    for (const embedding of embeddings) {
      const result = await this.create(embedding);
      if (result) results.push(result);
    }
    return results;
  }

  async searchSimilar(
    userId: string,
    queryEmbedding: number[],
    options?: {
      documentTypes?: DocumentEmbeddingRow['documentType'][];
      threshold?: number;
      limit?: number;
    }
  ): Promise<Array<DocumentEmbeddingRow & { similarity: number }>> {
    const { documentTypes, threshold = 0.7, limit = 10 } = options ?? {};

    // Use the database function for vector similarity search
    const { data, error } = await this.getClient().rpc('search_document_embeddings', {
      query_embedding: queryEmbedding,
      user_id_param: userId,
      document_types: documentTypes ?? null,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error || !data) return [];
    return data as Array<DocumentEmbeddingRow & { similarity: number }>;
  }

  async getUserEmbeddingsCount(userId: string): Promise<number> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count, error } = await this.executeQuery(query);
    if (error) return 0;
    return count ?? 0;
  }
}

export const documentEmbeddingsRepository = new DocumentEmbeddingsRepository();