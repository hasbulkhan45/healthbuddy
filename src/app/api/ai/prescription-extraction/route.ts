/**
 * Prescription Extraction API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerAnonClient } from '@/lib/supabase/server';
import { prescriptionExtractionService } from '@/services/ai';
import { prescriptionsRepository, prescriptionMedicinesRepository } from '@/services/repositories';
import type { PrescriptionExtractionResult, ExtractedMedicine } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerAnonClient();
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

    // Save prescription to database - match Prescription Insert schema
    const prescription = await prescriptionsRepository.create({
      user_id: user.id,
      document_id: file ? crypto.randomUUID() : null,
      document_name: file?.name ?? null,
      doctor_name: extractionResult.doctorName ?? null,
      doctor_specialty: null,
      clinic_name: extractionResult.clinicName ?? null,
      visit_date: null,
      prescription_date: extractionResult.prescriptionDate ?? null,
      follow_up_date: extractionResult.followUpDate ?? null,
      follow_up_instruction: extractionResult.instructions ?? null,
      diagnosis_text: null,
      tests_advised: [],
      general_instructions: extractionResult.instructions ? [extractionResult.instructions] : [],
      extracted_fields: extractionResult as any,
      file_type: file?.type ?? null,
      preview_url: file ? `uploads/${file.name}` : null,
      verification_status: validation.valid ? 'user_confirmed' : 'needs_review',
      workflow_stage: validation.valid ? 'confirmed' : 'needs_review',
      requires_user_review: !validation.valid,
      ocr_provider: 'mock',
      ocr_confidence: extractionResult.confidence,
      ocr_warnings: validation.errors ?? [],
    });

    if (!prescription) {
      return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 });
    }

    // Save medicines - match PrescriptionMedicine Insert schema
    if (extractionResult.medicines.length > 0) {
      const medicineInserts = extractionResult.medicines.map((med: ExtractedMedicine) => ({
        prescription_id: prescription.id,
        medicine_name: med.name,
        generic_name: null,
        strength: med.dosage ?? null,
        dosage: med.dosage ?? null,
        dosage_unit: null,
        frequency: med.frequency ?? null,
        route: med.route ?? null,
        timing: null,
        before_or_after_food: med.instructions ?? null,
        duration: med.duration ?? null,
        start_date: null,
        end_date: null,
        additional_instructions: med.instructions ?? null,
        extraction_confidence: extractionResult.confidence,
        verification_status: validation.valid ? 'user_confirmed' : 'needs_review',
        is_as_needed: false,
        reminder_times: [],
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