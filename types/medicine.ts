export interface Medication {
  id: string;
  userId: string;
  name: string;
  activeIngredient: string;
  strength: string; // e.g. "500 mg"
  dosageForm: "Tablet" | "Capsule" | "Syrup" | "Injection" | "Inhaler" | "Drops";
  userConfirmedInstructions: string; // "Take 1 tablet after breakfast with water"
  frequency: "Once daily" | "Twice daily" | "Three times daily" | "As needed";
  prescribedBy?: string;
  startDate: string;
  endDate?: string;
  status: "Active" | "Completed" | "Discontinued";
  notes?: string;
  reminderEnabled: boolean;
  reminderTimes: string[]; // ["08:30", "20:30"]
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  strength: string;
  scheduledTime: string; // "08:30"
  scheduledDate: string; // "2026-11-04"
  status: "pending" | "completed" | "skipped";
  completedAt?: string;
  instructions: string;
}

export interface DrugInteractionResult {
  medicineA: string;
  medicineB: string;
  severity: "High" | "Moderate" | "Minor" | "None identified";
  severityStatus: "abnormal" | "borderline" | "normal";
  explanation: string;
  clinicalMechanism: string;
  sourceReferences: string[];
}

