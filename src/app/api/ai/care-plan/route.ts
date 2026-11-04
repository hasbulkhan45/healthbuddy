/**
 * Care Plan Generation API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerAnonClient } from '@/lib/supabase/server';
import { carePlanGenerationService } from '@/services/ai';
import { profilesRepository, carePlansRepository, healthMetricsRepository, medicationsRepository } from '@/services/repositories';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerAnonClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fromPrescription, prescriptionData } = body;

    let carePlan;

    if (fromPrescription && prescriptionData) {
      carePlan = await carePlanGenerationService.generateFromPrescription(prescriptionData);
    } else {
      // Fetch user's health data
      const [profile, healthMetrics, medications] = await Promise.all([
        profilesRepository.findById(user.id),
        healthMetricsRepository.findByUserId(user.id, { limit: 20 }),
        medicationsRepository.findActive(user.id),
      ]);

      carePlan = await carePlanGenerationService.generate({
        conditions: profile?.health_profile?.conditions,
        medications: medications.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
        })),
        healthMetrics: healthMetrics.map(m => ({
          type: m.metric_type,
          value: m.value,
          unit: m.unit,
          date: m.recorded_at,
        })),
        userProfile: profile ? {
          age: profile.health_profile?.age,
          gender: profile.health_profile?.gender,
          lifestyle: profile.lifestyle ? {
            activityLevel: profile.lifestyle.activity_level,
            diet: profile.lifestyle.diet,
            sleepHours: profile.lifestyle.sleep_hours,
          } : undefined,
        } : undefined,
      });
    }

    // Save care plan to database
    const savedPlan = await carePlansRepository.createCarePlan({
      title: carePlan.title,
      description: carePlan.description,
      goals: carePlan.goals as any,
      tasks: carePlan.tasks as any,
      follow_up_schedule: carePlan.followUpSchedule as any,
      source_type: fromPrescription ? 'prescription' : 'ai_generated',
      status: 'active',
      progress: 0,
    }, user.id);

    return NextResponse.json({ carePlan: savedPlan, generated: carePlan });
  } catch (error) {
    console.error('Care plan generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate care plan' },
      { status: 500 }
    );
  }
}