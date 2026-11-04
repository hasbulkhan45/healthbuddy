/**
 * AI Provider Factory - Manages provider selection, fallback, and connection verification
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

export interface ProviderStatus {
  name: AIProvider;
  isConfigured: boolean;
  isReachable: boolean;
  lastChecked: number | null;
  error: string | null;
}

export class AIProviderFactory {
  private providers: Map<AIProvider, AIProviderInterface> = new Map();
  private defaultProvider: AIProvider = 'mock';
  private initialized = false;
  private providerStatuses: Map<AIProvider, ProviderStatus> = new Map();
  private connectionCheckCache: Map<AIProvider, { reachable: boolean; timestamp: number }> = new Map();
  private readonly CONNECTION_CHECK_TTL = 60000; // 1 minute cache

  constructor() {
    this.registerProvider('mock', mockAIProvider);
    this.updateProviderStatus('mock', { isConfigured: true, isReachable: true, lastChecked: Date.now(), error: null });
  }

  registerProvider(name: AIProvider, provider: AIProviderInterface): void {
    this.providers.set(name, provider);
    const envKey = `${name.toUpperCase()}_API_KEY`;
    const isConfigured = name !== 'mock' && (!!process.env[envKey] || provider.isAvailable);
    this.updateProviderStatus(name, {
      isConfigured,
      isReachable: name === 'mock' || provider.isAvailable,
      lastChecked: name === 'mock' ? Date.now() : null,
      error: null,
    });
  }

  private updateProviderStatus(name: AIProvider, status: Partial<ProviderStatus>): void {
    const existing = this.providerStatuses.get(name) || {
      name,
      isConfigured: false,
      isReachable: false,
      lastChecked: null,
      error: null,
    };
    this.providerStatuses.set(name, { ...existing, ...status });
  }

  async verifyConnection(providerName: AIProvider): Promise<ProviderStatus> {
    const cached = this.connectionCheckCache.get(providerName);
    if (cached && Date.now() - cached.timestamp < this.CONNECTION_CHECK_TTL) {
      const status = this.providerStatuses.get(providerName)!;
      return { ...status, isReachable: cached.reachable };
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      const status = { name: providerName, isConfigured: false, isReachable: false, lastChecked: Date.now(), error: 'Provider not registered' };
      this.updateProviderStatus(providerName, status);
      return status;
    }

    if (providerName === 'mock') {
      const status = { name: 'mock' as AIProvider, isConfigured: true, isReachable: true, lastChecked: Date.now(), error: null };
      this.updateProviderStatus('mock', status);
      this.connectionCheckCache.set('mock', { reachable: true, timestamp: Date.now() });
      return status;
    }

    if (!provider.isAvailable) {
      const status = { name: providerName, isConfigured: true, isReachable: false, lastChecked: Date.now(), error: 'API key not configured' };
      this.updateProviderStatus(providerName, status);
      this.connectionCheckCache.set(providerName, { reachable: false, timestamp: Date.now() });
      return status as ProviderStatus;
    }

    try {
      // Send a minimal test request to verify connectivity
      const testMessages: AIMessage[] = [{ role: 'user', content: 'ping' }];
      await Promise.race([
        provider.complete(testMessages, { maxTokens: 5, temperature: 0 }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000)),
      ]);

      const status = { name: providerName, isConfigured: true, isReachable: true, lastChecked: Date.now(), error: null };
      this.updateProviderStatus(providerName, status);
      this.connectionCheckCache.set(providerName, { reachable: true, timestamp: Date.now() });
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      const status = { name: providerName, isConfigured: true, isReachable: false, lastChecked: Date.now(), error: errorMessage };
      this.updateProviderStatus(providerName, status);
      this.connectionCheckCache.set(providerName, { reachable: false, timestamp: Date.now() });
      return status as ProviderStatus;
    }
  }

  getProviderStatus(providerName: AIProvider): ProviderStatus | null {
    return this.providerStatuses.get(providerName) ?? null;
  }

  getAllProviderStatuses(): ProviderStatus[] {
    return Array.from(this.providerStatuses.values());
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