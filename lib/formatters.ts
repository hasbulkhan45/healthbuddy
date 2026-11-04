import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(date: string | Date, pattern: string = "MMM d, yyyy"): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, pattern);
  } catch {
    return String(date);
  }
}

export function formatTime(date: string | Date): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "h:mm a");
  } catch {
    return String(date);
  }
}

export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return String(date);
  }
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  if (!weightKg || !heightCm || heightCm <= 0) return { bmi: 0, category: "Unknown" };
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  
  let category = "Normal";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi >= 25 && bmi < 30) category = "Overweight";
  else if (bmi >= 30) category = "Obese";

  return { bmi, category };
}

export function calculateAge(dobString: string): number {
  try {
    const dob = parseISO(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  } catch {
    return 34; // default Alex Mercer demo fallback
  }
}

export function formatMetricDelta(current: number, previous?: number, unit: string = ""): {
  delta: number;
  text: string;
  isPositive: boolean;
  isNeutral: boolean;
} {
  if (previous === undefined || previous === null) {
    return { delta: 0, text: "Baseline", isPositive: false, isNeutral: true };
  }
  const diff = parseFloat((current - previous).toFixed(1));
  if (diff === 0) {
    return { delta: 0, text: "No change", isPositive: false, isNeutral: true };
  }
  const sign = diff > 0 ? "+" : "";
  return {
    delta: diff,
    text: `${sign}${diff} ${unit}`.trim(),
    isPositive: diff > 0,
    isNeutral: false,
  };
}

