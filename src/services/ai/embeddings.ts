/**
 * Embeddings Service - Generate and manage document embeddings for RAG
 */

import { aiProviderFactory } from '@/lib/ai';
import { documentEmbeddingsRepository } from '@/services/repositories';
import type { DocumentEmbeddingType } from '@/types/database';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSION = 1536;
const CHUNK_SIZE = 1000; // characters
const CHUNK_OVERLAP = 200; // characters

export interface EmbeddingResult {
  embedding: number[];
  tokensUsed: number;
}

export interface ChunkedDocument {
  chunks: string[];
  totalTokens: number;
}

function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at a sentence or paragraph boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > start + chunkSize * 0.5) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }

  return chunks.filter(c => c.length > 0);
}

export class EmbeddingsService {
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    const response = await aiProviderFactory.createEmbedding(text, {
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSION,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Failed to generate embedding');
    }

    return {
      embedding: response.data[0].embedding,
      tokensUsed: response.usage?.totalTokens ?? 0,
    };
  }

  async generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    for (const text of texts) {
      const result = await this.generateEmbedding(text);
      results.push(result);
    }

    return results;
  }

  chunkDocument(text: string): ChunkedDocument {
    const chunks = chunkText(text);
    return {
      chunks,
      totalTokens: Math.ceil(text.length / 4), // rough estimate
    };
  }

  async indexDocument(
    userId: string,
    documentType: DocumentEmbeddingType,
    documentId: string,
    text: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    // Delete existing embeddings for this document
    await documentEmbeddingsRepository.deleteByDocument(userId, documentType, documentId);

    // Chunk the document
    const { chunks } = this.chunkDocument(text);

    if (chunks.length === 0) return;

    // Generate embeddings for all chunks
    const embeddings = await this.generateEmbeddings(chunks);

    // Store embeddings
    const inserts = chunks.map((chunk, index) => ({
      userId,
      documentType,
      documentId,
      chunkIndex: index,
      chunkText: chunk,
      embedding: embeddings[index].embedding,
      metadata: {
        ...metadata,
        chunkLength: chunk.length,
        model: EMBEDDING_MODEL,
      },
    }));

    await documentEmbeddingsRepository.createEmbeddings(inserts);
  }

  async search(
    userId: string,
    query: string,
    options?: {
      documentTypes?: DocumentEmbeddingType[];
      threshold?: number;
      limit?: number;
    }
  ): Promise<Array<{ text: string; metadata: Record<string, unknown>; similarity: number }>> {
    // Generate embedding for query
    const { embedding } = await this.generateEmbedding(query);

    // Search similar documents
    const results = await documentEmbeddingsRepository.searchSimilar(userId, embedding, options);

    return results.map(r => ({
      text: r.chunkText,
      metadata: r.metadata,
      similarity: r.similarity,
    }));
  }

  async reindexAllUserDocuments(userId: string): Promise<void> {
    // This would be called to re-index all documents for a user
    // Implementation would fetch all user's documents and re-index them
    // For now, this is a placeholder
    console.log(`Re-indexing all documents for user ${userId}`);
  }
}

export const embeddingsService = new EmbeddingsService();