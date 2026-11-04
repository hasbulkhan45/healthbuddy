/**
 * Symptom Analysis Service - Symptoms → possible conditions & recommendations
 */

import { aiProviderFactory } from '@/lib/ai';
import type {
  AIMessage,
  SymptomAnalysisResult,
  AIMessageContent,
} from '@/lib/ai/types';

function extractTextContent(content: AIMessageContent): string {
  if (typeof content === 'string') return content;
  return content
    .filter(part => part.type === 'text')
    .map(part => part.text ?? '')
    .join('');
}

const SYSTEM_PROMPT = `You are a medical symptom analysis assistant. Analyze user-reported symptoms and provide structured guidance.

Return a JSON object with this exact structure:
{
  "possibleConditions": [
    {
      "name": "string (required)",
      "probability": "number 0-1 (required)",
      "description": "string (required)",
      "urgency": "'low' | 'medium' | 'high' | 'emergency' (required)"
    }
  ],
  "recommendedActions": ["string"],
  "redFlags": ["string"],
  "shouldSeeDoctor": "boolean",
  "confidence": "number 0-1"
}

Rules:
- List 3-5 most likely conditions in order of probability
- Probabilities should sum to approximately 1.0
- Urgency: low (self-care), medium (schedule appointment), high (urgent care), emergency (ER/911)
- Recommended actions: practical self-care steps
- Red flags: symptoms requiring immediate medical attention
- shouldSeeDoctor: true if any condition has medium/high/emergency urgency
- Confidence: your confidence in the analysis
- Return ONLY the JSON object, no additional text

IMPORTANT DISCLAIMER: This is for informational purposes only, not medical advice. Always consult a healthcare professional.`;

export class SymptomAnalysisService {
  async analyze(symptoms: string, userContext?: {
    age?: number;
    gender?: string;
    medicalHistory?: string[];
    currentMedications?: string[];
  }): Promise<SymptomAnalysisResult> {
    let userMessage = `Symptoms: ${symptoms}`;

    if (userContext) {
      const contextParts: string[] = [];
      if (userContext.age) contextParts.push(`Age: ${userContext.age}`);
      if (userContext.gender) contextParts.push(`Gender: ${userContext.gender}`);
      if (userContext.medicalHistory?.length) contextParts.push(`Medical History: ${userContext.medicalHistory.join(', ')}`);
      if (userContext.currentMedications?.length) contextParts.push(`Current Medications: ${userContext.currentMedications.join(', ')}`);

      if (contextParts.length > 0) {
        userMessage += `\n\nContext:\n${contextParts.join('\n')}`;
      }
    }

    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ];

    const response = await aiProviderFactory.complete(messages, {
      responseFormat: { type: 'json_object' },
      temperature: 0.2,
    });

    try {
      return JSON.parse(extractTextContent(response.choices[0].message.content)) as SymptomAnalysisResult;
    } catch (error) {
      console.error('Failed to parse symptom analysis:', error);
      return this.getFallbackResult();
    }
  }

  async analyzeStructured(symptoms: Array<{
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration?: string;
    location?: string;
    triggers?: string[];
    associatedSymptoms?: string[];
  }>, userContext?: {
    age?: number;
    gender?: string;
    medicalHistory?: string[];
    currentMedications?: string[];
  }): Promise<SymptomAnalysisResult> {
    const symptomsText = symptoms.map(s => {
      let desc = `${s.name} (${s.severity})`;
      if (s.duration) desc += ` - Duration: ${s.duration}`;
      if (s.location) desc += ` - Location: ${s.location}`;
      if (s.triggers?.length) desc += ` - Triggers: ${s.triggers.join(', ')}`;
      if (s.associatedSymptoms?.length) desc += ` - Associated: ${s.associatedSymptoms.join(', ')}`;
      return desc;
    }).join('\n');

    return this.analyze(symptomsText, userContext);
  }

  private getFallbackResult(): SymptomAnalysisResult {
    return {
      possibleConditions: [
        {
          name: 'Unable to analyze',
          probability: 1,
          description: 'Please try again or consult a healthcare professional',
          urgency: 'low',
        },
      ],
      recommendedActions: ['Consult a healthcare professional for proper evaluation'],
      redFlags: ['Any worsening symptoms', 'Difficulty breathing', 'Chest pain', 'Severe headache'],
      shouldSeeDoctor: true,
      confidence: 0,
    };
  }
}

export const symptomAnalysisService = new SymptomAnalysisService();