import { Prescription, PrescriptionCarePlan } from "@/types/prescription";

export const carePlanService = {
  async generateDraftCarePlan(prescription: Prescription) {
    const followUpDate = prescription.followUpDate || prescription.visitDate;
    return {
      id: `care_${prescription.id}`,
      prescriptionId: prescription.id,
      userId: prescription.userId,
      summary: `Care plan drafted from ${prescription.doctorName} prescription. Review required before activation.`,
      medicationSchedule: [],
      followUpAppointment: {
        doctorName: prescription.doctorName,
        clinicName: prescription.clinicName,
        followUpDate: followUpDate || "",
        purpose: "Follow-up review",
        notes: prescription.followUpInstruction || "No additional notes captured.",
        status: followUpDate ? "draft" : "pending_confirmation",
      },
      tests: (prescription.testsAdvised || []).map((test) => ({
        name: test,
        suggestedAction: "Schedule a relevant clinical follow-up or home monitoring task.",
        status: "recommended" as const,
      })),
      tasks: (prescription.generalInstructions || []).map((instruction, index) => ({
        id: `${prescription.id}_task_${index}`,
        title: instruction,
        dueDate: prescription.followUpDate || prescription.prescriptionDate || prescription.visitDate || new Date().toISOString().split("T")[0],
        status: "pending" as const,
        source: "Doctor instructions",
      })),
      createdAt: new Date().toISOString(),
    } satisfies Partial<PrescriptionCarePlan> as PrescriptionCarePlan;
  },

  async validateCarePlan(plan: PrescriptionCarePlan) {
    const hasAmbiguousDate = !plan.followUpAppointment.followUpDate;
    return {
      valid: !hasAmbiguousDate,
      issues: hasAmbiguousDate ? ["Follow-up date is missing; a verified visit date is required before activation."] : [],
    };
  },

  async confirmCarePlan(plan: PrescriptionCarePlan) {
    return {
      ...plan,
      confirmedAt: new Date().toISOString(),
      followUpAppointment: {
        ...plan.followUpAppointment,
        status: "confirmed",
      },
    } satisfies PrescriptionCarePlan;
  },
};
