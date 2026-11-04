import { DrugInteractionResult } from "@/types/medicine";

export const mockCommonMedicines = [
  "Vitamin D3",
  "Omega-3 Fish Oil",
  "Cetirizine HCl",
  "Aspirin (81 mg)",
  "Ibuprofen",
  "Lisinopril",
  "Metformin",
  "Atorvastatin",
  "Amoxicillin",
];

export const mockPredefinedInteractions: DrugInteractionResult[] = [
  {
    medicineA: "Aspirin (81 mg)",
    medicineB: "Ibuprofen",
    severity: "Moderate",
    severityStatus: "borderline",
    explanation: "Concurrent use of NSAIDs like ibuprofen may attenuate the cardioprotective antiplatelet effect of low-dose aspirin and increase gastrointestinal irritation risk.",
    clinicalMechanism: "Competitive inhibition of cyclooxygenase-1 (COX-1) platelet binding sites.",
    sourceReferences: ["FDA Drug Safety Communication", "AHA Clinical Guidance"],
  },
  {
    medicineA: "Omega-3 Fish Oil",
    medicineB: "Aspirin (81 mg)",
    severity: "Minor",
    severityStatus: "normal",
    explanation: "Both substances possess mild antiplatelet activity. At standard nutritional doses (1–2 g fish oil), significant bleeding risk is uncommon but should be noted.",
    clinicalMechanism: "Additive modulation of platelet aggregation pathways.",
    sourceReferences: ["Natural Medicines Comprehensive Database"],
  },
  {
    medicineA: "Vitamin D3",
    medicineB: "Omega-3 Fish Oil",
    severity: "None identified",
    severityStatus: "normal",
    explanation: "No clinically significant interaction identified. In fact, taking fat-soluble Vitamin D alongside dietary lipids in fish oil enhances cholecalciferol intestinal absorption.",
    clinicalMechanism: "Synergistic dietary lipid emulsion absorption.",
    sourceReferences: ["Clinical Endocrinology Guidelines"],
  },
];

