import { mockStore } from "./mockStore";
import { AIConversation, AIMessage, AIContextSelection } from "@/types/ai";

export const aiService = {
  async getConversations(): Promise<AIConversation[]> {
    return mockStore.getConversations();
  },

  async getConversationById(id: string): Promise<AIConversation | undefined> {
    return mockStore.getConversations().find((c) => c.id === id);
  },

  async sendMessage(params: {
    conversationId: string;
    message: string;
    selectedContext: AIContextSelection;
  }): Promise<AIMessage> {
    // Add user message
    mockStore.addAIMessage(params.conversationId, {
      sender: "user",
      content: params.message,
    });

    // Simulate AI thinking and educational response generation
    const lower = params.message.toLowerCase();
    let reply = "";
    const citations = [
      {
        id: `cit_${Date.now()}`,
        sourceType: "Educational Resource" as const,
        sourceName: "HealthBuddy Clinical Reference Library (Demo)",
        excerpt: "Factual health education summary based on verified reference intervals.",
        isSimulatedDemoCitation: true,
      },
    ];

    if (lower.includes("blood") || lower.includes("lab") || lower.includes("cholesterol") || lower.includes("report")) {
      reply = `### Medical Report Educational Review
Based on your available records (**Metabolic & Lipid Panel, Oct 24**):
* **Fasting Glucose:** 94 mg/dL (Normal standard range: 70–99 mg/dL).
* **HbA1c:** 5.4% (Normal glycemic control: < 5.7%).
* **Total Cholesterol:** 208 mg/dL (Mildly above standard 200 mg/dL cutoff).
* **Protective HDL:** 58 mg/dL (Above recommended 40 mg/dL for men).

**Key Takeaway:** Your metabolic glucose markers and kidney filtration are optimal. Your cholesterol is slightly elevated, but balanced by strong protective HDL. Would you like to add this topic to your doctor visit checklist?`;
    } else if (lower.includes("hba1c") || lower.includes("diabetes") || lower.includes("glucose")) {
      reply = `### Understanding HbA1c & Blood Glucose
* **HbA1c** measures the percentage of red blood cell hemoglobin coated in glucose over the past 2–3 months.
* Your current recorded level is **5.4%**, which places you safely in the normal non-diabetic range (< 5.7%).
* Although you have a maternal family history of Type 2 Diabetes, your current routine exercise and Mediterranean diet are strongly protective.`;
    } else if (lower.includes("medicine") || lower.includes("vitamin") || lower.includes("omega") || lower.includes("drug")) {
      reply = `### Medication & Supplement Information
You currently have two active daily supplements recorded:
1. **Vitamin D3 (2,000 IU):** Supports bone mineralization, immune function, and seasonal mood stability. Best absorbed with meals containing dietary fats.
2. **Omega-3 Fish Oil (1,000 mg):** Provides EPA and DHA fatty acids to support cellular membrane health and lipid management.

*Note: HealthBuddy does not prescribe, modify, or discontinue medications. Always consult your prescribing physician before altering your routine.*`;
    } else if (lower.includes("trend") || lower.includes("heart rate") || lower.includes("blood pressure")) {
      reply = `### Health Trend Analysis
Looking at your 7-day data:
* **Resting Heart Rate:** Decreased from **76 bpm to 72 bpm** (favorable recovery trend).
* **Blood Pressure:** Stable at **120/80 mmHg**, maintaining optimal vascular readings.
* **Weight:** Stable at **68.5 kg** (BMI 21.6 kg/m²).`;
    } else if (lower.includes("doctor") || lower.includes("appointment") || lower.includes("jenkins")) {
      reply = `### Doctor Visit Preparation
You have an upcoming consultation with **Dr. Sarah Jenkins** on **November 18, 2026**.
Recommended focus areas:
1. Total cholesterol reading of 208 mg/dL vs. 58 mg/dL HDL.
2. Follow-up on family history of hypertension.
3. Review 7-day resting blood pressure logs.

You can preview and export your complete summary in the **Doctor Visit Summary** section.`;
    } else {
      reply = `Thank you for your question. As your AI health companion, I provide educational explanations to help you understand your measurements, reports, and preventive care.

* Remember: HealthBuddy provides educational information and does not replace the professional diagnostic evaluation of a licensed physician. If you are experiencing new, severe, or concerning symptoms, please contact your healthcare provider or emergency services immediately.`;
    }

    // Add assistant response
    const assistantMessage = mockStore.addAIMessage(params.conversationId, {
      sender: "assistant",
      content: reply,
      contextUsed: Object.entries(params.selectedContext)
        .filter(([, v]) => v)
        .map(([k]) => k.replace(/([A-Z])/g, " $1").trim()),
      citations,
      suggestedFollowUps: [
        "What questions should I ask my doctor?",
        "Explain reference ranges in my lab report",
        "How do lifestyle factors affect this reading?",
      ],
    });

    return assistantMessage;
  },

  subscribe(callback: () => void) {
    return mockStore.subscribe(callback);
  },
};

