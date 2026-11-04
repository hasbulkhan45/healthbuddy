export interface AIContextSelection {
  medicalReports: boolean;
  medicines: boolean;
  symptoms: boolean;
  healthMeasurements: boolean;
  healthProfile: boolean;
  generalKnowledgeOnly: boolean;
}

export interface AICitation {
  id: string;
  sourceType: "Laboratory Reference" | "Clinical Guideline" | "Educational Resource";
  sourceName: string;
  excerpt: string;
  isSimulatedDemoCitation: boolean;
}

export interface StructuredAICard {
  type: "vitals_highlight" | "lab_comparison" | "checklist" | "warning_banner";
  title: string;
  data: Record<string, any>;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  contextUsed?: string[];
  citations?: AICitation[];
  structuredCard?: StructuredAICard;
  suggestedFollowUps?: string[];
}

export interface AIConversation {
  id: string;
  title: string;
  lastMessagePreview: string;
  updatedAt: string;
  messages: AIMessage[];
}

