import { UserProfile, AllergyItem } from "@/types/user";
import { HealthMeasurement, WellnessScore, HealthRiskCategory } from "@/types/health";
import { MedicalRecord } from "@/types/report";
import { Medication, MedicationReminder } from "@/types/medicine";
import { SymptomLog } from "@/types/symptom";
import { Appointment, PreventiveCareItem, FollowUpTask } from "@/types/care";
import { AIConversation, AIMessage } from "@/types/ai";
import { AppNotification, ActivityFeedItem } from "@/types/notification";
import { Prescription, PrescriptionCarePlan, PrescriptionMedicine, VerificationStatus } from "@/types/prescription";

import { mockUser, mockAllergies } from "@/data/mock/users";
import { mockLatestMeasurements, mockWellnessScore } from "@/data/mock/health-metrics";
import { mockMedicalRecords } from "@/data/mock/reports";
import { mockMedications, mockMedicationReminders } from "@/data/mock/medicines";
import { mockSymptoms } from "@/data/mock/symptoms";
import { mockAppointments, mockPreventiveCare, mockFollowUpTasks } from "@/data/mock/appointments";
import { mockHealthRisks } from "@/data/mock/health-risks";
import { mockConversations } from "@/data/mock/ai-conversations";
import { mockNotifications, mockActivityFeed } from "@/data/mock/notifications";
import { mockPrescriptions, mockPrescriptionMedicines, mockCarePlans } from "@/data/mock/prescriptions";

