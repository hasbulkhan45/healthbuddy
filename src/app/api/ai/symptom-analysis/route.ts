/**
 * Symptom Analysis API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { symptomAnalysisService } from '@/services/ai';
import { profilesRepository } from '@/services/repositories';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { symptoms, structuredSymptoms } = body;

    if (!symptoms && !structuredSymptoms) {
      return NextResponse.json({ error: 'No symptoms provided' }, { status: 400 });
    }

    // Get user profile for context
    const profile = await profilesRepository.findById(user.id);

    const userContext = profile ? {
      age: profile.health_profile?.age ?? undefined,
      gender: profile.health_profile?.gender ?? undefined,
      medicalHistory: profile.health_profile?.conditions ?? undefined,
      currentMedications: undefined, // Would need to fetch from medications table
    } : undefined;

    let result;

    if (structuredSymptoms && Array.isArray(structuredSymptoms)) {
      result = await symptomAnalysisService.analyzeStructured(structuredSymptoms, userContext);
    } else {
      result = await symptomAnalysisService.analyze(symptoms, userContext);
    }

    // Save as health insight
    // Could save to health_insights table here

    return NextResponse.json({ analysis: result });
  } catch (error) {
    console.error('Symptom analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}