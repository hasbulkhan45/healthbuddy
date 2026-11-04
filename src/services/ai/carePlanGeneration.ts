/**
 * Care Plan Generation Service - Health data → personalized care plan
 */

import { aiProviderFactory } from '@/lib/ai';
import type {
  AIMessage,
  CarePlanGenerationResult,
  AIMessageContent,
} from '@/lib/ai/types';

function extractTextContent(content: AIMessageContent): string {
  if (typeof content === 'string') return content;
  return content
    .filter(part => part.type === 'text')
    .map(part => part.text ?? '')
    .join('');
}

const SYSTEM_PROMPT = `You are a healthcare care plan generator. Create personalized care plans based on user health data.

Return a JSON object with this exact structure:
{
  "title": "string (required)",
  "description": "string (required)",
  "goals": [
    {
      "title": "string (required)",
      "description": "string (required)",
      "targetDate": "YYYY-MM-DD or null",
      "metrics": ["string"]
    }
  ],
  "tasks": [
    {
      "title": "string (required)",
      "description": "string (required)",
      "frequency": "'daily' | 'weekly' | 'monthly' | 'once' (required)",
      "priority": "'low' | 'medium' | 'high' (required)",
      "category": "'medication' | 'lifestyle' | 'monitoring' | 'appointment' | 'education' (required)"
    }
  ],
  "followUpSchedule": [
    {
      "title": "string (required)",
      "description": "string (required)",
      "dueDate": "YYYY-MM-DD (required)",
      "type": "'appointment' | 'lab_test' | 'checkup' | 'refill' (required)"
    }
  ],
  "confidence": "number 0-1"
}

Rules:
- Goals: 2-4 measurable health goals with target dates
- Tasks: 5-10 actionable tasks across categories
- Follow-ups: 3-5 scheduled follow-ups with specific dates
- Frequencies: daily, weekly, monthly, once
- Priorities: high (critical), medium (important), low (optional)
- Categories: medication, lifestyle, monitoring, appointment, education
- Follow-up types: appointment, lab_test, checkup, refill
- Dates: realistic future dates (use ISO format YYYY-MM-DD)
- Confidence: your confidence in the plan quality
- Return ONLY the JSON object, no additional text

IMPORTANT: This is a care plan template, not medical advice. Users should review with their healthcare provider.`;

export class CarePlanGenerationService {
  async generate(data: {
    conditions?: string[];
    medications?: Array<{ name: string; dosage: string; frequency: string }>;
    healthMetrics?: Array<{ type: string; value: number; unit: string; date: string }>;
    goals?: string[];
    userProfile?: {
      age?: number;
      gender?: string;
      lifestyle?: {
        activityLevel?: string;
        diet?: string;
        sleepHours?: number;
      };
    };
  }): Promise<CarePlanGenerationResult> {
    let userMessage = 'Generate a personalized care plan based on this health data:\n\n';

    if (data.conditions?.length) {
      userMessage += `Conditions: ${data.conditions.join(', ')}\n`;
    }
    if (data.medications?.length) {
      userMessage += `Medications: ${data.medications.map(m => `${m.name} ${m.dosage} ${m.frequency}`).join(', ')}\n`;
    }
    if (data.healthMetrics?.length) {
      userMessage += `Recent Metrics: ${data.healthMetrics.map(m => `${m.type}: ${m.value} ${m.unit} (${m.date})`).join(', ')}\n`;
    }
    if (data.goals?.length) {
      userMessage += `User Goals: ${data.goals.join(', ')}\n`;
    }
    if (data.userProfile) {
      userMessage += `Profile: Age ${data.userProfile.age ?? 'unknown'}, Gender ${data.userProfile.gender ?? 'unknown'}`;
      if (data.userProfile.lifestyle) {
        userMessage += `, Activity: ${data.userProfile.lifestyle.activityLevel ?? 'unknown'}, Diet: ${data.userProfile.lifestyle.diet ?? 'unknown'}, Sleep: ${data.userProfile.lifestyle.sleepHours ?? 'unknown'} hrs`;
      }
      userMessage += '\n';
    }

    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ];

    const response = await aiProviderFactory.complete(messages, {
      responseFormat: { type: 'json_object' },
      temperature: 0.3,
    });

    try {
      return JSON.parse(extractTextContent(response.choices[0].message.content)) as CarePlanGenerationResult;
    } catch (error) {
      console.error('Failed to parse care plan generation:', error);
      return this.getFallbackPlan(data);
    }
  }

  async generateFromPrescription(extractedData: {
    medicines: Array<{ name: string; dosage?: string; frequency?: string; duration?: string; instructions?: string }>;
    instructions?: string;
    followUpDate?: string;
  }): Promise<CarePlanGenerationResult> {
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Generate a care plan based on this prescription:\n\nMedicines: ${extractedData.medicines.map(m => `${m.name} ${m.dosage ?? ''} ${m.frequency ?? ''}`.trim()).join(', ')}\n${extractedData.instructions ? `Instructions: ${extractedData.instructions}` : ''}\n${extractedData.followUpDate ? `Follow-up: ${extractedData.followUpDate}` : ''}`,
      },
    ];

    const response = await aiProviderFactory.complete(messages, {
      responseFormat: { type: 'json_object' },
      temperature: 0.3,
    });

    try {
      return JSON.parse(extractTextContent(response.choices[0].message.content)) as CarePlanGenerationResult;
    } catch {
      return this.getFallbackPlan({});
    }
  }

  private getFallbackPlan(data: any): CarePlanGenerationResult {
    return {
      title: 'Personalized Care Plan',
      description: 'A basic care plan template. Please customize with your healthcare provider.',
      goals: [
        {
          title: 'Follow prescribed treatment',
          description: 'Take medications as directed and attend follow-up appointments',
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          metrics: ['medication_adherence'],
        },
      ],
      tasks: [
        {
          title: 'Take medications as prescribed',
          description: 'Follow your doctor\'s instructions for all medications',
          frequency: 'daily',
          priority: 'high',
          category: 'medication',
        },
        {
          title: 'Schedule follow-up appointment',
          description: 'Book a check-up with your healthcare provider',
          frequency: 'once',
          priority: 'high',
          category: 'appointment',
        },
      ],
      followUpSchedule: [
        {
          title: 'Follow-up appointment',
          description: 'Check-in with healthcare provider',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          type: 'appointment',
        },
      ],
      confidence: 0.3,
    };
  }
}

export const carePlanGenerationService = new CarePlanGenerationService();