class MockStore {
  private user: UserProfile = { ...mockUser };
  private allergies: AllergyItem[] = [...mockAllergies];
  private measurements: HealthMeasurement[] = [...mockLatestMeasurements];
  private wellnessScore: WellnessScore = { ...mockWellnessScore };
  private records: MedicalRecord[] = [...mockMedicalRecords];
  private medications: Medication[] = [...mockMedications];
  private reminders: MedicationReminder[] = [...mockMedicationReminders];
  private symptoms: SymptomLog[] = [...mockSymptoms];
  private appointments: Appointment[] = [...mockAppointments];
  private preventiveCare: PreventiveCareItem[] = [...mockPreventiveCare];
  private followUpTasks: FollowUpTask[] = [...mockFollowUpTasks];
  private healthRisks: HealthRiskCategory[] = [...mockHealthRisks];
  private conversations: AIConversation[] = [...mockConversations];
  private notifications: AppNotification[] = [...mockNotifications];
  private activities: ActivityFeedItem[] = [...mockActivityFeed];
  private prescriptions: Prescription[] = [...mockPrescriptions];
  private prescriptionMedicines: PrescriptionMedicine[] = [...mockPrescriptionMedicines];
  private carePlans: PrescriptionCarePlan[] = [...mockCarePlans];

  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("hb_measurements", JSON.stringify(this.measurements));
      localStorage.setItem("hb_reminders", JSON.stringify(this.reminders));
      localStorage.setItem("hb_symptoms", JSON.stringify(this.symptoms));
      localStorage.setItem("hb_appointments", JSON.stringify(this.appointments));
      localStorage.setItem("hb_tasks", JSON.stringify(this.followUpTasks));
      localStorage.setItem("hb_notifications", JSON.stringify(this.notifications));
      localStorage.setItem("hb_records", JSON.stringify(this.records));
      localStorage.setItem("hb_user", JSON.stringify(this.user));
      localStorage.setItem("hb_prescriptions", JSON.stringify(this.prescriptions));
      localStorage.setItem("hb_prescription_medicines", JSON.stringify(this.prescriptionMedicines));
      localStorage.setItem("hb_care_plans", JSON.stringify(this.carePlans));
    } catch {
      // Ignore quota errors in demo
    }
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const savedM = localStorage.getItem("hb_measurements");
      if (savedM) this.measurements = JSON.parse(savedM);

      const savedR = localStorage.getItem("hb_reminders");
      if (savedR) this.reminders = JSON.parse(savedR);

      const savedS = localStorage.getItem("hb_symptoms");
      if (savedS) this.symptoms = JSON.parse(savedS);

      const savedA = localStorage.getItem("hb_appointments");
      if (savedA) this.appointments = JSON.parse(savedA);

      const savedT = localStorage.getItem("hb_tasks");
      if (savedT) this.followUpTasks = JSON.parse(savedT);

      const savedN = localStorage.getItem("hb_notifications");
      if (savedN) this.notifications = JSON.parse(savedN);

      const savedRecs = localStorage.getItem("hb_records");
      if (savedRecs) this.records = JSON.parse(savedRecs);

      const savedU = localStorage.getItem("hb_user");
      if (savedU) this.user = JSON.parse(savedU);

      const savedPrescriptions = localStorage.getItem("hb_prescriptions");
      if (savedPrescriptions) this.prescriptions = JSON.parse(savedPrescriptions);

      const savedPrescriptionMedicines = localStorage.getItem("hb_prescription_medicines");
      if (savedPrescriptionMedicines) this.prescriptionMedicines = JSON.parse(savedPrescriptionMedicines);

      const savedCarePlans = localStorage.getItem("hb_care_plans");
      if (savedCarePlans) this.carePlans = JSON.parse(savedCarePlans);
    } catch {
      // Fallback to default in-memory state
    }
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- Getters ---
  public getUser(): UserProfile { return { ...this.user }; }
  public getAllergies(): AllergyItem[] { return [...this.allergies]; }
  public getMeasurements(): HealthMeasurement[] { return [...this.measurements]; }
  public getWellnessScore(): WellnessScore { return { ...this.wellnessScore }; }
  public getRecords(): MedicalRecord[] { return [...this.records]; }
  public getMedications(): Medication[] { return [...this.medications]; }
  public getReminders(): MedicationReminder[] { return [...this.reminders]; }
  public getSymptoms(): SymptomLog[] { return [...this.symptoms]; }
  public getAppointments(): Appointment[] { return [...this.appointments]; }
  public getPreventiveCare(): PreventiveCareItem[] { return [...this.preventiveCare]; }
  public getFollowUpTasks(): FollowUpTask[] { return [...this.followUpTasks]; }
  public getHealthRisks(): HealthRiskCategory[] { return [...this.healthRisks]; }
  public getConversations(): AIConversation[] { return [...this.conversations]; }
  public getNotifications(): AppNotification[] { return [...this.notifications]; }
  public getActivities(): ActivityFeedItem[] { return [...this.activities]; }
  public getPrescriptions(): Prescription[] { return [...this.prescriptions]; }
  public getPrescriptionById(id: string): Prescription | undefined { return this.prescriptions.find((p) => p.id === id); }
  public getPrescriptionMedicines(prescriptionId: string): PrescriptionMedicine[] {
    return this.prescriptionMedicines.filter((m) => m.prescriptionId === prescriptionId);
  }
  public getCarePlans(): PrescriptionCarePlan[] { return [...this.carePlans]; }
  public getCarePlanByPrescriptionId(prescriptionId: string): PrescriptionCarePlan | undefined {
    return this.carePlans.find((plan) => plan.prescriptionId === prescriptionId);
  }

  // --- Mutators ---
  public updateUser(profile: Partial<UserProfile>) {
    this.user = { ...this.user, ...profile };
    this.notify();
    return this.user;
  }

  public addAllergy(allergy: Omit<AllergyItem, "id">) {
    const newItem: AllergyItem = { ...allergy, id: `alg_${Date.now()}` };
    this.allergies.unshift(newItem);
    this.notify();
    return newItem;
  }

  public deleteAllergy(id: string) {
    this.allergies = this.allergies.filter((a) => a.id !== id);
    this.notify();
    return true;
  }

  public addMeasurement(data: Omit<HealthMeasurement, "id" | "userId" | "recordedAt">) {
    const newM: HealthMeasurement = {
      ...data,
      id: `m_${Date.now()}`,
      userId: this.user.id,
      recordedAt: new Date().toISOString(),
    };
    // Replace latest or add
    this.measurements = [newM, ...this.measurements.filter((m) => m.metricType !== newM.metricType)];
    this.activities.unshift({
      id: `act_${Date.now()}`,
      type: "measurement",
      title: `${newM.metricType.replace(/_/g, " ").toUpperCase()} Logged`,
      description: `${newM.formattedValue} ${newM.unit} • Status: ${newM.statusLabel}`,
      timestamp: "Just now",
      targetHref: "/health-overview",
    });
    this.notify();
    return newM;
  }

  public deleteMeasurement(id: string) {
    this.measurements = this.measurements.filter((m) => m.id !== id);
    this.notify();
    return true;
  }

  public addRecord(record: Omit<MedicalRecord, "id" | "userId" | "uploadedAt">) {
    const newR: MedicalRecord = {
      ...record,
      id: `rec_${Date.now()}`,
      userId: this.user.id,
      uploadedAt: new Date().toISOString(),
    };
    this.records.unshift(newR);
    this.activities.unshift({
      id: `act_${Date.now()}`,
      type: "report_upload",
      title: `${newR.title} Uploaded`,
      description: `Category: ${newR.categoryLabel} • Upload complete`,
      timestamp: "Just now",
      targetHref: `/records/${newR.id}`,
    });
    this.notify();
    return newR;
  }

  public confirmLabResult(recordId: string, resultId: string) {
    const rec = this.records.find((r) => r.id === recordId);
    if (rec && rec.extractedResults) {
      const res = rec.extractedResults.find((x) => x.id === resultId);
      if (res) {
        res.extractionStatus = "user_confirmed";
        this.notify();
      }
    }
    return true;
  }

  public addMedication(data: Omit<Medication, "id" | "userId">) {
    const newMed: Medication = {
      ...data,
      id: `med_${Date.now()}`,
      userId: this.user.id,
    };
    this.medications.unshift(newMed);
    if (newMed.reminderEnabled) {
      newMed.reminderTimes.forEach((t) => {
        this.reminders.unshift({
          id: `rem_${Date.now()}_${t}`,
          medicationId: newMed.id,
          medicationName: newMed.name,
          strength: newMed.strength,
          scheduledTime: t,
          scheduledDate: new Date().toISOString().split("T")[0],
          status: "pending",
          instructions: newMed.userConfirmedInstructions,
        });
      });
    }
    this.notify();
    return newMed;
  }

  public toggleReminder(id: string, status: "completed" | "skipped" | "pending") {
    const rem = this.reminders.find((r) => r.id === id);
    if (rem) {
      rem.status = status;
      if (status === "completed") {
        rem.completedAt = new Date().toISOString();
      }
      this.notify();
    }
    return rem;
  }

  public addSymptom(data: Omit<SymptomLog, "id" | "userId" | "recordedAt">) {
    const newSym: SymptomLog = {
      ...data,
      id: `sym_${Date.now()}`,
      userId: this.user.id,
      recordedAt: new Date().toISOString(),
    };
    this.symptoms.unshift(newSym);
    this.activities.unshift({
      id: `act_${Date.now()}`,
      type: "symptom",
      title: `${newSym.symptomName} Logged`,
      description: `Severity: ${newSym.severity}/10 • ${newSym.frequency}`,
      timestamp: "Just now",
      targetHref: "/symptoms",
    });
    this.notify();
    return newSym;
  }

  public addAppointment(data: Omit<Appointment, "id" | "userId">) {
    const newApt: Appointment = {
      ...data,
      id: `apt_${Date.now()}`,
      userId: this.user.id,
    };
    this.appointments.unshift(newApt);
    this.activities.unshift({
      id: `act_${Date.now()}`,
      type: "appointment",
      title: `Appointment Scheduled: ${newApt.doctorName}`,
      description: `${newApt.date} at ${newApt.time} • ${newApt.specialty}`,
      timestamp: "Just now",
      targetHref: "/care",
    });
    this.notify();
    return newApt;
  }

  public updateAppointment(id: string, updates: Partial<Appointment>) {
    const apt = this.appointments.find((a) => a.id === id);
    if (apt) {
      Object.assign(apt, updates);
      this.notify();
    }
    return apt;
  }

  public deleteAppointment(id: string) {
    this.appointments = this.appointments.filter((a) => a.id !== id);
    this.notify();
    return true;
  }

  public toggleFollowUpTask(id: string) {
    const task = this.followUpTasks.find((t) => t.id === id);
    if (task) {
      task.isCompleted = !task.isCompleted;
      this.notify();
    }
    return task;
  }

  public addFollowUpTask(data: Omit<FollowUpTask, "id" | "userId">) {
    const newTask: FollowUpTask = {
      ...data,
      id: `task_${Date.now()}`,
      userId: this.user.id,
    };
    this.followUpTasks.unshift(newTask);
    this.notify();
    return newTask;
  }

  public addAIMessage(conversationId: string, message: Omit<AIMessage, "id" | "conversationId" | "timestamp">) {
    let conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) {
      conv = {
        id: conversationId,
        title: message.content.slice(0, 32) + "...",
        lastMessagePreview: message.content.slice(0, 50),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      this.conversations.unshift(conv);
    }
    const newMsg: AIMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      conversationId,
      timestamp: new Date().toISOString(),
    };
    conv.messages.push(newMsg);
    conv.lastMessagePreview = newMsg.content.slice(0, 50);
    conv.updatedAt = new Date().toISOString();
    this.notify();
    return newMsg;
  }

  public markNotificationAsRead(id: string) {
    const n = this.notifications.find((notif) => notif.id === id);
    if (n) {
      n.isRead = true;
      this.notify();
    }
    return n;
  }

  public markAllNotificationsAsRead() {
    this.notifications.forEach((n) => (n.isRead = true));
    this.notify();
    return true;
  }

  public addPrescription(data: Omit<Prescription, "id" | "createdAt" | "updatedAt" | "verificationStatus" | "workflowStage" | "requiresUserReview" | "userId"> & { userId?: string }) {
    const now = new Date().toISOString();
    const newPrescription: Prescription = {
      ...data,
      id: `presc_${Date.now()}`,
      userId: data.userId || this.user.id,
      verificationStatus: "needs_review",
      workflowStage: "needs_review",
      requiresUserReview: true,
      createdAt: now,
      updatedAt: now,
      documentName: data.documentName || "Prescription document",
      doctorName: data.doctorName || "Needs review",
      doctorSpecialty: data.doctorSpecialty || "Unspecified",
      clinicName: data.clinicName || "Unspecified",
      followUpInstruction: data.followUpInstruction || "Follow-up instructions pending verification.",
      diagnosisText: data.diagnosisText || "Diagnosis not extracted.",
      testsAdvised: data.testsAdvised || [],
      generalInstructions: data.generalInstructions || [],
      extractedFields: data.extractedFields || {},
      visitDate: data.visitDate || "",
      prescriptionDate: data.prescriptionDate || new Date().toISOString().split("T")[0],
      followUpDate: data.followUpDate || "",
      fileType: data.fileType || "pdf",
    };

    this.prescriptions.unshift(newPrescription);
    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: this.user.id,
      title: "Prescription needs verification",
      message: `${newPrescription.doctorName || "New prescription"} requires your review before appointment and medication reminders are activated.`,
      category: "medications",
      createdAt: now,
      isRead: false,
      actionUrl: `/prescriptions/${newPrescription.id}`,
      actionLabel: "Review Prescription",
    });
    this.activities.unshift({
      id: `act_${Date.now()}`,
      type: "report_upload",
      title: "Prescription uploaded",
      description: `${newPrescription.documentName} is ready for extraction review.`,
      timestamp: "Just now",
      targetHref: `/prescriptions/${newPrescription.id}`,
    });
    this.notify();
    return newPrescription;
  }

  public updatePrescription(id: string, updates: Partial<Prescription>) {
    const prescription = this.prescriptions.find((p) => p.id === id);
    if (!prescription) return undefined;
    Object.assign(prescription, updates, { updatedAt: new Date().toISOString() });
    if (prescription.verificationStatus === "user_confirmed") {
      prescription.workflowStage = "confirmed";
      prescription.requiresUserReview = false;
    }
    this.notify();
    return prescription;
  }

  public verifyPrescription(id: string, status: VerificationStatus = "user_confirmed") {
    const prescription = this.prescriptions.find((p) => p.id === id);
    if (!prescription) return undefined;
    prescription.verificationStatus = status;
    prescription.workflowStage = status === "user_confirmed" ? "confirmed" : "needs_review";
    prescription.requiresUserReview = status !== "user_confirmed";
    prescription.updatedAt = new Date().toISOString();

    if (status === "user_confirmed") {
      const meds = this.prescriptionMedicines.filter((m) => m.prescriptionId === id);
      meds.forEach((med) => {
        const match = this.medications.find((item) => item.name.toLowerCase() === med.medicineName.toLowerCase());
        if (!match) {
          this.medications.unshift({
            id: `med_${Date.now()}_${med.id}`,
            userId: this.user.id,
            name: med.medicineName,
            activeIngredient: med.genericName || med.medicineName,
            strength: med.strength || "Standard",
            dosageForm: "Tablet",
            userConfirmedInstructions: `${med.dosage || "1"} ${med.dosageUnit || "tablet"} ${med.frequency || "Once daily"} ${med.timing || "as directed"}. ${med.additionalInstructions || ""}`.trim(),
            frequency: med.frequency as Medication["frequency"],
            prescribedBy: prescription.doctorName,
            startDate: med.startDate || prescription.prescriptionDate || new Date().toISOString().split("T")[0],
            endDate: med.endDate || undefined,
            status: "Active",
            notes: med.additionalInstructions || "Confirmed from prescription upload.",
            reminderEnabled: (med.reminderTimes?.length ?? 0) > 0,
            reminderTimes: med.reminderTimes || [],
          });
        } else {
          this.notifications.unshift({
            id: `notif_${Date.now()}`,
            userId: this.user.id,
            title: "Prescription update flagged for review",
            message: `A prescription for ${med.medicineName} conflicts with an existing medication record. Please review before changing the current medication plan.`,
            category: "medications",
            createdAt: new Date().toISOString(),
            isRead: false,
            actionUrl: `/prescriptions/${id}`,
            actionLabel: "Review Conflict",
          });
        }
      });

      if (prescription.followUpDate) {
        this.appointments.unshift({
          id: `apt_${Date.now()}`,
          userId: this.user.id,
          doctorName: prescription.doctorName,
          specialty: prescription.doctorSpecialty,
          clinicOrHospital: prescription.clinicName,
          date: prescription.followUpDate,
          time: "TBA",
          purpose: prescription.followUpInstruction || "Follow-up consultation",
          notes: `Generated from prescription review on ${prescription.prescriptionDate}. Confirm required before activation.`,
          status: "Upcoming",
          locationType: "In-person",
        });
      }
    }

    this.notify();
    return prescription;
  }

  public addPrescriptionMedicine(data: Omit<PrescriptionMedicine, "id">) {
    const item: PrescriptionMedicine = { ...data, id: `pm_${Date.now()}` };
    this.prescriptionMedicines.unshift(item);
    this.notify();
    return item;
  }

  public addCarePlan(plan: Omit<PrescriptionCarePlan, "id" | "createdAt">) {
    const item: PrescriptionCarePlan = { ...plan, id: `cp_${Date.now()}`, createdAt: new Date().toISOString() };
    this.carePlans.unshift(item);
    this.activities.unshift({
      id: `act_${Date.now()}`,
      type: "appointment",
      title: "Care plan generated",
      description: `Prescription follow-up and medication plan drafted for ${plan.followUpAppointment.doctorName || "your clinician"}.`,
      timestamp: "Just now",
      targetHref: `/prescriptions/${plan.prescriptionId}`,
    });
    this.notify();
    return item;
  }
}

export const mockStore = new MockStore();

