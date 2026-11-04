/**
 * AI Chat Service - Conversational health assistant with RAG
 */

import { aiProviderFactory } from '@/lib/ai';
import { profilesRepository, aiMessagesRepository, aiConversationsRepository } from '@/services/repositories';
import { embeddingsService } from '@/services/ai';
import type {
  AIMessage,
  AICompletionOptions,
  AIMessageContent,
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

function extractTextContent(content: AIMessageContent): string {
  if (typeof content === 'string') return content;
  return content
    .filter(part => part.type === 'text')
    .map(part => part.text ?? '')
    .join('');
}

function buildRagContext(results: Array<{ text: string; metadata: Record<string, unknown>; similarity: number }>): string {
  if (results.length === 0) return '';

  const parts = ['Relevant information from your health records:'];
  for (const result of results) {
    const source = result.metadata.documentType ?? 'unknown';
    parts.push(`[${source}, similarity: ${result.similarity.toFixed(2)}] ${result.text}`);
  }
  return parts.join('\n\n');
}

export class AIChatService {
  async sendMessage(
    userId: string,
    content: string,
    conversationId?: string,
    options?: AICompletionOptions & { useRag?: boolean }
  ): Promise<{ response: string; conversationId: string }> {
    let convId = conversationId;

    // Get or create conversation
    if (!convId) {
      const activeConv = await aiConversationsRepository.findActive(userId);
      if (activeConv) {
        convId = activeConv.id;
      } else {
        const newConv = await aiConversationsRepository.createConversation(
          {
            selected_context: {
              medicalReports: false,
              medicines: false,
              symptoms: false,
              healthMeasurements: false,
              healthProfile: false,
              generalKnowledgeOnly: true,
            }
          },
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
    const userContext = this.buildUserContext(profile);

    // Retrieve relevant context using RAG if enabled
    let ragContext = '';
    if (options?.useRag !== false) {
      try {
        const ragResults = await embeddingsService.search(userId, content, {
          limit: 5,
          threshold: 0.65,
        });
        ragContext = buildRagContext(ragResults);
      } catch (error) {
        console.warn('RAG search failed:', error);
      }
    }

    // Add user message
    await aiMessagesRepository.addUserMessage(convId, content, userId);

    // Get conversation history
    const history = await aiMessagesRepository.findRecentByConversation(convId, 20);

    // Build system prompt with user context and RAG context
    const systemPrompt = `${SYSTEM_PROMPT}\n\nUser Context:\n${userContext}${ragContext ? `\n\n${ragContext}` : ''}`;

    // Build messages for AI
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.sender as 'user' | 'assistant', content: m.content })),
      { role: 'user', content },
    ];

    // Get AI response
    const response = await aiProviderFactory.complete(messages, {
      ...options,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    });

    const assistantResponse = extractTextContent(response.choices[0].message.content);

    // Save assistant message
    await aiMessagesRepository.addAssistantMessage(convId, assistantResponse, userId);

    // Update conversation last message preview and increment count
    await aiConversationsRepository.updateLastMessagePreview(convId, assistantResponse.slice(0, 200));
    await aiConversationsRepository.incrementMessageCount(convId);

    return { response: assistantResponse, conversationId: convId };
  }

  async *streamMessage(
    userId: string,
    content: string,
    conversationId?: string,
    options?: AICompletionOptions & { useRag?: boolean }
  ): AsyncIterable<{ chunk: string; conversationId: string; done: boolean }> {
    let convId = conversationId;

    if (!convId) {
      const activeConv = await aiConversationsRepository.findActive(userId);
      if (activeConv) {
        convId = activeConv.id;
      } else {
        const newConv = await aiConversationsRepository.createConversation(
          {
            selected_context: {
              medicalReports: false,
              medicines: false,
              symptoms: false,
              healthMeasurements: false,
              healthProfile: false,
              generalKnowledgeOnly: true,
            }
          },
          userId
        );
        convId = newConv?.id ?? '';
      }
    }

    if (!convId) {
      throw new Error('Failed to create or find conversation');
    }

    const profile = await profilesRepository.getCurrentUserProfile();
    const userContext = this.buildUserContext(profile);

    // Retrieve relevant context using RAG if enabled
    let ragContext = '';
    if (options?.useRag !== false) {
      try {
        const ragResults = await embeddingsService.search(userId, content, {
          limit: 5,
          threshold: 0.65,
        });
        ragContext = buildRagContext(ragResults);
      } catch (error) {
        console.warn('RAG search failed:', error);
      }
    }

    await aiMessagesRepository.addUserMessage(convId, content, userId);

    const history = await aiMessagesRepository.findRecentByConversation(convId, 20);

    const systemPrompt = `${SYSTEM_PROMPT}\n\nUser Context:\n${userContext}${ragContext ? `\n\n${ragContext}` : ''}`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.sender as 'user' | 'assistant', content: m.content })),
      { role: 'user', content },
    ];

    let fullResponse = '';
    for await (const chunk of aiProviderFactory.completeStream(messages, {
      ...options,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
    })) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      const deltaText = typeof delta === 'string' ? delta : extractTextContent(delta);
      if (deltaText) {
        fullResponse += deltaText;
        yield { chunk: deltaText, conversationId: convId, done: false };
      }
      if (chunk.choices[0]?.finishReason) {
        break;
      }
    }

    await aiMessagesRepository.addAssistantMessage(convId, fullResponse, userId);

    // Update conversation last message preview and increment count
    await aiConversationsRepository.updateLastMessagePreview(convId, fullResponse.slice(0, 200));
    await aiConversationsRepository.incrementMessageCount(convId);

    yield { chunk: '', conversationId: convId, done: true };
  }

  async getConversationHistory(conversationId: string, limit = 50): Promise<AIMessage[]> {
    const messages = await aiMessagesRepository.findByConversation(conversationId, limit);
    return messages.map((m) => ({ role: m.sender as 'user' | 'assistant', content: m.content }));
  }

  async getUserConversations(userId: string) {
    return aiConversationsRepository.findByUser(userId);
  }

  async createNewConversation(userId: string, contextType: 'general' | 'prescription' | 'symptoms' | 'care_plan' = 'general') {
    const contextMap = {
      general: { medicalReports: false, medicines: false, symptoms: false, healthMeasurements: false, healthProfile: false, generalKnowledgeOnly: true },
      prescription: { medicalReports: true, medicines: true, symptoms: false, healthMeasurements: false, healthProfile: true, generalKnowledgeOnly: false },
      symptoms: { medicalReports: false, medicines: true, symptoms: true, healthMeasurements: true, healthProfile: true, generalKnowledgeOnly: false },
      care_plan: { medicalReports: true, medicines: true, symptoms: true, healthMeasurements: true, healthProfile: true, generalKnowledgeOnly: false },
    };
    return aiConversationsRepository.createConversation({
      selected_context: contextMap[contextType]
    }, userId);
  }

  private buildUserContext(profile: any): string {
    if (!profile) return 'No profile data available.';

    const parts: string[] = [];

    if (profile.health_profile?.existingConditions?.length) {
      parts.push(`Conditions: ${profile.health_profile.existingConditions.join(', ')}`);
    }
    if (profile.health_profile?.familyHistory?.length) {
      parts.push(`Family History: ${profile.health_profile.familyHistory.join(', ')}`);
    }
    if (profile.lifestyle?.activityLevel) {
      parts.push(`Activity Level: ${profile.lifestyle.activityLevel}`);
    }
    if (profile.lifestyle?.dietType) {
      parts.push(`Diet: ${profile.lifestyle.dietType}`);
    }

    return parts.length > 0 ? parts.join('\n') : 'No specific health data recorded yet.';
  }
}

export const aiChatService = new AIChatService();