import { AIConversation } from "@/types/ai";

export const mockConversations: AIConversation[] = [
  {
    id: "conv_001",
    title: "Understanding my Latest Lipid Panel",
    lastMessagePreview: "Your total cholesterol is 208 mg/dL, with a favorable HDL of 58 mg/dL...",
    updatedAt: "2026-10-25T15:00:00Z",
    messages: [
      {
        id: "msg_001_1",
        conversationId: "conv_001",
        sender: "user",
        content: "Can you explain my recent cholesterol results from the October 24 report?",
        timestamp: "2026-10-25T14:58:00Z",
      },
      {
        id: "msg_001_2",
        conversationId: "conv_001",
        sender: "assistant",
        content: `Based on your verified **Metabolic & Lipid Panel (Oct 24, 2026)**, here is an educational summary of your lipid markers:

### Key Lipid Findings
* **Total Cholesterol:** **208 mg/dL** (Standard reference threshold: < 200 mg/dL). This is mildly elevated.
* **HDL ("Protective" Cholesterol):** **58 mg/dL** (Reference: > 40 mg/dL). This is a strong, healthy level that assists in carrying excess cholesterol back to the liver.
* **LDL ("Transport" Cholesterol):** **128 mg/dL** (Reference: < 130 mg/dL). This is in the near-optimal range.
* **Triglycerides:** **110 mg/dL** (Reference: < 150 mg/dL). Completely normal baseline.

### What This Means for You
Your total number is slightly above the traditional cutoff, primarily because your beneficial HDL is robust. When evaluating cardiovascular risk, clinicians evaluate the **Total Cholesterol to HDL ratio** (208 / 58 ≈ 3.58), which falls well within the favorable zone (< 4.5).

Continuing your current Mediterranean dietary pattern and regular aerobic exercise is the recommended lifestyle foundation.`,
        timestamp: "2026-10-25T15:00:00Z",
        contextUsed: ["Medical Records", "Health Measurements"],
        citations: [
          {
            id: "cit_001",
            sourceType: "Laboratory Reference",
            sourceName: "Metropolitan Diagnostics Reference Standard",
            excerpt: "Adult lipid panel guideline intervals (AHA/ACC 2024)",
            isSimulatedDemoCitation: true,
          },
        ],
        suggestedFollowUps: [
          "What questions should I ask Dr. Jenkins about my cholesterol?",
          "How does diet affect my HDL vs LDL ratio?",
          "When should I repeat this test?",
        ],
      },
    ],
  },
  {
    id: "conv_002",
    title: "Preparing for Dr. Jenkins Consultation",
    lastMessagePreview: "I've compiled a 4-point agenda based on your recent labs and vitals...",
    updatedAt: "2026-11-02T10:15:00Z",
    messages: [
      {
        id: "msg_002_1",
        conversationId: "conv_002",
        sender: "user",
        content: "How should I prepare for my upcoming appointment with Dr. Sarah Jenkins?",
        timestamp: "2026-11-02T10:14:00Z",
      },
      {
        id: "msg_002_2",
        conversationId: "conv_002",
        sender: "assistant",
        content: `Here is a structured, 4-point agenda tailored for your visit with **Dr. Sarah Jenkins** on **November 18, 2026**:

### 1. Discussion Agenda
1. **Total Cholesterol Review:** Discuss your 208 mg/dL reading in the context of your 58 mg/dL protective HDL.
2. **Family History Correlation:** Mention your paternal hypertension history and confirm if any additional markers (like ApoB or hs-CRP) are warranted.
3. **Resting Blood Pressure:** Share your recent 7-day home measurements showing a stable average of **120/80 mmHg**.
4. **Supplement Verification:** Confirm ongoing suitability of your 2,000 IU Vitamin D3 and 1,000 mg Omega-3 regimen.

### 2. Suggested Questions to Ask
* *"Do you recommend re-checking my lipid fractions in 6 or 12 months?"*
* *"Given my stable resting blood pressure, do we need any changes to my routine cardiovascular monitoring?"*

You can also export a 1-page visit summary directly from your **Doctor Visit Summary** tool.`,
        timestamp: "2026-11-02T10:15:00Z",
        contextUsed: ["Medical Records", "Medicines", "Appointments", "Health Measurements"],
        suggestedFollowUps: [
          "Generate a printable doctor visit summary",
          "What is ApoB and should I ask for it?",
        ],
      },
    ],
  },
];

