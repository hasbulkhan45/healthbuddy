import { mockStore } from "./mockStore";
import { SymptomLog } from "@/types/symptom";

export const symptomsService = {
  async getSymptoms(): Promise<SymptomLog[]> {
    return mockStore.getSymptoms();
  },

  async addSymptom(data: Omit<SymptomLog, "id" | "userId" | "recordedAt">): Promise<SymptomLog> {
    return mockStore.addSymptom(data);
  },

  subscribe(callback: () => void) {
    return mockStore.subscribe(callback);
  },
};

