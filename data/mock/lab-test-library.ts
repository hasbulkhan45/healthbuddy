export interface LabTestDefinition {
  id: string;
  name: string;
  category: "Lipids & Cardiac" | "Metabolic & Diabetes" | "Hematology (CBC)" | "Kidney & Electrolytes" | "Liver Function" | "Thyroid";
  standardUnit: string;
  typicalAdultRange: string;
  description: string;
  clinicalSignificance: string;
  preparationNotes: string;
}

export const mockLabTests: LabTestDefinition[] = [
  {
    id: "test_001",
    name: "Hemoglobin A1c (HbA1c)",
    category: "Metabolic & Diabetes",
    standardUnit: "%",
    typicalAdultRange: "Normal: < 5.7%, Prediabetes: 5.7 - 6.4%, Diabetes: ≥ 6.5%",
    description: "Measures the percentage of glycated hemoglobin in red blood cells, reflecting average blood glucose levels over the prior 2 to 3 months.",
    clinicalSignificance: "Primary screening and monitoring metric for long-term glycemic control and diabetes risk.",
    preparationNotes: "No fasting required. Can be drawn at any time of day.",
  },
  {
    id: "test_002",
    name: "Total Cholesterol",
    category: "Lipids & Cardiac",
    standardUnit: "mg/dL",
    typicalAdultRange: "Desirable: < 200 mg/dL, Borderline: 200 - 239 mg/dL, High: ≥ 240 mg/dL",
    description: "Sum of all cholesterol fractions circulating in blood plasma, including HDL, LDL, and VLDL.",
    clinicalSignificance: "Used alongside individual fractions to compute cardiovascular risk ratios.",
    preparationNotes: "Fasting for 9–12 hours typically requested for full lipid panels.",
  },
  {
    id: "test_003",
    name: "HDL Cholesterol",
    category: "Lipids & Cardiac",
    standardUnit: "mg/dL",
    typicalAdultRange: "Men: > 40 mg/dL, Women: > 50 mg/dL, Optimal: > 60 mg/dL",
    description: "High-Density Lipoprotein, often called 'protective' cholesterol because it mobilizes cholesterol away from arterial walls.",
    clinicalSignificance: "Higher values are epidemiologically associated with reduced vascular plaque formation.",
    preparationNotes: "Fasting for 9–12 hours recommended.",
  },
  {
    id: "test_004",
    name: "LDL Cholesterol",
    category: "Lipids & Cardiac",
    standardUnit: "mg/dL",
    typicalAdultRange: "Optimal: < 100 mg/dL, Near optimal: 100 - 129 mg/dL, Borderline: 130 - 159 mg/dL",
    description: "Low-Density Lipoprotein particles that transport cholesterol into peripheral vascular tissues.",
    clinicalSignificance: "Primary target in clinical lipid management and cardiovascular prevention.",
    preparationNotes: "Fasting for 9–12 hours recommended for standard calculated LDL.",
  },
  {
    id: "test_005",
    name: "Serum Creatinine & eGFR",
    category: "Kidney & Electrolytes",
    standardUnit: "mg/dL & mL/min/1.73m²",
    typicalAdultRange: "Creatinine: 0.7 - 1.3 mg/dL, eGFR: > 90 mL/min/1.73m²",
    description: "By-product of normal muscle metabolism filtered by the kidneys, used to estimate glomerular filtration efficiency.",
    clinicalSignificance: "Key routine metric for assessing baseline kidney clearance and hydration status.",
    preparationNotes: "Avoid intense resistance exercise or large servings of red meat 24 hours prior.",
  },
  {
    id: "test_006",
    name: "Alanine Aminotransferase (ALT)",
    category: "Liver Function",
    standardUnit: "U/L",
    typicalAdultRange: "7 – 56 U/L",
    description: "Enzyme found predominantly in liver cells; leaks into circulation during hepatocellular stress.",
    clinicalSignificance: "Screening indicator for hepatic inflammation, fatty infiltration, or medication tolerance.",
    preparationNotes: "Routine morning draw. Avoid heavy alcohol intake 48 hours prior.",
  },
];

