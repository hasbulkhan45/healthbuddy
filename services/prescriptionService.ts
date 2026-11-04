import { mockStore } from "./mockStore";
import { Prescription, PrescriptionCarePlan, PrescriptionMedicine, VerificationStatus } from "@/types/prescription";

export const prescriptionService = {
  async uploadPrescription(file: { name: string; type: string; size: number }, metadata: Partial<Prescription>) {
    const docType = file.type.includes("pdf") ? "pdf" : file.type.includes("png") ? "png" : file.type.includes("jpeg") ? "jpeg" : "jpg";
    return mockStore.addPrescription({
      documentId: `doc_${Date.now()}`,
      documentName: file.name,
      doctorName: metadata.doctorName || "Needs review",
      doctorSpecialty: metadata.doctorSpecialty || "Unspecified",
      clinicName: metadata.clinicName || "Unspecified",
      visitDate: metadata.visitDate || "",
      prescriptionDate: metadata.prescriptionDate || new Date().toISOString().split("T")[0],
      followUpDate: metadata.followUpDate || "",
      followUpInstruction: metadata.followUpInstruction || "Follow-up instructions pending verification.",
      diagnosisText: metadata.diagnosisText || "Not captured in the document.",
      testsAdvised: metadata.testsAdvised || [],
      generalInstructions: metadata.generalInstructions || [],
      extractedFields: metadata.extractedFields || {},
      fileType: docType,
      previewUrl: metadata.previewUrl,
      verificationStatus: "needs_review",
      workflowStage: "uploading",
      requiresUserReview: true,
    } as Omit<Prescription, "id" | "createdAt" | "updatedAt" | "userId"> & { userId?: string, verificationStatus?: VerificationStatus, workflowStage?: any, requiresUserReview?: boolean });
  },

  async processPrescription(id: string) {
    const prescription = mockStore.getPrescriptionById(id);
    if (!prescription) throw new Error("Prescription not found");
    const updated = mockStore.updatePrescription(id, {
      workflowStage: "reading",
      verificationStatus: "needs_review",
      requiresUserReview: true,
      updatedAt: new Date().toISOString(),
    });
    setTimeout(() => {
      mockStore.updatePrescription(id, {
        workflowStage: "extracting",
        updatedAt: new Date().toISOString(),
      });
    }, 500);
    setTimeout(() => {
      mockStore.updatePrescription(id, {
        workflowStage: "identifying_medicines",
        updatedAt: new Date().toISOString(),
      });
    }, 1200);
    setTimeout(() => {
      mockStore.updatePrescription(id, {
        workflowStage: "preparing_care_plan",
        updatedAt: new Date().toISOString(),
      });
    }, 2000);
    return updated;
  },

  async getPrescription(id: string): Promise<Prescription | undefined> {
    return mockStore.getPrescriptionById(id);
  },

  async getPrescriptions(): Promise<Prescription[]> {
    return mockStore.getPrescriptions();
  },

  async updatePrescription(id: string, updates: Partial<Prescription>): Promise<Prescription | undefined> {
    return mockStore.updatePrescription(id, updates);
  },

  async verifyPrescription(id: string, status: VerificationStatus = "user_confirmed") {
    return mockStore.verifyPrescription(id, status);
  },

  async generateCarePlan(prescriptionId: string): Promise<PrescriptionCarePlan | undefined> {
    const prescription = mockStore.getPrescriptionById(prescriptionId);
    if (!prescription) return undefined;
    const plan = {
      id: `cp_${Date.now()}`,
      prescriptionId,
      userId: prescription.userId,
      summary: "Generated from verified prescription information.",
      medicationSchedule: mockStore.getPrescriptionMedicines(prescriptionId).map((medicine) => ({
        medicineName: medicine.medicineName,
        dosage: `${medicine.dosage} ${medicine.dosageUnit}`.trim(),
        frequency: medicine.frequency,
        timing: medicine.timing,
        duration: medicine.duration,
        startDate: medicine.startDate || prescription.prescriptionDate,
        endDate: medicine.endDate || medicine.startDate,
        instructions: medicine.additionalInstructions,
        reminderTimes: medicine.reminderTimes || [],
      })),
      followUpAppointment: {
        doctorName: prescription.doctorName,
        clinicName: prescription.clinicName,
        followUpDate: prescription.followUpDate || prescription.visitDate,
        purpose: prescription.followUpInstruction || "Follow-up consultation",
        notes: "User confirmation required before activating this appointment.",
        status: prescription.followUpDate ? "draft" : "pending_confirmation",
      },
      tests: (prescription.testsAdvised || []).map((test) => ({
        name: test,
        suggestedAction: "Schedule with the treating clinician if needed.",
        status: "recommended" as const,
      })),
      tasks: (prescription.generalInstructions || []).map((instruction, index) => ({
        id: `${prescriptionId}_task_${index}`,
        title: instruction,
        dueDate: prescription.followUpDate || prescription.prescriptionDate || prescription.visitDate || new Date().toISOString().split("T")[0],
        status: "pending" as const,
        source: "Prescription instruction",
      })),
      createdAt: new Date().toISOString(),
    } satisfies PrescriptionCarePlan;

    const existingPlan = mockStore.getCarePlanByPrescriptionId(prescriptionId);
    if (existingPlan) {
      mockStore.addCarePlan(plan);
      return plan;
    }
    mockStore.addCarePlan(plan);
    return plan;
  },

  subscribe(callback: () => void) {
    return mockStore.subscribe(callback);
  },
};
