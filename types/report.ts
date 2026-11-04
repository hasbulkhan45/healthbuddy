export type DocumentCategory =
  | "all"
  | "lab_report"
  | "prescription"
  | "imaging"
  | "discharge_summary"
  | "vaccination"
  | "other";

export type ExtractionStatus =
  | "extracted"
  | "user_confirmed"
  | "unverified"
  | "unable_to_extract";

export interface ExtractedLabResult {
  id: string;
  testName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "borderline" | "abnormal";
  statusLabel: string;
  extractionStatus: ExtractionStatus;
  userNotes?: string;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  title: string;
  category: DocumentCategory;
  categoryLabel: string;
  institutionName: string; // e.g. "Metropolitan Health Diagnostics"
  physicianName?: string;
  documentDate: string; // Report date
  uploadedAt: string;
  fileSize: string;
  fileType: "pdf" | "jpg" | "png";
  verificationStatus: "Verified" | "Extracted - Review Required" | "Pending Review";
  summary: string;
  extractedResults?: ExtractedLabResult[];
  previewUrl?: string;
  aiExplanation?: string;
}

