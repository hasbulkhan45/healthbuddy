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
      filters: { status: 'active' },
      orderBy: { column: 'updated_at', ascending: false },
      limit: 1,
    });
    return results[0] ?? null;
  }

  async findByContextType(userId: string, contextType: string): Promise<AIConversationRow[]> {
    return this.findByUserId(userId, {
      filters: { context_type: contextType },
      orderBy: { column: 'updated_at', ascending: false },
    });
  }

  async createConversation(data: Omit<AIConversationInsert, 'user_id'>, userId: string): Promise<AIConversationRow | null> {
    return this.create({ ...data, user_id: userId } as AIConversationInsert);
  }

  async updateLastMessage(conversationId: string, messageId: string): Promise<AIConversationRow | null> {
    return this.update(conversationId, {
      last_message_id: messageId,
      updated_at: new Date().toISOString(),
    } as AIConversationUpdate);
  }

  async updateStatus(conversationId: string, status: AIConversationRow['status']): Promise<AIConversationRow | null> {
    return this.update(conversationId, { status } as AIConversationUpdate);
  }

  async updateContext(conversationId: string, context: AIConversationRow['context_data']): Promise<AIConversationRow | null> {
    return this.update(conversationId, { context_data: context } as AIConversationUpdate);
  }
}

export const aiConversationsRepository = new AIConversationsRepository();