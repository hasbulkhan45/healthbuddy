/**
 * Base AI Provider - Abstract base class for AI providers
 */

import {
  AIProviderInterface,
  AIProviderConfig,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  AIStreamChunk,
  AIUsage,
  AIModelInfo,
} from './types';

export abstract class BaseAIProvider implements AIProviderInterface {
  abstract readonly name: 'openai' | 'anthropic' | 'mock';
  abstract readonly isAvailable: boolean;

  protected config: AIProviderConfig;
  protected defaultModel: string;

  constructor(config: AIProviderConfig = {}) {
    this.config = config;
    this.defaultModel = config.defaultModel ?? this.getDefaultModel();
  }

  protected abstract getDefaultModel(): string;
  protected abstract getModels(): AIModelInfo[];

  abstract complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse>;
  abstract completeStream(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<AIStreamChunk>;

  async countTokens(messages: AIMessage[]): Promise<number> {
    let total = 0;
    for (const msg of messages) {
      total += this.estimateTokens(msg.content);
    }
    return total;
  }

  protected estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  abstract estimateCost(usage: AIUsage): number;

  protected buildCompletionResponse(
    id: string,
    model: string,
    message: AIMessage,
    usage: AIUsage,
    finishReason: AICompletionResponse['choices'][0]['finishReason'] = 'stop'
  ): AICompletionResponse {
    return {
      id,
      model,
      choices: [
        {
          index: 0,
          message,
          finishReason,
        },
      ],
      usage,
      created: Math.floor(Date.now() / 1000),
    };
  }

  protected buildUsage(promptTokens: number, completionTokens: number): AIUsage {
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }

  getAvailableModels(): AIModelInfo[] {
    return this.getModels();
  }

  getDefaultModelName(): string {
    return this.defaultModel;
  }
}