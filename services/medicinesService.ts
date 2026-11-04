import { mockStore } from "./mockStore";
import { Medication, MedicationReminder, DrugInteractionResult } from "@/types/medicine";
import { mockPredefinedInteractions, mockCommonMedicines } from "@/data/mock/drug-interactions";

export const medicinesService = {
  async getMedicines(): Promise<Medication[]> {
    return mockStore.getMedications();
  },

  async getReminders(): Promise<MedicationReminder[]> {
    return mockStore.getReminders();
  },

  async toggleReminder(id: string, status: "completed" | "skipped" | "pending"): Promise<MedicationReminder | undefined> {
    return mockStore.toggleReminder(id, status);
  },

  async addMedicine(data: Omit<Medication, "id" | "userId">): Promise<Medication> {
    return mockStore.addMedication(data);
  },

  async checkInteractions(meds: string[]): Promise<DrugInteractionResult[]> {
    if (meds.length < 2) return [];
    const results: DrugInteractionResult[] = [];
    
    // Match against mock database
    mockPredefinedInteractions.forEach((interaction) => {
      const hasA = meds.some((m) => m.toLowerCase().includes(interaction.medicineA.toLowerCase()) || interaction.medicineA.toLowerCase().includes(m.toLowerCase()));
      const hasB = meds.some((m) => m.toLowerCase().includes(interaction.medicineB.toLowerCase()) || interaction.medicineB.toLowerCase().includes(m.toLowerCase()));
      if (hasA && hasB) {
        results.push(interaction);
      }
    });

    if (results.length === 0) {
      results.push({
        medicineA: meds[0],
        medicineB: meds[1],
        severity: "None identified",
        severityStatus: "normal",
        explanation: "No clinically significant interaction identified in standard demonstration database for this combination.",
        clinicalMechanism: "Independent metabolic pathways.",
        sourceReferences: ["Simulated Drug Interaction Reference"],
      });
    }

    return results;
  },

  async getCommonMedicines(): Promise<string[]> {
    return mockCommonMedicines;
  },

  subscribe(callback: () => void) {
    return mockStore.subscribe(callback);
  },
};

