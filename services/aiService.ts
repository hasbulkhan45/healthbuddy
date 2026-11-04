import { AIConversation, AIMessage, AIContextSelection } from "@/types/ai";

export const aiService = {
  async getConversations(): Promise<AIConversation[]> {
    return [];
  },

  async getConversationById(id: string): Promise<AIConversation | undefined> {
    return undefined;
  },

  async sendMessage(params: {
    conversationId: string;
    message: string;
    selectedContext: AIContextSelection;
  }): Promise<AIMessage> {
    throw new Error("AI API not configured. Please set up your API keys (OPENAI_API_KEY or ANTHROPIC_API_KEY) to use the chatbot.");
  },

  subscribe(callback: () => void) {
    return () => {};
  },
};

