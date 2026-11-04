/**
 * AI Conversations Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type AIConversationRow = Database['public']['Tables']['ai_conversations']['Row'];
type AIConversationInsert = Database['public']['Tables']['ai_conversations']['Insert'];
type AIConversationUpdate = Database['public']['Tables']['ai_conversations']['Update'];

export class AIConversationsRepository extends BaseRepository<'ai_conversations'> {
  constructor() {
    super('ai_conversations');
  }

  async findByUser(userId: string): Promise<AIConversationRow[]> {
    return this.findByUserId(userId, {
      orderBy: { column: 'updated_at', ascending: false },
    });
  }

  async findActive(userId: string): Promise<AIConversationRow | null> {
    const results = await this.findByUserId(userId, {
      orderBy: { column: 'updated_at', ascending: false },
      limit: 1,
    });
    return results[0] ?? null;
  }

  async createConversation(data: Omit<AIConversationInsert, 'user_id'>, userId: string): Promise<AIConversationRow | null> {
    return this.create({ ...data, user_id: userId } as AIConversationInsert);
  }

  async updateLastMessagePreview(conversationId: string, preview: string): Promise<AIConversationRow | null> {
    return this.update(conversationId, {
      last_message_preview: preview,
      updated_at: new Date().toISOString(),
    } as AIConversationUpdate);
  }

  async incrementMessageCount(conversationId: string): Promise<AIConversationRow | null> {
    const existing = await this.findById(conversationId);
    if (!existing) return null;
    return this.update(conversationId, {
      message_count: (existing.message_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    } as AIConversationUpdate);
  }
}

export const aiConversationsRepository = new AIConversationsRepository();