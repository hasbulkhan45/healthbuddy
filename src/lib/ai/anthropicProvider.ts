/**
 * Anthropic Provider Implementation
 */

import { BaseAIProvider } from './baseProvider';
import {
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  AIStreamChunk,
  AIUsage,
  AIModelInfo,
  AIProviderConfig,
  AIMessageContent,
  AIEmbeddingOptions,
  AIEmbeddingResponse,
} from './types';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } } | { type: 'tool_use'; id: string; name: string; input: any } | { type: 'tool_result'; tool_use_id: string; content: string }>;
}

interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

interface AnthropicCompletionRequest {
  model: string;
  messages: AnthropicMessage[];
  system?: string;
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  tools?: AnthropicTool[];
  tool_choice?: { type: 'auto' } | { type: 'any' } | { type: 'tool'; name: string };
  stream?: boolean;
}

interface AnthropicCompletionResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: 'text'; text: string } | { type: 'tool_use'; id: string; name: string; input: any }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider extends BaseAIProvider {
  readonly name = 'anthropic' as const;
  readonly isAvailable: boolean;

  private baseURL: string;
  private apiKey: string;

  constructor(config: AIProviderConfig = {}) {
    super(config);
    this.apiKey = config.apiKey ?? process.env.ANTHROPIC_API_KEY ?? '';
    this.baseURL = config.baseURL ?? 'https://api.anthropic.com/v1';
    this.isAvailable = !!this.apiKey;
  }

  protected getDefaultModel(): string {
    return 'claude-3-5-haiku-20241022';
  }

  protected getModels(): AIModelInfo[] {
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        supportsTools: true,
        supportsVision: true,
        supportsStreaming: true,
        inputCostPer1k: 0.003,
        outputCostPer1k: 0.015,
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        supportsTools: true,
        supportsVision: true,
        supportsStreaming: true,
        inputCostPer1k: 0.0008,
        outputCostPer1k: 0.004,
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        contextWindow: 200000,
        maxOutputTokens: 4096,
        supportsTools: true,
        supportsVision: true,
        supportsStreaming: true,
        inputCostPer1k: 0.015,
        outputCostPer1k: 0.075,
      },
    ];
  }

  private convertMessages(messages: AIMessage[]): { system?: string; messages: AnthropicMessage[] } {
    const systemMessage = messages.find(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');

    return {
      system: typeof systemMessage?.content === 'string' ? systemMessage.content : undefined,
      messages: otherMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: this.convertContent(msg.content),
      })),
    };
  }

  private convertContent(content: AIMessageContent): AnthropicMessage['content'] {
    if (typeof content === 'string') return content;
    if (!content || content.length === 0) return '';

    return content.map(part => {
      if (part.type === 'text') {
        return { type: 'text', text: part.text ?? '' };
      } else if (part.type === 'image_url') {
        // Convert data URL to base64 for Anthropic
        const url = part.image_url?.url ?? '';
        const base64Match = url.match(/^data:([^;]+);base64,(.+)$/);
        if (base64Match) {
          return {
            type: 'image',
            source: {
              type: 'base64',
              media_type: base64Match[1],
              data: base64Match[2],
            },
          };
        }
        // For regular URLs, we'd need to fetch and convert - for now return text placeholder
        return { type: 'text', text: `[Image: ${url}]` };
      }
      return { type: 'text', text: `[File: ${(part as any).file?.url ?? 'unknown'}]` };
    });
  }

  private convertTools(tools?: AICompletionOptions['tools']): AnthropicTool[] | undefined {
    if (!tools) return undefined;
    return tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }));
  }

  async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse> {
    if (!this.isAvailable) {
      throw new Error('Anthropic API key not configured');
    }

    const { system, messages: anthropicMessages } = this.convertMessages(messages);

    const request: AnthropicCompletionRequest = {
      model: options?.model ?? this.defaultModel,
      messages: anthropicMessages,
      system,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      top_p: options?.topP,
      tools: this.convertTools(options?.tools),
      tool_choice: options?.toolChoice ? this.convertToolChoice(options.toolChoice) : undefined,
      stream: false,
    };

    const response = await this.makeRequest('/messages', request);
    return this.transformResponse(response);
  }

  async *completeStream(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<AIStreamChunk> {
    if (!this.isAvailable) {
      throw new Error('Anthropic API key not configured');
    }

    const { system, messages: anthropicMessages } = this.convertMessages(messages);

    const request: AnthropicCompletionRequest = {
      model: options?.model ?? this.defaultModel,
      messages: anthropicMessages,
      system,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      top_p: options?.topP,
      tools: this.convertTools(options?.tools),
      tool_choice: options?.toolChoice ? this.convertToolChoice(options.toolChoice) : undefined,
      stream: true,
    };

    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response stream');
    }

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('event: ')) continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield {
                id: parsed.id ?? `anthropic-${Date.now()}`,
                model: request.model,
                choices: [
                  {
                    index: 0,
                    delta: { content: parsed.delta.text },
                    finishReason: null,
                  },
                ],
              };
            } else if (parsed.type === 'message_delta' && parsed.delta?.stop_reason) {
              yield {
                id: parsed.id ?? `anthropic-${Date.now()}`,
                model: request.model,
                choices: [
                  {
                    index: 0,
                    delta: {},
                    finishReason: this.mapStopReason(parsed.delta.stop_reason),
                  },
                ],
              };
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }

  private convertToolChoice(choice: AICompletionOptions['toolChoice']): AnthropicCompletionRequest['tool_choice'] {
    if (choice === 'auto') return { type: 'auto' };
    if (choice === 'none') return { type: 'auto' }; // Anthropic doesn't have 'none', use auto
    if (typeof choice === 'object' && choice.type === 'function') {
      return { type: 'tool', name: choice.function.name };
    }
    return { type: 'auto' };
  }

  private mapStopReason(reason: string): AICompletionResponse['choices'][0]['finishReason'] {
    switch (reason) {
      case 'end_turn': return 'stop';
      case 'max_tokens': return 'length';
      case 'tool_use': return 'tool_calls';
      default: return 'stop';
    }
  }

  private async makeRequest(endpoint: string, body: any): Promise<AnthropicCompletionResponse> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }

  private transformResponse(response: AnthropicCompletionResponse): AICompletionResponse {
    const textContent = response.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('');

    const toolCalls = response.content
      .filter(c => c.type === 'tool_use')
      .map(c => ({
        id: c.id,
        type: 'function' as const,
        function: { name: c.name, arguments: JSON.stringify(c.input) },
      }));

    return {
      id: response.id,
      model: response.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: textContent,
            tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
          },
          finishReason: this.mapStopReason(response.stop_reason ?? 'end_turn'),
        },
      ],
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      created: Math.floor(Date.now() / 1000),
    };
  }

  estimateCost(usage: AIUsage): number {
    const modelInfo = this.getModels().find(m => m.id === this.defaultModel);
    if (!modelInfo) return 0;

    const inputCost = (usage.promptTokens / 1000) * modelInfo.inputCostPer1k;
    const outputCost = (usage.completionTokens / 1000) * modelInfo.outputCostPer1k;
    return inputCost + outputCost;
  }

  async createEmbedding(text: string, options?: AIEmbeddingOptions): Promise<AIEmbeddingResponse> {
    // Anthropic doesn't have an embeddings API
    // In production, you would use a different provider (OpenAI, Cohere, etc.) for embeddings
    throw new Error('Anthropic does not provide embeddings API. Use OpenAI provider for embeddings.');
  }
}