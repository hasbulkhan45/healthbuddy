export type HealthMetricType =
  | "blood_pressure"
  | "heart_rate"
  | "blood_glucose"
  | "spo2"
  | "weight"
  | "bmi";

export interface HealthMeasurement {
  id: string;
  userId: string;
  metricType: HealthMetricType;
  value: number; // For single value, e.g. 72 (bpm) or 96 (mg/dL) or 68.5 (kg)
  secondaryValue?: number; // For BP diastolic (e.g., 80 in 120/80)
  formattedValue: string; // e.g. "120/80" or "72" or "96"
  unit: string;
  status: "normal" | "borderline" | "abnormal";
  statusLabel: string;
  referenceRange?: string; // e.g. "60 - 100 bpm"
  recordedAt: string; // ISO date-time string
  source: "Manual entry" | "Connected device" | "Extracted from report";
  notes?: string;
  previousValue?: number;
  deltaText?: string;
}

export interface MetricTrendPoint {
  date: string;
  value: number;
  secondaryValue?: number;
  label: string;
}

export interface WellnessScore {
  score: number; // 0 - 100
  label: "Optimal" | "Good" | "Needs Attention" | "Consult Clinician";
  summary: string;
  lastUpdated: string;
  factors: {
    name: string;
    score: number;
    status: "positive" | "neutral" | "needs_attention";
  }[];
}

export type RiskAssessmentStatus =
  | "not_assessed"
  | "assessment_available"
  | "more_information_required"
  | "risk_factors_identified"
  | "follow_up_recommended";

export interface HealthRiskCategory {
  id: string;
  category: "Diabetes" | "Cardiovascular" | "Kidney" | "Liver" | "Anaemia" | "Nutritional";
  title: string;
  description: string;
  status: RiskAssessmentStatus;
  statusLabel: string;
  lastAssessmentDate: string;
  availableDataPoints: string[];
  missingDataPoints: string[];
  contributingFactors: string[];
  clinicalDisclaimer: string;
}

