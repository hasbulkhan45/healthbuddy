import { mockStore } from "./mockStore";
import { MedicalRecord, DocumentCategory } from "@/types/report";

export const reportsService = {
  async getReports(category?: DocumentCategory): Promise<MedicalRecord[]> {
    const records = mockStore.getRecords();
    if (!category || category === "all") return records;
    return records.filter((r) => r.category === category);
  },

  async getReportById(id: string): Promise<MedicalRecord | undefined> {
    return mockStore.getRecords().find((r) => r.id === id);
  },

  async uploadReport(
    file: { name: string; size: number; type: string },
    metadata: { title: string; category: DocumentCategory; institutionName: string; documentDate: string }
  ): Promise<MedicalRecord> {
    // Simulate extraction parsing
    return mockStore.addRecord({
      title: metadata.title,
      category: metadata.category,
      categoryLabel: metadata.category.replace(/_/g, " ").toUpperCase(),
      institutionName: metadata.institutionName,
      documentDate: metadata.documentDate,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: file.type.includes("pdf") ? "pdf" : "png",
      verificationStatus: "Extracted - Review Required",
      summary: "Simulated document upload. Information extracted using HealthBuddy preview parser.",
      extractedResults: [
        {
          id: `res_sim_${Date.now()}_1`,
          testName: "Extracted Marker A",
          resultValue: "88",
          unit: "mg/dL",
          referenceRange: "70 – 100",
          status: "normal",
          statusLabel: "Normal",
          extractionStatus: "extracted",
        },
      ],
    });
  },

  async confirmResult(recordId: string, resultId: string): Promise<boolean> {
    return mockStore.confirmLabResult(recordId, resultId);
  },

  subscribe(callback: () => void) {
    return mockStore.subscribe(callback);
  },
};

