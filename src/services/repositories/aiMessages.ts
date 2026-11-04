/**
 * AI Messages Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type AIMessageRow = Database['public']['Tables']['ai_messages']['Row'];
type AIMessageInsert = Database['public']['Tables']['ai_messages']['Insert'];
type AIMessageUpdate = Database['public']['Tables']['ai_messages']['Update'];

export class AIMessagesRepository extends BaseRepository<'ai_messages'> {
  constructor() {
    super('ai_messages');
  }

  async findByConversation(conversationId: string, limit = 50, offset = 0): Promise<AIMessageRow[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as AIMessageRow[];
  }

  async findRecentByConversation(conversationId: string, limit = 20): Promise<AIMessageRow[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return (data as AIMessageRow[]).reverse();
  }

  async addUserMessage(conversationId: string, content: string, userId: string, metadata?: AIMessageRow['context_used']): Promise<AIMessageRow | null> {
    return this.create({
      conversation_id: conversationId,
      user_id: userId,
      sender: 'user',
      content,
      context_used: metadata ?? {},
    } as AIMessageInsert);
  }

  async addAssistantMessage(conversationId: string, content: string, userId: string, metadata?: AIMessageRow['context_used']): Promise<AIMessageRow | null> {
    return this.create({
      conversation_id: conversationId,
      user_id: userId,
      sender: 'assistant',
      content,
      context_used: metadata ?? {},
    } as AIMessageInsert);
  }

  async updateMessage(messageId: string, updates: AIMessageUpdate): Promise<AIMessageRow | null> {
    return this.update(messageId, updates);
  }

  async deleteByConversation(conversationId: string): Promise<boolean> {
    let query = this.getClient()
      .from(this.tableName)
      .delete()
      .eq('conversation_id', conversationId);

    const { error } = await this.executeQuery(query);
    return !error;
  }
}

export const aiMessagesRepository = new AIMessagesRepository();