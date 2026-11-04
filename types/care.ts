export interface Appointment {
  id: string;
  userId: string;
  doctorName: string;
  specialty: string;
  clinicOrHospital: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  purpose: string;
  notes?: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  locationType: "In-person" | "Video consultation";
}

export interface PreventiveCareItem {
  id: string;
  userId: string;
  title: string;
  category: "Vaccination" | "Routine Screening" | "Dental" | "Vision" | "Annual Physical";
  dueDate: string;
  status: "Due soon" | "Up to date" | "Overdue";
  description: string;
  importanceExplanation: string;
}

export interface FollowUpTask {
  id: string;
  userId: string;
  title: string;
  category: "Doctor follow-up" | "Report review" | "Test" | "Lifestyle task";
  dueDate: string;
  isCompleted: boolean;
  priority: "high" | "normal" | "low";
  relatedEntityId?: string;
}

