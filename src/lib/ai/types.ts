/**
 * AI Provider Types - Provider-independent interfaces
 */

export type AIProvider = 'openai' | 'anthropic' | 'mock';

export type AIMessageContent = string | AIMessageContentPart[];

export interface AIMessageContentPart {
  type: 'text' | 'image_url' | 'file';
  text?: string;
  image_url?: { url: string; detail?: 'low' | 'high' | 'auto' };
  file?: { url: string; filename?: string };
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: AIMessageContent;
  name?: string;
  tool_calls?: AIToolCall[];
  tool_call_id?: string;
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  tools?: AITool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  stream?: boolean;
  responseFormat?: { type: 'json_object' } | { type: 'text' };
}

export interface AICompletionResponse {
  id: string;
  model: string;
  choices: AICompletionChoice[];
  usage: AIUsage;
  created: number;
}

export interface AICompletionChoice {
  index: number;
  message: AIMessage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIStreamChunk {
  id: string;
  model: string;
  choices: AIStreamChoice[];
}

export interface AIStreamChoice {
  index: number;
  delta: Partial<AIMessage>;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export interface AIProviderConfig {
  apiKey?: string;
  baseURL?: string;
  organization?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AIProviderInterface {
  readonly name: AIProvider;
  readonly isAvailable: boolean;

  complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse>;
  completeStream(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<AIStreamChunk>;

  createEmbedding(text: string, options?: AIEmbeddingOptions): Promise<AIEmbeddingResponse>;

  countTokens(messages: AIMessage[]): Promise<number>;
  estimateCost(usage: AIUsage): number;
  getAvailableModels(): AIModelInfo[];
}

export interface AIModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  contextWindow: number;
  maxOutputTokens: number;
  supportsTools: boolean;
  supportsVision: boolean;
  supportsStreaming: boolean;
  inputCostPer1k: number;
  outputCostPer1k: number;
}

export interface AIEmbeddingOptions {
  model?: string;
  dimensions?: number;
  encodingFormat?: 'float' | 'base64';
}

export interface AIEmbeddingResponse {
  data: Array<{ embedding: number[]; index: number; object: 'embedding' }>;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface HealthBuddyAISystemPrompt {
  role: 'system';
  content: string;
}

export interface PrescriptionExtractionResult {
  patientName?: string;
  doctorName?: string;
  clinicName?: string;
  prescriptionDate?: string;
  medicines: ExtractedMedicine[];
  instructions?: string;
  followUpDate?: string;
  rawText: string;
  confidence: number;
}

export interface ExtractedMedicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
  quantity?: number;
  refills?: number;
}

export interface SymptomAnalysisResult {
  possibleConditions: Array<{
    name: string;
    probability: number;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
  }>;
  recommendedActions: string[];
  redFlags: string[];
  shouldSeeDoctor: boolean;
  confidence: number;
}

export interface CarePlanGenerationResult {
  title: string;
  description: string;
  goals: Array<{
    title: string;
    description: string;
    targetDate?: string;
    metrics: string[];
  }>;
  tasks: Array<{
    title: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'once';
    priority: 'low' | 'medium' | 'high';
    category: 'medication' | 'lifestyle' | 'monitoring' | 'appointment' | 'education';
  }>;
  followUpSchedule: Array<{
    title: string;
    description: string;
    dueDate: string;
    type: 'appointment' | 'lab_test' | 'checkup' | 'refill';
  }>;
  confidence: number;
}