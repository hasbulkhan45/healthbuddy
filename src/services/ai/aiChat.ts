/**
 * AI Chat Service - Conversational health assistant
 */

import { aiProviderFactory } from '@/lib/ai';
import { profilesRepository, aiMessagesRepository, aiConversationsRepository } from '@/services/repositories';
import type {
  AIMessage,
  AICompletionOptions,
} from '@/lib/ai/types';

const SYSTEM_PROMPT = `You are HealthBuddy, a helpful and knowledgeable AI health assistant. You help users understand their health data, medications, symptoms, and wellness goals.

Guidelines:
- Be supportive, clear, and evidence-based
- Never provide medical diagnoses - encourage consulting healthcare professionals
- Reference the user's actual health data when relevant (medications, conditions, metrics)
- Keep responses concise but helpful
- Ask clarifying questions when needed
- Suggest appropriate next steps (track symptom, schedule appointment, review medication)
- Respect privacy - don't share data outside the conversation

If the user asks about specific medical advice, respond with: "I'm an AI assistant, not a doctor. For medical advice, diagnosis, or treatment decisions, please consult a qualified healthcare professional."

You have access to the user's health context (provided in the conversation). Use it to personalize responses.`;

export class AIChatService {
  async sendMessage(
    userId: string,
    content: string,
    conversationId?: string,
    options?: AICompletionOptions
  ): Promise<{ response: string; conversationId: string }> {
    let convId = conversationId;

    // Get or create conversation
    if (!convId) {
      const activeConv = await aiConversationsRepository.findActive(userId);
      if (activeConv) {
        convId = activeConv.id;
      } else {
        const newConv = await aiConversationsRepository.createConversation(
          { context_type: 'general', status: 'active' },
          userId
        );
        convId = newConv?.id ?? '';
      }
    }

    if (!convId) {
      throw new Error('Failed to create or find conversation');
    }

    // Get user profile for context
    const profile = await profilesRepository.getCurrentUserProfile();
    const context = this.buildUserContext(profile);

    // Add user message
    await aiMessagesRepository.addUserMessage(convId, content);

    // Get conversation history
    const history = await aiMessagesRepository.findRecentByConversation(convId, 20);

    // Build messages for AI
    const messages: AIMessage[] = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\nUser Context:\n${context}` },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content },
    ];

    // Get AI response
    const response = await aiProviderFactory.complete(messages, {
      ...options,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    });

    const assistantResponse = response.choices[0].message.content;

    // Save assistant message
    await aiMessagesRepository.addAssistantMessage(convId, assistantResponse);

    // Update conversation last message
    const lastMsg = await aiMessagesRepository.findRecentByConversation(convId, 1);
    if (lastMsg[0]) {
      await aiConversationsRepository.updateLastMessage(convId, lastMsg[0].id);
    }

    return { response: assistantResponse, conversationId: convId };
  }

  async *streamMessage(
    userId: string,
    content: string,
    conversationId?: string,
    options?: AICompletionOptions
  ): AsyncIterable<{ chunk: string; conversationId: string; done: boolean }> {
    let convId = conversationId;

    if (!convId) {
      const activeConv = await aiConversationsRepository.findActive(userId);
      if (activeConv) {
        convId = activeConv.id;
      } else {
        const newConv = await aiConversationsRepository.createConversation(
          { context_type: 'general', status: 'active' },
          userId
        );
        convId = newConv?.id ?? '';
      }
    }

    if (!convId) {
      throw new Error('Failed to create or find conversation');
    }

    const profile = await profilesRepository.getCurrentUserProfile();
    const context = this.buildUserContext(profile);

    await aiMessagesRepository.addUserMessage(convId, content);

    const history = await aiMessagesRepository.findRecentByConversation(convId, 20);

    const messages: AIMessage[] = [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\nUser Context:\n${context}` },
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content },
    ];

    let fullResponse = '';
    for await (const chunk of aiProviderFactory.completeStream(messages, {
      ...options,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    })) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) {
        fullResponse += delta;
        yield { chunk: delta, conversationId: convId, done: false };
      }
      if (chunk.choices[0]?.finishReason) {
        break;
      }
    }

    await aiMessagesRepository.addAssistantMessage(convId, fullResponse);

    const lastMsg = await aiMessagesRepository.findRecentByConversation(convId, 1);
    if (lastMsg[0]) {
      await aiConversationsRepository.updateLastMessage(convId, lastMsg[0].id);
    }

    yield { chunk: '', conversationId: convId, done: true };
  }

  async getConversationHistory(conversationId: string, limit = 50): Promise<AIMessage[]> {
    const messages = await aiMessagesRepository.findByConversation(conversationId, limit);
    return messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  }

  async getUserConversations(userId: string) {
    return aiConversationsRepository.findByUser(userId);
  }

  async createNewConversation(userId: string, contextType: 'general' | 'prescription' | 'symptoms' | 'care_plan' = 'general') {
    return aiConversationsRepository.createConversation({ context_type: contextType, status: 'active' }, userId);
  }

  private buildUserContext(profile: any): string {
    if (!profile) return 'No profile data available.';

    const parts: string[] = [];

    if (profile.health_profile?.conditions?.length) {
      parts.push(`Conditions: ${profile.health_profile.conditions.join(', ')}`);
    }
    if (profile.health_profile?.allergies?.length) {
      parts.push(`Allergies: ${profile.health_profile.allergies.join(', ')}`);
    }
    if (profile.lifestyle?.activity_level) {
      parts.push(`Activity Level: ${profile.lifestyle.activity_level}`);
    }

    return parts.length > 0 ? parts.join('\n') : 'No specific health data recorded yet.';
  }
}

export const aiChatService = new AIChatService();