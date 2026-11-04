/**
 * Prescription Extraction API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prescriptionExtractionService } from '@/services/ai';
import { prescriptionsRepository, prescriptionMedicinesRepository } from '@/services/repositories';
import type { PrescriptionExtractionResult } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    let extractedText = text;

    if (file && !extractedText) {
      // In a real implementation, you would use OCR here
      // For now, we'll simulate OCR with a placeholder
      extractedText = `[OCR would extract text from ${file.name} (${file.type}, ${file.size} bytes)]`;
    }

    if (!extractedText) {
      return NextResponse.json({ error: 'No text or file provided' }, { status: 400 });
    }

    // Extract prescription data using AI
    const extractionResult = await prescriptionExtractionService.extractFromText(extractedText);

    // Validate extraction
    const validation = prescriptionExtractionService.validateExtraction(extractionResult);

    // Save prescription to database
    const prescription = await prescriptionsRepository.create({
      user_id: user.id,
      image_url: file ? `uploads/${file.name}` : null,
      ocr_text: extractedText,
      extracted_data: extractionResult as any,
      verification_status: validation.valid ? 'user_confirmed' : 'needs_review',
      workflow_stage: validation.valid ? 'confirmed' : 'needs_review',
      requires_user_review: !validation.valid,
      source_type: file ? 'photo' : 'manual',
    });

    if (!prescription) {
      return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 });
    }

    // Save medicines
    if (extractionResult.medicines.length > 0) {
      const medicineInserts = extractionResult.medicines.map(med => ({
        prescription_id: prescription.id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        route: med.route,
        instructions: med.instructions,
        quantity: med.quantity,
        refills_remaining: med.refills,
        verification_status: validation.valid ? 'user_confirmed' : 'needs_review',
      }));

      await prescriptionMedicinesRepository.createMany(medicineInserts as any);
    }

    return NextResponse.json({
      prescription,
      extraction: extractionResult,
      validation,
    });
  } catch (error) {
    console.error('Prescription extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to process prescription' },
      { status: 500 }
    );
  }
}