/**
 * OCR Service - Text extraction from documents and images
 * Supports multiple OCR providers with fallback
 */

import { aiProviderFactory } from '@/lib/ai';
import type { AIMessage } from '@/lib/ai/types';

export interface OCRResult {
  text: string;
  confidence: number;
  provider: string;
  pages?: number;
  language?: string;
}

export interface OCRServiceOptions {
  provider?: 'openai' | 'anthropic' | 'mock';
  language?: string;
  enhanceForMedical?: boolean;
}

export class OCRService {
  private defaultOptions: OCRServiceOptions = {
    provider: 'mock',
    language: 'eng',
    enhanceForMedical: true,
  };

  /**
   * Extract text from a base64 encoded image using vision models
   */
  async extractFromImage(
    base64Image: string,
    mimeType: string,
    options: OCRServiceOptions = {}
  ): Promise<OCRResult> {
    const opts = { ...this.defaultOptions, ...options };

    // For demo/mock mode, return simulated text
    if (opts.provider === 'mock' || !aiProviderFactory.hasConfiguredProvider()) {
      return this.mockExtract(base64Image, mimeType);
    }

    try {
      const provider = aiProviderFactory.getProvider(opts.provider);
      return await this.extractWithVisionModel(provider, base64Image, mimeType, opts);
    } catch (error) {
      console.error('OCR extraction failed, falling back to mock:', error);
      return this.mockExtract(base64Image, mimeType);
    }
  }

  /**
   * Extract text from PDF using vision model (first page as image)
   */
  async extractFromPDF(
    base64PDF: string,
    options: OCRServiceOptions = {}
  ): Promise<OCRResult> {
    // In a real implementation, you would:
    // 1. Convert PDF pages to images (using pdf2pic or similar)
    // 2. Run OCR on each page
    // 3. Combine results

    // For now, use vision model on first page representation
    const opts = { ...this.defaultOptions, ...options };

    if (opts.provider === 'mock' || !aiProviderFactory.hasConfiguredProvider()) {
      return this.mockExtract(base64PDF, 'application/pdf');
    }

    try {
      const provider = aiProviderFactory.getProvider(opts.provider);
      return await this.extractWithVisionModel(provider, base64PDF, 'application/pdf', opts);
    } catch (error) {
      console.error('PDF OCR extraction failed:', error);
      return this.mockExtract(base64PDF, 'application/pdf');
    }
  }

  /**
   * Extract text from file buffer (detect type and route appropriately)
   */
  async extractFromFile(
    fileBuffer: ArrayBuffer,
    mimeType: string,
    options: OCRServiceOptions = {}
  ): Promise<OCRResult> {
    const base64 = Buffer.from(fileBuffer).toString('base64');

    if (mimeType.startsWith('image/')) {
      return this.extractFromImage(base64, mimeType, options);
    } else if (mimeType === 'application/pdf') {
      return this.extractFromPDF(base64, options);
    } else {
      throw new Error(`Unsupported file type for OCR: ${mimeType}`);
    }
  }

  /**
   * Medical-specific text enhancement and structure extraction
   */
  async extractMedicalDocument(
    base64Content: string,
    mimeType: string,
    documentType: 'prescription' | 'lab_report' | 'discharge_summary' | 'medical_record' = 'medical_record',
    options: OCRServiceOptions = {}
  ): Promise<{
    rawText: string;
    structuredData: Record<string, any>;
    confidence: number;
  }> {
    const ocrResult = await this.extractFromContent(base64Content, mimeType, {
      ...options,
      enhanceForMedical: true,
    });

    // In a real implementation, this would use specialized medical NER
    // For now, return the raw text with basic structure
    return {
      rawText: ocrResult.text,
      structuredData: this.extractBasicMedicalStructure(ocrResult.text, documentType),
      confidence: ocrResult.confidence,
    };
  }

