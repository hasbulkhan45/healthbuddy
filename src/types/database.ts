/**
 * Database types generated from Supabase schema
 * These types mirror the PostgreSQL tables exactly
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  date_of_birth: string | null;
  sex: 'Male' | 'Female' | 'Other' | null;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  phone: string | null;
  avatar_url: string | null;
  timezone: string;
  preferred_units: {
    temperature: 'celsius' | 'fahrenheit';
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
    glucose: 'mg/dL' | 'mmol/L';
  };
  ai_permissions: {
    allowMedicalReports: boolean;
    allowMedicines: boolean;
    allowSymptoms: boolean;
    allowHealthMeasurements: boolean;
    allowHealthProfile: boolean;
  };
  health_profile: {
    heightCm: number | null;
    weightKg: number | null;
    bmi: number | null;
    existingConditions: string[];
    familyHistory: string[];
  };
  lifestyle: {
    activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active';
    sleepAverageHours: number;
    dietType: string;
    smokingStatus: 'Never' | 'Former' | 'Current';
  };
  created_at: string;
  updated_at: string;
}

export type HealthMetricType =
  | 'blood_pressure'
  | 'heart_rate'
  | 'blood_glucose'
  | 'weight'
  | 'spo2'
  | 'temperature'
  | 'respiratory_rate'
  | 'body_fat'
  | 'muscle_mass'
  | 'water_intake';

export type HealthMetricStatus = 'normal' | 'borderline' | 'high' | 'low' | 'critical';

export interface HealthMetric {
  id: string;
  user_id: string;
  metric_type: HealthMetricType;
  value: number;
  secondary_value: number | null;
  unit: string;
  formatted_value: string | null;
  status: HealthMetricStatus;
  status_label: string | null;
  reference_range: string | null;
  source: string;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export type MedicalRecordCategory =
  | 'lab_report'
  | 'prescription'
  | 'imaging'
  | 'discharge_summary'
  | 'vaccination'
  | 'referral'
  | 'other';

export type MedicalRecordVerificationStatus =
  | 'extracted'
  | 'user_confirmed'
  | 'needs_review'
  | 'verified';

export interface ExtractedLabResult {
  id: string;
  recordId: string;
  testName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  status: HealthMetricStatus;
  statusLabel: string;
  extractionStatus: 'extracted' | 'user_confirmed' | 'rejected' | 'flagged';
  confidence: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  user_id: string;
  title: string;
  category: MedicalRecordCategory;
  category_label: string | null;
  institution_name: string | null;
  document_date: string | null;
  file_size: string | null;
  file_type: string | null;
  file_path: string | null;
  verification_status: MedicalRecordVerificationStatus;
  summary: string | null;
  extracted_results: ExtractedLabResult[];
  raw_text: string | null;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export type PrescriptionVerificationStatus =
  | 'needs_review'
  | 'user_confirmed'
  | 'processing'
  | 'failed';

export type PrescriptionWorkflowStage =
  | 'uploading'
  | 'reading'
  | 'extracting'
  | 'identifying_medicines'
  | 'preparing_care_plan'
  | 'needs_review'
  | 'confirmed';

export interface Prescription {
  id: string;
  user_id: string;
  document_id: string | null;
  document_name: string | null;
  doctor_name: string | null;
  doctor_specialty: string | null;
  clinic_name: string | null;
  visit_date: string | null;
  prescription_date: string | null;
  follow_up_date: string | null;
  follow_up_instruction: string | null;
  diagnosis_text: string | null;
  tests_advised: string[];
  general_instructions: string[];
  extracted_fields: Record<string, Json>;
  file_type: string | null;
  preview_url: string | null;
  verification_status: PrescriptionVerificationStatus;
  workflow_stage: PrescriptionWorkflowStage;
  requires_user_review: boolean;
  ocr_provider: string | null;
  ocr_confidence: number | null;
  ocr_warnings: string[];
  created_at: string;
  updated_at: string;
}

export type PrescriptionMedicineVerificationStatus =
  | 'needs_review'
  | 'user_confirmed'
  | 'rejected';

export interface PrescriptionMedicine {
  id: string;
  prescription_id: string;
  medicine_name: string;
  generic_name: string | null;
  strength: string | null;
  dosage: string | null;
  dosage_unit: string | null;
  frequency: string | null;
  route: string | null;
  timing: string | null;
  before_or_after_food: string | null;
  duration: string | null;
  start_date: string | null;
  end_date: string | null;
  additional_instructions: string | null;
  extraction_confidence: number;
  verification_status: PrescriptionMedicineVerificationStatus;
  is_as_needed: boolean;
  reminder_times: string[];
  created_at: string;
  updated_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  active_ingredient: string | null;
  strength: string | null;
  dosage_form: string;
  user_confirmed_instructions: string | null;
  frequency: string | null;
  prescribed_by: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'Active' | 'Completed' | 'Discontinued' | 'Paused';
  notes: string | null;
  reminder_enabled: boolean;
  reminder_times: string[];
  prescription_id: string | null;
  prescription_medicine_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationReminder {
  id: string;
  user_id: string;
  medication_id: string | null;
  medication_name: string;
  strength: string | null;
  scheduled_time: string;
  scheduled_date: string;
  instructions: string | null;
  status: 'pending' | 'completed' | 'skipped' | 'snoozed';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  user_id: string;
  medication_id: string | null;
  medication_name: string;
  strength: string | null;
  scheduled_time: string;
  scheduled_date: string;
  actual_time: string | null;
  status: 'completed' | 'skipped' | 'partial';
  notes: string | null;
  created_at: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  symptom_name: string;
  severity: number;
  start_date: string;
  duration: string | null;
  frequency: string | null;
  associated_symptoms: string[];
  possible_triggers: string | null;
  notes: string | null;
  is_emergency_alert: boolean;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  doctor_name: string;
  specialty: string | null;
  clinic_or_hospital: string | null;
  appointment_date: string;
  appointment_time: string | null;
  purpose: string | null;
  notes: string | null;
  status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled';
  location_type: 'In-person' | 'Video consultation' | 'Phone';
  prescription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUpTask {
  id: string;
  user_id: string;
  title: string;
  category: string;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  source: string | null;
  prescription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreventiveCareItem {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string | null;
  importance_explanation: string | null;
  status: 'Up to date' | 'Due soon' | 'Overdue' | 'Not applicable';
  due_date: string | null;
  last_completed_date: string | null;
  frequency_months: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthRiskAssessment {
  id: string;
  user_id: string;
  category: string;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  score: number | null;
  factors: Record<string, Json>;
  recommendations: string[];
  assessment_date: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string | null;
  selected_context: {
    medicalReports: boolean;
    medicines: boolean;
    symptoms: boolean;
    healthMeasurements: boolean;
    healthProfile: boolean;
    generalKnowledgeOnly: boolean;
  };
  message_count: number;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  sender: 'user' | 'assistant';
  content: string;
  context_used: Record<string, Json>;
  citations: Array<{
    id: string;
    sourceType: string;
    sourceName: string;
    excerpt: string;
    isSimulatedDemoCitation: boolean;
  }>;
  suggested_follow_ups: string[];
  is_demo_response: boolean;
  model_used: string | null;
  token_count: number | null;
  response_time_ms: number | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  category: 'general' | 'medications' | 'appointments' | 'measurements' | 'symptoms' | 'reports' | 'prescriptions' | 'ai' | 'system';
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  action_label: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
}

export interface HealthInsight {
  id: string;
  user_id: string;
  title: string;
  summary: string | null;
  detail: string | null;
  category: string | null;
  insight_type: 'trend' | 'correlation' | 'alert' | 'recommendation' | 'educational';
  severity: 'info' | 'warning' | 'alert';
  source_data: Record<string, Json>;
  related_metric_ids: string[];
  is_dismissed: boolean;
  dismissed_at: string | null;
  is_demo_insight: boolean;
  created_at: string;
  updated_at: string;
}

export interface CarePlan {
  id: string;
  user_id: string;
  prescription_id: string | null;
  summary: string | null;
  medication_schedule: Array<{
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string | null;
    duration: string | null;
    startDate: string | null;
    endDate: string | null;
    instructions: string | null;
    reminderTimes: string[];
  }>;
  follow_up_appointment: {
    doctorName: string | null;
    clinicName: string | null;
    followUpDate: string | null;
    purpose: string | null;
    notes: string | null;
    status: string;
  } | null;
  tests: Array<{
    name: string;
    suggestedAction: string;
    status: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    status: string;
    source: string;
  }>;
  status: 'draft' | 'active' | 'completed' | 'archived';
  is_user_confirmed: boolean;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentEmbeddingType =
  | 'medical_record'
  | 'prescription'
  | 'lab_result'
  | 'symptom'
  | 'medication'
  | 'appointment'
  | 'care_plan'
  | 'health_insight';

export interface DocumentEmbedding {
  id: string;
  userId: string;
  documentType: DocumentEmbeddingType;
  documentId: string;
  chunkIndex: number;
  chunkText: string;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Database schema type for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      health_metrics: {
        Row: HealthMetric;
        Insert: Omit<HealthMetric, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HealthMetric, 'id' | 'user_id' | 'created_at'>>;
      };
      medical_records: {
        Row: MedicalRecord;
        Insert: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MedicalRecord, 'id' | 'user_id' | 'created_at'>>;
      };
      prescriptions: {
        Row: Prescription;
        Insert: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Prescription, 'id' | 'user_id' | 'created_at'>>;
      };
      prescription_medicines: {
        Row: PrescriptionMedicine;
        Insert: Omit<PrescriptionMedicine, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PrescriptionMedicine, 'id' | 'prescription_id' | 'created_at'>>;
      };
      extracted_lab_results: {
        Row: ExtractedLabResult;
        Insert: Omit<ExtractedLabResult, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<ExtractedLabResult, 'id' | 'recordId' | 'createdAt'>>;
      };
      medications: {
        Row: Medication;
        Insert: Omit<Medication, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Medication, 'id' | 'user_id' | 'created_at'>>;
      };
      medication_reminders: {
        Row: MedicationReminder;
        Insert: Omit<MedicationReminder, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MedicationReminder, 'id' | 'user_id' | 'created_at'>>;
      };
      medication_logs: {
        Row: MedicationLog;
        Insert: Omit<MedicationLog, 'id' | 'created_at'>;
        Update: Partial<Omit<MedicationLog, 'id' | 'user_id' | 'created_at'>>;
      };
      symptoms: {
        Row: Symptom;
        Insert: Omit<Symptom, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Symptom, 'id' | 'user_id' | 'created_at'>>;
      };
      appointments: {
        Row: Appointment;
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Appointment, 'id' | 'user_id' | 'created_at'>>;
      };
      follow_up_tasks: {
        Row: FollowUpTask;
        Insert: Omit<FollowUpTask, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FollowUpTask, 'id' | 'user_id' | 'created_at'>>;
      };
      preventive_care: {
        Row: PreventiveCareItem;
        Insert: Omit<PreventiveCareItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PreventiveCareItem, 'id' | 'user_id' | 'created_at'>>;
      };
      health_risk_assessments: {
        Row: HealthRiskAssessment;
        Insert: Omit<HealthRiskAssessment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HealthRiskAssessment, 'id' | 'user_id' | 'created_at'>>;
      };
      ai_conversations: {
        Row: AIConversation;
        Insert: Omit<AIConversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIConversation, 'id' | 'user_id' | 'created_at'>>;
      };
      ai_messages: {
        Row: AIMessage;
        Insert: Omit<AIMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<AIMessage, 'id' | 'conversation_id' | 'user_id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>;
      };
      health_insights: {
        Row: HealthInsight;
        Insert: Omit<HealthInsight, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HealthInsight, 'id' | 'user_id' | 'created_at'>>;
      };
      care_plans: {
        Row: CarePlan;
        Insert: Omit<CarePlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CarePlan, 'id' | 'user_id' | 'created_at'>>;
      };
      document_embeddings: {
        Row: DocumentEmbedding;
        Insert: Omit<DocumentEmbedding, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<DocumentEmbedding, 'id' | 'userId' | 'createdAt'>>;
      };
    };
  };
}