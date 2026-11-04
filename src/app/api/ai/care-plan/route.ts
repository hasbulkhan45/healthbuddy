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
        conditions: profile?.health_profile?.existingConditions ?? [],
        medications: medications.map(m => ({
          name: m.name,
          dosage: m.strength ?? m.user_confirmed_instructions ?? '',
          frequency: m.frequency ?? '',
        })),
        healthMetrics: healthMetrics.map(m => ({
          type: m.metric_type,
          value: m.value,
          unit: m.unit,
          date: m.recorded_at,
        })),
        userProfile: profile ? {
          age: profile.health_profile?.heightCm ? Math.floor((new Date().getTime() - new Date(profile.date_of_birth ?? '').getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
          gender: profile.sex ?? undefined,
          lifestyle: profile.lifestyle ? {
            activityLevel: profile.lifestyle.activityLevel,
            diet: profile.lifestyle.dietType,
            sleepHours: profile.lifestyle.sleepAverageHours,
          } : undefined,
        } : undefined,
      });
    }

    // Map CarePlanGenerationResult to database CarePlan Insert schema
    const medicationSchedule = carePlan.tasks
      .filter(t => t.category === 'medication')
      .map(t => ({
        medicineName: t.title,
        dosage: '',
        frequency: t.frequency,
        timing: null,
        duration: null,
        startDate: null,
        endDate: null,
        instructions: t.description,
        reminderTimes: [],
      }));

    const followUpAppointment = carePlan.followUpSchedule.find(f => f.type === 'appointment');
    const tests = carePlan.followUpSchedule
      .filter(f => f.type === 'lab_test' || f.type === 'checkup')
      .map(f => ({
        name: f.title,
        suggestedAction: f.description,
        status: 'pending',
      }));

    const tasks = carePlan.tasks.map(t => ({
      id: crypto.randomUUID(),
      title: t.title,
      dueDate: carePlan.followUpSchedule.find(f => f.title === t.title)?.dueDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending' as const,
      source: t.category,
    }));

    // Save care plan to database - match CarePlan Insert schema
    const savedPlan = await carePlansRepository.create({
      user_id: user.id,
      prescription_id: fromPrescription ? prescriptionData?.id ?? null : null,
      summary: carePlan.description,
      medication_schedule: medicationSchedule,
      follow_up_appointment: followUpAppointment ? {
        doctorName: null,
        clinicName: null,
        followUpDate: followUpAppointment.dueDate,
        purpose: followUpAppointment.description,
        notes: null,
        status: 'scheduled',
      } : null,
      tests,
      tasks,
      status: 'active',
      is_user_confirmed: false,
      confirmed_at: null,
    });

    return NextResponse.json({ carePlan: savedPlan, generated: carePlan });
  } catch (error) {
    console.error('Care plan generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate care plan' },
      { status: 500 }
    );
  }
}