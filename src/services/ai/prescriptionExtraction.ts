/**
 * Prescription Extraction Service - OCR text → structured prescription data
 */

import { aiProviderFactory } from '@/lib/ai';
import type {
  AIMessage,
  PrescriptionExtractionResult,
  ExtractedMedicine,
  AIMessageContent,
} from '@/lib/ai/types';

function extractTextContent(content: AIMessageContent): string {
  if (typeof content === 'string') return content;
  return content
    .filter(part => part.type === 'text')
    .map(part => part.text ?? '')
    .join('');
}

const SYSTEM_PROMPT = `You are a medical prescription extraction specialist. Extract structured data from prescription text/OCR output.

Return a JSON object with this exact structure:
{
  "patientName": "string or null",
  "doctorName": "string or null",
  "clinicName": "string or null",
  "prescriptionDate": "YYYY-MM-DD or null",
  "medicines": [
    {
      "name": "string (required)",
      "dosage": "string or null",
      "frequency": "string or null",
      "duration": "string or null",
      "route": "string or null",
      "instructions": "string or null",
      "quantity": "number or null",
      "refills": "number or null"
    }
  ],
  "instructions": "string or null",
  "followUpDate": "YYYY-MM-DD or null",
  "rawText": "string (original input)",
  "confidence": "number 0-1"
}

Rules:
- Extract medicine names exactly as written
- Normalize dosages (e.g., "10 mg" → "10mg")
- Frequency: use standard terms (once daily, twice daily, every 8 hours, etc.)
- Duration: include units (days, weeks, months)
- Route: oral, topical, injection, inhalation, etc.
- Confidence: your confidence in the extraction accuracy (0-1)
- If information is not present, use null
- Return ONLY the JSON object, no additional text`;

export class PrescriptionExtractionService {
  async extractFromText(text: string): Promise<PrescriptionExtractionResult> {
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ];

    const response = await aiProviderFactory.complete(messages, {
      responseFormat: { type: 'json_object' },
      temperature: 0.1,
    });

    try {
      const result = JSON.parse(extractTextContent(response.choices[0].message.content)) as PrescriptionExtractionResult;
      return {
        ...result,
        rawText: text,
        medicines: result.medicines ?? [],
      };
    } catch (error) {
      console.error('Failed to parse prescription extraction:', error);
      return this.getFallbackResult(text);
    }
  }

  async extractFromImage(base64Image: string, mimeType: string): Promise<PrescriptionExtractionResult> {
    // For now, we'll use text extraction. In a full implementation,
    // this would use a vision model to extract text from the image first.
    const messages: AIMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `[Image provided: ${mimeType}. Please extract prescription text from this image and then parse it. For demo purposes, returning mock data.]`,
      },
    ];

    const response = await aiProviderFactory.complete(messages, {
      responseFormat: { type: 'json_object' },
      temperature: 0.1,
    });

    try {
      return JSON.parse(extractTextContent(response.choices[0].message.content)) as PrescriptionExtractionResult;
    } catch {
      return this.getFallbackResult('');
    }
  }

  private getFallbackResult(text: string): PrescriptionExtractionResult {
    return {
      patientName: undefined,
      doctorName: undefined,
      clinicName: undefined,
      prescriptionDate: undefined,
      medicines: [],
      instructions: undefined,
      followUpDate: undefined,
      rawText: text,
      confidence: 0,
    };
  }

  validateExtraction(result: PrescriptionExtractionResult): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!result.medicines || result.medicines.length === 0) {
      errors.push('No medicines found in prescription');
    }

    for (let i = 0; i < result.medicines.length; i++) {
      const med = result.medicines[i];
      if (!med.name || med.name.trim() === '') {
        errors.push(`Medicine ${i + 1}: Name is required`);
      }
    }

    if (result.confidence < 0.5) {
      errors.push('Low confidence extraction - manual review recommended');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const prescriptionExtractionService = new PrescriptionExtractionService();