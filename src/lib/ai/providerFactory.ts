/**
 * AI Provider Factory - Manages provider selection and fallback
 */

import {
  AIProvider,
  AIProviderInterface,
  AIProviderConfig,
  AIModelInfo,
  AICompletionOptions,
  AICompletionResponse,
  AIStreamChunk,
  AIMessage,
  AIUsage,
} from './types';
import { BaseAIProvider } from './baseProvider';
import { MockAIProvider, mockAIProvider } from './mockProvider';
import { OpenAIProvider } from './openaiProvider';
import { AnthropicProvider } from './anthropicProvider';

export class AIProviderFactory {
  private providers: Map<AIProvider, AIProviderInterface> = new Map();
  private defaultProvider: AIProvider = 'mock';
  private initialized = false;

  constructor() {
    this.registerProvider('mock', mockAIProvider);
  }

  registerProvider(name: AIProvider, provider: AIProviderInterface): void {
    this.providers.set(name, provider);
  }

  initialize(config: {
    defaultProvider?: AIProvider;
    openai?: AIProviderConfig;
    anthropic?: AIProviderConfig;
  } = {}): void {
    if (this.initialized) return;

    if (config.openai?.apiKey || process.env.OPENAI_API_KEY) {
      this.registerProvider('openai', new OpenAIProvider(config.openai));
    }

    if (config.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY) {
      this.registerProvider('anthropic', new AnthropicProvider(config.anthropic));
    }

    this.defaultProvider = config.defaultProvider ?? this.selectBestAvailable();
    this.initialized = true;
  }

  private selectBestAvailable(): AIProvider {
    const priority: AIProvider[] = ['anthropic', 'openai', 'mock'];
    for (const provider of priority) {
      const p = this.providers.get(provider);
      if (p && p.isAvailable) return provider;
    }
    return 'mock';
  }

  getProvider(name?: AIProvider): AIProviderInterface {
    const providerName = name ?? this.defaultProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      console.warn(`Provider ${providerName} not found, falling back to mock`);
      return mockAIProvider;
    }

    if (!provider.isAvailable) {
      console.warn(`Provider ${providerName} not available, falling back to mock`);
      return mockAIProvider;
    }

    return provider;
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.entries())
      .filter(([_, p]) => p.isAvailable)
      .map(([name]) => name);
  }

  getAllModels(): AIModelInfo[] {
    const models: AIModelInfo[] = [];
    for (const provider of this.providers.values()) {
      models.push(...provider.getAvailableModels());
    }
    return models;
  }

  async complete(
    messages: AIMessage[],
    options?: AICompletionOptions & { provider?: AIProvider }
  ): Promise<AICompletionResponse> {
    const provider = this.getProvider(options?.provider);
    return provider.complete(messages, options);
  }

  async *completeStream(
    messages: AIMessage[],
    options?: AICompletionOptions & { provider?: AIProvider }
  ): AsyncIterable<AIStreamChunk> {
    const provider = this.getProvider(options?.provider);
    yield* provider.completeStream(messages, options);
  }

  async countTokens(messages: AIMessage[], providerName?: AIProvider): Promise<number> {
    const provider = this.getProvider(providerName);
    return provider.countTokens(messages);
  }

  estimateCost(usage: AIUsage, providerName?: AIProvider): number {
    const provider = this.getProvider(providerName);
    return provider.estimateCost(usage);
  }

  getDefaultProvider(): AIProvider {
    return this.defaultProvider;
  }

  setDefaultProvider(name: AIProvider): void {
    if (this.providers.has(name)) {
      this.defaultProvider = name;
    }
  }
}

export const aiProviderFactory = new AIProviderFactory();