/**
 * Mock AI Provider - Demo mode fallback, works without API keys
 */

import {
  BaseAIProvider
} from './baseProvider';
import {
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  AIStreamChunk,
  AIUsage,
  AIModelInfo,
  PrescriptionExtractionResult,
  SymptomAnalysisResult,
  CarePlanGenerationResult,
} from './types';

export class MockAIProvider extends BaseAIProvider {
  readonly name = 'mock' as const;
  readonly isAvailable = true;

  protected getDefaultModel(): string {
    return 'mock-v1';
  }

  protected getModels(): AIModelInfo[] {
    return [
      {
        id: 'mock-v1',
        name: 'Mock AI (Demo)',
        provider: 'mock',
        contextWindow: 4096,
        maxOutputTokens: 2048,
        supportsTools: false,
        supportsVision: false,
        supportsStreaming: true,
        inputCostPer1k: 0,
        outputCostPer1k: 0,
      },
    ];
  }

  async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResponse> {
    const lastMessage = messages[messages.length - 1]?.content ?? '';
    const systemPrompt = messages.find(m => m.role === 'system')?.content ?? '';

    let responseContent = this.generateMockResponse(lastMessage, systemPrompt);
    const promptTokens = await this.countTokens(messages);
    const completionTokens = this.estimateTokens(responseContent);

    // Simulate streaming delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return this.buildCompletionResponse(
      `mock-${Date.now()}`,
      options?.model ?? this.defaultModel,
      { role: 'assistant', content: responseContent },
      this.buildUsage(promptTokens, completionTokens)
    );
  }

  async *completeStream(messages: AIMessage[], options?: AICompletionOptions): AsyncIterable<AIStreamChunk> {
    const lastMessage = messages[messages.length - 1]?.content ?? '';
    const systemPrompt = messages.find(m => m.role === 'system')?.content ?? '';
    const responseContent = this.generateMockResponse(lastMessage, systemPrompt);

    const words = responseContent.split(' ');
    let accumulated = '';

    for (let i = 0; i < words.length; i++) {
      accumulated += words[i] + (i < words.length - 1 ? ' ' : '');
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

      yield {
        id: `mock-stream-${Date.now()}`,
        model: options?.model ?? this.defaultModel,
        choices: [
          {
            index: 0,
            delta: { role: 'assistant', content: words[i] + (i < words.length - 1 ? ' ' : '') },
            finishReason: i === words.length - 1 ? 'stop' : null,
          },
        ],
      };
    }
  }

  estimateCost(usage: AIUsage): number {
    return 0;
  }

  private generateMockResponse(userMessage: string, systemPrompt: string): string {
    const lowerMessage = userMessage.toLowerCase();

    // Prescription extraction mock
    if (systemPrompt.includes('prescription') || lowerMessage.includes('prescription')) {
      return JSON.stringify(this.getMockPrescriptionExtraction(), null, 2);
    }

    // Symptom analysis mock
    if (systemPrompt.includes('symptom') || lowerMessage.includes('symptom')) {
      return JSON.stringify(this.getMockSymptomAnalysis(), null, 2);
    }

    // Care plan generation mock
    if (systemPrompt.includes('care plan') || lowerMessage.includes('care plan')) {
      return JSON.stringify(this.getMockCarePlan(), null, 2);
    }

    // General health buddy chat
    return this.getMockChatResponse(userMessage);
  }

  private getMockPrescriptionExtraction(): PrescriptionExtractionResult {
    return {
      patientName: 'John Doe',
      doctorName: 'Dr. Sarah Smith, MD',
      clinicName: 'City Medical Center',
      prescriptionDate: new Date().toISOString().split('T')[0],
      medicines: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          route: 'Oral',
          instructions: 'Take in the morning with or without food',
          quantity: 30,
          refills: 2,
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '90 days',
          route: 'Oral',
          instructions: 'Take with breakfast and dinner',
          quantity: 180,
          refills: 3,
        },
      ],
      instructions: 'Follow up in 4 weeks for blood pressure check. Monitor blood sugar daily.',
      followUpDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rawText: 'Mock OCR text from prescription image...',
      confidence: 0.92,
    };
  }

  private getMockSymptomAnalysis(): SymptomAnalysisResult {
    return {
      possibleConditions: [
        {
          name: 'Viral Upper Respiratory Infection',
          probability: 0.65,
          description: 'Common cold symptoms including runny nose, sore throat, and mild cough',
          urgency: 'low',
        },
        {
          name: 'Seasonal Allergies',
          probability: 0.25,
          description: 'Allergic rhinitis triggered by pollen or environmental allergens',
          urgency: 'low',
        },
        {
          name: 'Influenza',
          probability: 0.10,
          description: 'Flu virus with more severe symptoms including fever and body aches',
          urgency: 'medium',
        },
      ],
      recommendedActions: [
        'Rest and stay hydrated',
        'Use saline nasal spray for congestion',
        'Consider OTC pain relievers for discomfort',
        'Monitor temperature',
      ],
      redFlags: [
        'Difficulty breathing or shortness of breath',
        'Persistent fever > 103°F (39.4°C)',
        'Symptoms worsening after 7-10 days',
        'Severe headache or neck stiffness',
      ],
      shouldSeeDoctor: false,
      confidence: 0.78,
    };
  }

  private getMockCarePlan(): CarePlanGenerationResult {
    return {
      title: 'Hypertension & Diabetes Management Plan',
      description: 'Comprehensive care plan for managing blood pressure and blood sugar levels',
      goals: [
        {
          title: 'Blood Pressure Control',
          description: 'Maintain BP below 130/80 mmHg',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          metrics: ['systolic_bp', 'diastolic_bp'],
        },
        {
          title: 'Blood Sugar Management',
          description: 'Keep HbA1c below 7%',
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          metrics: ['fasting_glucose', 'hba1c'],
        },
      ],
      tasks: [
        {
          title: 'Take Lisinopril 10mg daily',
          description: 'Morning dose with or without food',
          frequency: 'daily',
          priority: 'high',
          category: 'medication',
        },
        {
          title: 'Take Metformin 500mg twice daily',
          description: 'With breakfast and dinner',
          frequency: 'daily',
          priority: 'high',
          category: 'medication',
        },
        {
          title: 'Check blood pressure',
          description: 'Measure and record BP each morning',
          frequency: 'daily',
          priority: 'medium',
          category: 'monitoring',
        },
        {
          title: '30-minute walk',
          description: 'Moderate intensity walking most days',
          frequency: 'daily',
          priority: 'medium',
          category: 'lifestyle',
        },
        {
          title: 'Check fasting blood glucose',
          description: 'Weekly fasting glucose check',
          frequency: 'weekly',
          priority: 'medium',
          category: 'monitoring',
        },
      ],
      followUpSchedule: [
        {
          title: 'Primary Care Follow-up',
          description: 'BP check and medication review',
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'appointment',
        },
        {
          title: 'HbA1c Lab Test',
          description: '3-month average blood sugar check',
          dueDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'lab_test',
        },
        {
          title: 'Prescription Refill',
          description: 'Request Metformin refill (2 refills remaining)',
          dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'refill',
        },
      ],
      confidence: 0.85,
    };
  }

  private getMockChatResponse(userMessage: string): string {
    const responses = [
      "I understand you're asking about that. As your health buddy, I'm here to help! In demo mode, I can show you how the AI features work. For real medical advice, please consult a healthcare professional.",
      "That's a great question! In the full version, I'd analyze your health data and provide personalized insights. Right now I'm running in demo mode with mock responses.",
      "I can help you track medications, analyze symptoms, create care plans, and more. Would you like to see a demo of any specific feature?",
      "Remember, I'm an AI assistant, not a doctor. For any health concerns, please speak with a qualified healthcare provider.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const mockAIProvider = new MockAIProvider();