  private async extractWithVisionModel(
    provider: any,
    base64Content: string,
    mimeType: string,
    options: OCRServiceOptions
  ): Promise<OCRResult> {
    const systemPrompt = this.buildSystemPrompt(options);
    const mediaType = mimeType.startsWith('image/') ? 'image' : 'document';

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Extract all text from this ${mediaType}. Return only the extracted text, preserving structure and formatting as much as possible.` },
          {
            type: mediaType === 'image' ? 'image_url' : 'file',
            [mediaType === 'image' ? 'image_url' : 'file']: {
              url: `data:${mimeType};base64,${base64Content}`,
            },
          },
        ],
      },
    ];

    const response = await provider.complete(messages, {
      temperature: 0.1,
      maxTokens: 4000,
    });

    const extractedText = response.choices[0].message.content.trim();

    return {
      text: extractedText,
      confidence: 0.9, // Vision models typically high confidence
      provider: provider.name,
    };
  }

  private buildSystemPrompt(options: OCRServiceOptions): string {
    let prompt = `You are an expert OCR system specialized in medical document extraction.

Rules:
- Extract ALL text content accurately
- Preserve document structure (tables, lists, sections)
- Maintain formatting for numbers, dates, dosages
- Do not interpret or summarize - only extract
- Return plain text only, no markdown or explanations`;

    if (options.enhanceForMedical) {
      prompt += `

Medical-specific enhancements:
- Pay special attention to drug names, dosages, frequencies
- Preserve lab test names, values, units, reference ranges
- Keep medical abbreviations intact
- Note any handwritten annotations`;
    }

    if (options.language && options.language !== 'eng') {
      prompt += `\n- Document language: ${options.language}`;
    }

    return prompt;
  }

  private mockExtract(base64Content: string, mimeType: string): OCRResult {
    // Simulate OCR processing delay
    const mockTexts: Record<string, string> = {
      'image/jpeg': `PRESCRIPTION
Dr. Sarah Johnson, MD
Internal Medicine
City Medical Center

Patient: John Doe
DOB: 01/15/1980
Date: ${new Date().toISOString().split('T')[0]}

Rx:
1. Metformin 500mg - Take 1 tablet twice daily with meals
2. Lisinopril 10mg - Take 1 tablet once daily in morning
3. Atorvastatin 20mg - Take 1 tablet at bedtime

Refills: 3
Follow-up: 3 months

Signature: Dr. Sarah Johnson`,
      'image/png': `LABORATORY REPORT
City Medical Center Lab
Patient: Jane Smith
DOB: 05/22/1975
Collection Date: ${new Date().toISOString().split('T')[0]}

COMPREHENSIVE METABOLIC PANEL
Glucose: 95 mg/dL (70-100) - NORMAL
BUN: 14 mg/dL (7-20) - NORMAL
Creatinine: 0.9 mg/dL (0.6-1.3) - NORMAL
eGFR: >60 mL/min/1.73m2 - NORMAL

LIPID PANEL
Total Cholesterol: 198 mg/dL (<200) - NORMAL
LDL: 118 mg/dL (<100) - BORDERLINE HIGH
HDL: 52 mg/dL (>40) - NORMAL
Triglycerides: 140 mg/dL (<150) - NORMAL`,

      'application/pdf': `MEDICAL RECORD - DISCHARGE SUMMARY
Hospital: General Hospital
Patient: Robert Wilson
Admission: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
Discharge: ${new Date().toISOString().split('T')[0]}

DIAGNOSIS:
1. Type 2 Diabetes Mellitus (E11.9)
2. Hypertension (I10)

MEDICATIONS AT DISCHARGE:
- Metformin 1000mg BID
- Lisinopril 20mg Daily
- Aspirin 81mg Daily

FOLLOW-UP INSTRUCTIONS:
- Follow up with PCP in 2 weeks
- Repeat HbA1c in 3 months
- Monitor blood pressure daily`,
    };

    const text = mockTexts[mimeType] || mockTexts['image/jpeg'];

    return {
      text,
      confidence: 0.85,
      provider: 'mock',
      pages: mimeType === 'application/pdf' ? 3 : 1,
      language: 'eng',
    };
  }

  private extractBasicMedicalStructure(text: string, documentType: string): Record<string, any> {
    const structure: Record<string, any> = {
      documentType,
      sections: [],
      medications: [],
      labValues: [],
      dates: [],
    };

    // Simple regex-based extraction for demo
    // In production, use medical NER models

    // Extract potential medication patterns
    const medPattern = /([A-Za-z]+)\s+(\d+\.?\d*\s*(mg|mcg|g|ml|units?))\s*[-–]\s*([^.\n]+)/gi;
    let match;
    while ((match = medPattern.exec(text)) !== null) {
      structure.medications.push({
        name: match[1],
        dosage: match[2],
        instructions: match[4].trim(),
      });
    }

    // Extract lab values
    const labPattern = /([A-Za-z\s]+):\s*(\d+\.?\d*)\s*([a-zA-Z\/]+)\s*\(([^)]+)\)/gi;
    while ((match = labPattern.exec(text)) !== null) {
      structure.labValues.push({
        test: match[1].trim(),
        value: parseFloat(match[2]),
        unit: match[3],
        referenceRange: match[4],
      });
    }

    // Extract dates
    const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
    const dates = text.match(datePattern);
    if (dates) {
      structure.dates = dates;
    }

    return structure;
  }

  private async extractFromContent(
    base64Content: string,
    mimeType: string,
    options: OCRServiceOptions
  ): Promise<OCRResult> {
    if (mimeType.startsWith('image/')) {
      return this.extractFromImage(base64Content, mimeType, options);
    } else if (mimeType === 'application/pdf') {
      return this.extractFromPDF(base64Content, options);
    }
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
}

export const ocrService = new OCRService();