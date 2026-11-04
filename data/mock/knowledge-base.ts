export interface HealthArticle {
  id: string;
  title: string;
  category: "Heart Health" | "Diabetes Awareness" | "Nutrition" | "Sleep" | "Preventive Care" | "Understanding Lab Reports";
  readTime: string;
  publishDate: string;
  summary: string;
  author: string;
  content: string[];
}

export const mockArticles: HealthArticle[] = [
  {
    id: "art_001",
    title: "Understanding Your Lipid Panel: HDL, LDL, and Triglycerides",
    category: "Understanding Lab Reports",
    readTime: "4 min read",
    publishDate: "Oct 2026",
    author: "HealthBuddy Clinical Editorial Team",
    summary: "Why looking beyond just 'Total Cholesterol' provides a clearer perspective on your cardiovascular health.",
    content: [
      "When you receive a standard lipid panel, the first number most patients see is Total Cholesterol. While historically a benchmark, modern cardiovascular risk assessment emphasizes particle density and lipid ratios.",
      "High-Density Lipoprotein (HDL) acts as vascular maintenance, carrying cholesterol away from arteries back to the liver for clearance.",
      "Low-Density Lipoprotein (LDL) delivers cholesterol to peripheral cells. Excess particles, especially when oxidized, contribute to plaque buildup.",
      "Evaluating the ratio between Total Cholesterol and HDL provides doctors with actionable context alongside blood pressure and lifestyle habits.",
    ],
  },
  {
    id: "art_002",
    title: "The Role of HbA1c in Metabolic Health",
    category: "Diabetes Awareness",
    readTime: "3 min read",
    publishDate: "Sep 2026",
    author: "HealthBuddy Clinical Editorial Team",
    summary: "How glycated hemoglobin provides a 90-day window into blood glucose regulation.",
    content: [
      "Unlike a finger-prick fasting glucose test that captures a single snapshot in time, Hemoglobin A1c (HbA1c) reflects average blood sugar over the lifecycle of your red blood cells (approximately 90 to 120 days).",
      "Because glucose molecules bind non-enzymatically to hemoglobin, higher circulating glucose results in a higher percentage of glycated hemoglobin.",
      "Standard clinical cutoffs: below 5.7% is considered normal; 5.7% to 6.4% indicates prediabetes; 6.5% or higher on two separate tests indicates diabetes.",
    ],
  },
  {
    id: "art_003",
    title: "Circadian Rhythm and Cardiovascular Recovery",
    category: "Sleep",
    readTime: "5 min read",
    publishDate: "Aug 2026",
    author: "HealthBuddy Clinical Editorial Team",
    summary: "How deep sleep cycles directly influence resting heart rate and blood pressure regulation.",
    content: [
      "During non-REM deep sleep, parasympathetic nervous system activity dominates, leading to nocturnal dipping: a healthy 10% to 20% decline in blood pressure and heart rate.",
      "Individuals experiencing chronic sleep fragmentation frequently exhibit blunted nocturnal dipping, which is correlated with increased vascular resistance.",
      "Prioritizing consistent sleep onset times, limiting evening blue spectrum lighting, and avoiding late caffeine intake support natural cardiovascular nocturnal recovery.",
    ],
  },
];

