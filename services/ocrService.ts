import { Prescription, PrescriptionMedicine, VerificationStatus } from "@/types/prescription";

const demoExtraction = {
  doctorName: "Dr. Elena Ramirez",
  doctorSpecialty: "Cardiology",
  clinicName: "West Harbor Cardiac Center",
  visitDate: "",
  followUpDate: "",
  followUpInstruction: "Follow up after one week if blood pressure remains elevated.",
  diagnosisText: "Hypertension monitoring and medication review.",
  testsAdvised: ["Home blood pressure log for 7 days"],
  generalInstructions: ["Monitor resting blood pressure twice daily.", "Bring home readings to the next visit."],
  medicines: [
    {
      medicineName: "Losartan",
      genericName: "Losartan",
      strength: "50 mg",
      dosage: "1",
      dosageUnit: "tablet",
      frequency: "Once daily",
      route: "Oral",
      timing: "Evening",
      beforeOrAfterFood: "With food",
      duration: "30 days",
      startDate: "2026-11-04",
      endDate: "2026-12-04",
      additionalInstructions: "Take as directed. Do not stop without clinician advice.",
      extractionConfidence: 0.88,
      verificationStatus: "needs_review" as VerificationStatus,
      isAsNeeded: false,
    },
  ] satisfies Partial<PrescriptionMedicine>[],
};

export const ocrService = {
  async extractText(file: File) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      documentName: file.name,
      extractedText: `Demo OCR output: ${file.name}\nDoctor: ${demoExtraction.doctorName}\nClinic: ${demoExtraction.clinicName}\nFollow-up: ${demoExtraction.followUpInstruction}`,
      provider: "simulated-ocr-demo",
      note: "This is a mocked OCR workflow for demonstration only. No real document OCR is active in this phase.",
    };
  },

  async extractStructuredFields(file: File) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      doctorName: demoExtraction.doctorName,
      doctorSpecialty: demoExtraction.doctorSpecialty,
      clinicName: demoExtraction.clinicName,
      visitDate: demoExtraction.visitDate,
      followUpDate: demoExtraction.followUpDate,
      followUpInstruction: demoExtraction.followUpInstruction,
      diagnosisText: demoExtraction.diagnosisText,
      testsAdvised: demoExtraction.testsAdvised,
      generalInstructions: demoExtraction.generalInstructions,
      medicines: demoExtraction.medicines,
      warnings: [
        "Visit date is not fully legible; manual confirmation is required before scheduling a follow-up appointment.",
      ],
      confidence: 0.83,
    };
  },

  async getExtractionStatus() {
    return {
      stage: "ready",
      status: "demo",
      message: "This mock extraction service simulates OCR and field review behavior only.",
    } as const;
  },
};
