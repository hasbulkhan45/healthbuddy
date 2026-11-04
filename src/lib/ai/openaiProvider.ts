/**
 * OpenAI Provider Implementation
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
  AIMessageContentPart,
  AIEmbeddingOptions,
  AIEmbeddingResponse,
} from './types';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail?: string } }>;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  tools?: any[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  stream?: boolean;
  response_format?: { type: 'json_object' } | { type: 'text' };
}

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider extends BaseAIProvider {
  readonly name = 'openai' as const;
  readonly isAvailable: boolean;

  private baseURL: string;
  private apiKey: string;

  constructor(config: AIProviderConfig = {}) {
    super(config);
    this.apiKey = config.apiKey ?? process.env.OPENAI_API_KEY ?? '';
    this.baseURL = config.baseURL ?? 'https://api.openai.com/v1';
    this.isAvailable = !!this.apiKey;
  }

  protected getDefaultModel(): string {
    return 'gpt-4o-mini';
  }

  protected getModels(): AIModelInfo[] {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        supportsTools: true,
        supportsVision: true,
        supportsStreaming: true,
        inputCostPer1k: 0.005,
        outputCostPer1k: 0.015,
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        supportsTools: true,
        supportsVision: true,
        supportsStreaming: true,
        inputCostPer1k: 0.00015,
        outputCostPer1k: 0.0006,
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        supportsTools: true,
        supportsVision: true,
        supportsStreaming: true,
        inputCostPer1k: 0.01,
        outputCostPer1k: 0.03,
      },
    ];
  }

  private convertMessages(messages: AIMessage[]): OpenAIMessage[] {
    return messages.map(msg => ({
      role: msg.role,
      content: this.convertContent(msg.content),
      name: msg.name,
      tool_calls: msg.tool_calls,
      tool_call_id: msg.tool_call_id,
    }));
  }

  private convertContent(content: AIMessageContent): OpenAIMessage['content'] {
    if (typeof content === 'string') return content;
    if (!content || content.length === 0) return null;

    return content.map(part => {
      if (part.type === 'text') {
        return { type: 'text', text: part.text ?? '' };
      } else if (part.type === 'image_url') {
        const detail = (part.image_url?.detail as 'low' | 'high' | 'auto') ?? 'auto';
        return { type: 'image_url', image_url: { url: part.image_url?.url ?? '', detail } };
      }
      // For file type, treat as image_url for OpenAI
      return { type: 'image_url', image_url: { url: (part as any).file?.url ?? '', detail: 'auto' as const } };
    });
  }

  private convertTools(tools?: AICompletionOptions['tools']): any[] | undefined {
    return tools;
  }

  async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse> {
    if (!this.isAvailable) {
      throw new Error('OpenAI API key not configured');
    }

    const request: OpenAICompletionRequest = {
      model: options?.model ?? this.defaultModel,
      messages: this.convertMessages(messages),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      tools: this.convertTools(options?.tools),
      tool_choice: options?.toolChoice,
      response_format: options?.responseFormat,
      stream: false,
    };

    const response = await this.makeRequest('/chat/completions', request);
    return this.transformResponse(response);
  }

  async *completeStream(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<AIStreamChunk> {
    if (!this.isAvailable) {
      throw new Error('OpenAI API key not configured');
    }

    const request: OpenAICompletionRequest = {
      model: options?.model ?? this.defaultModel,
      messages: this.convertMessages(messages),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      top_p: options?.topP,
      tools: this.convertTools(options?.tools),
      tool_choice: options?.toolChoice,
      response_format: options?.responseFormat,
      stream: true,
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
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
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            yield this.transformStreamChunk(parsed);
          } catch {
            // Ignore parse errors
          }
        }
      }
    }
  }

  private async makeRequest(endpoint: string, body: any): Promise<OpenAICompletionResponse> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...(this.config.organization ? { 'OpenAI-Organization': this.config.organization } : {}),
    };
  }

  private transformResponse(response: OpenAICompletionResponse): AICompletionResponse {
    const choice = response.choices[0];
    return {
      id: response.id,
      model: response.model,
      choices: [
        {
          index: choice.index,
          message: {
            role: choice.message.role,
            content: choice.message.content ?? '',
            tool_calls: choice.message.tool_calls,
          } as AIMessage,
          finishReason: choice.finish_reason as AICompletionResponse['choices'][0]['finishReason'],
        },
      ],
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
      created: response.created,
    };
  }

  private transformStreamChunk(chunk: any): AIStreamChunk {
    const choice = chunk.choices?.[0];
    return {
      id: chunk.id,
      model: chunk.model,
      choices: [
        {
          index: choice?.index ?? 0,
          delta: {
            role: choice?.delta?.role,
            content: choice?.delta?.content,
            tool_calls: choice?.delta?.tool_calls,
          },
          finishReason: choice?.finish_reason ?? null,
        },
      ],
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
    if (!this.isAvailable) {
      throw new Error('OpenAI API key not configured');
    }

    const model = options?.model ?? 'text-embedding-3-small';
    const dimensions = options?.dimensions ?? 1536;

    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        input: text,
        dimensions: model === 'text-embedding-3-small' || model === 'text-embedding-3-large' ? dimensions : undefined,
        encoding_format: options?.encodingFormat ?? 'float',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Embeddings API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      data: data.data.map((d: any, index: number) => ({
        embedding: d.embedding,
        index,
        object: 'embedding',
      })),
      usage: {
        promptTokens: data.usage.prompt_tokens,
        totalTokens: data.usage.total_tokens,
      },
      model: data.model,
    };
  }
}