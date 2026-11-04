export interface AIHealthInsight {
  id: string;
  category: "Heart & Vitals" | "Lab Reports" | "Medications" | "Care Schedule";
  title: string;
  explanation: string;
  relatedMetric?: string;
  date: string;
  severity: "positive" | "attention" | "info";
  suggestedActionLabel: string;
  suggestedActionHref: string;
}

export const mockAIInsights: AIHealthInsight[] = [
  {
    id: "ins_001",
    category: "Heart & Vitals",
    title: "Resting Heart Rate Improvement",
    explanation: "Your recorded resting heart rate has decreased from 76 bpm to 72 bpm over the past 7 days, indicating positive cardiovascular recovery.",
    relatedMetric: "Heart Rate: 72 bpm",
    date: "2026-11-04",
    severity: "positive",
    suggestedActionLabel: "View Trends",
    suggestedActionHref: "/health-trends",
  },
  {
    id: "ins_002",
    category: "Lab Reports",
    title: "Cholesterol Ratio Analysis",
    explanation: "Your latest lipid panel recorded Total Cholesterol at 208 mg/dL (slightly above standard 200 threshold), balanced by a protective HDL of 58 mg/dL.",
    relatedMetric: "Total Chol: 208 mg/dL",
    date: "2026-10-25",
    severity: "attention",
    suggestedActionLabel: "Discuss with AI",
    suggestedActionHref: "/ai-buddy",
  },
  {
    id: "ins_003",
    category: "Care Schedule",
    title: "Doctor Consultation Preparation",
    explanation: "You have an upcoming consultation with Dr. Sarah Jenkins on Nov 18. HealthBuddy has compiled a 1-page visit summary of your recent vitals.",
    relatedMetric: "Appointment: Nov 18",
    date: "2026-11-02",
    severity: "info",
    suggestedActionLabel: "Review Visit Summary",
    suggestedActionHref: "/doctor-summary",
  },
];

