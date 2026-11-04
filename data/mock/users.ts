import { UserProfile, AllergyItem } from "@/types/user";

export const mockUser: UserProfile = {
  id: "user_alex_001",
  fullName: "Alex Mercer",
  email: "alex.mercer@example.com",
  phone: "+1 (555) 234-5678",
  dateOfBirth: "1992-04-15",
  age: 34,
  sex: "Male",
  bloodGroup: "O+",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  emergencyContact: {
    name: "Elena Mercer",
    relationship: "Spouse",
    phone: "+1 (555) 876-5432",
  },
  healthProfile: {
    heightCm: 178,
    weightKg: 68.5,
    bmi: 21.6,
    existingConditions: ["Mild Seasonal Allergies"],
    familyHistory: ["Maternal Type 2 Diabetes", "Paternal Hypertension"],
    generalConcerns: "Focusing on preventive cardiovascular health and balanced energy levels throughout the workday.",
  },
  lifestyle: {
    activityLevel: "Moderately active",
    sleepAverageHours: 7.2,
    dietType: "Mediterranean",
    smokingStatus: "Never",
    alcoholIntake: "Occasional",
  },
  aiPermissions: {
    allowMedicalReports: true,
    allowMedicines: true,
    allowSymptoms: true,
    allowHealthMeasurements: true,
    allowHealthProfile: true,
  },
  privacySettings: {
    shareWithEmergency: true,
    localDataRetentionOnly: false,
  },
};

export const mockAllergies: AllergyItem[] = [
  {
    id: "alg_001",
    allergen: "Penicillin",
    type: "Medication",
    severity: "Severe",
    reaction: "Hives, facial swelling, breathing difficulty",
    notes: "Diagnosed in childhood (1998). Avoid all penicillin-class antibiotics.",
  },
  {
    id: "alg_002",
    allergen: "Tree Pollen (Birch / Cedar)",
    type: "Environmental",
    severity: "Mild",
    reaction: "Sneezing, itchy eyes, mild nasal congestion",
    notes: "Seasonal flare-ups predominantly between March and May.",
  },
];

