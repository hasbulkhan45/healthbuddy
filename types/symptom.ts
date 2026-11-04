export interface SymptomLog {
  id: string;
  userId: string;
  symptomName: string;
  severity: number; // 1 - 10
  startDate: string; // ISO date string
  duration: string; // e.g. "2 hours", "Intermittent all day"
  frequency: "Constant" | "Intermittent" | "Rare";
  associatedSymptoms: string[];
  possibleTriggers: string;
  notes?: string;
  isEmergencyAlert: boolean; // true if chest pain, severe shortness of breath, etc.
  recordedAt: string;
}

