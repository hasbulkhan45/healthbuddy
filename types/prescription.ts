export type VerificationStatus =
  | "extracted"
  | "needs_review"
  | "user_corrected"
  | "user_confirmed"
  | "unable_to_extract";

export type WorkflowStage =
  | "uploading"
  | "reading"
  | "extracting"
  | "identifying_medicines"
  | "preparing_care_plan"
  | "needs_review"
  | "confirmed";

export interface PrescriptionFieldMeta {
  value: string;
  status: VerificationStatus;
  confidence: number;
  source: "ocr" | "manual" | "user" | "system";
  notes?: string;
}

export interface Prescription {
  id: string;
  userId: string;
  documentId: string;
  documentName: string;
  doctorName: string;
  doctorSpecialty: string;
  clinicName: string;
  visitDate: string;
  prescriptionDate: string;
  followUpDate: string;
  followUpInstruction: string;
  diagnosisText: string;
  testsAdvised: string[];
  generalInstructions: string[];
  extractedFields: Record<string, PrescriptionFieldMeta>;
  verificationStatus: VerificationStatus;
  workflowStage: WorkflowStage;
  createdAt: string;
  updatedAt: string;
  requiresUserReview: boolean;
  fileType: "pdf" | "jpg" | "jpeg" | "png";
  previewUrl?: string;
}

export interface PrescriptionMedicine {
  id: string;
  prescriptionId: string;
  medicineName: string;
  genericName?: string;
  strength: string;
  dosage: string;
  dosageUnit: string;
  frequency: string;
  route: string;
  timing: string;
  beforeOrAfterFood: string;
  duration: string;
  startDate: string;
  endDate: string;
  additionalInstructions: string;
  extractionConfidence: number;
  verificationStatus: VerificationStatus;
  isAsNeeded: boolean;
  reminderTimes?: string[];
}

export interface PrescriptionCarePlan {
  id: string;
  prescriptionId: string;
  userId: string;
  summary: string;
  medicationSchedule: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
    duration: string;
    startDate: string;
    endDate: string;
    instructions: string;
    reminderTimes: string[];
  }>;
  followUpAppointment: {
    doctorName: string;
    clinicName: string;
    followUpDate: string;
    purpose: string;
    notes: string;
    status: "draft" | "pending_confirmation" | "confirmed";
  };
  tests: Array<{
    name: string;
    suggestedAction: string;
    status: "recommended" | "scheduled" | "completed";
  }>;
  tasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    status: "pending" | "completed";
    source: string;
  }>;
  createdAt: string;
  confirmedAt?: string;
}

export interface DocumentUploadResult {
  fileName: string;
  fileType: "pdf" | "jpg" | "jpeg" | "png";
  sizeBytes: number;
  uploadedAt: string;
  previewUrl?: string;
}
