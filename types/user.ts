export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // ISO date string: "1992-04-15"
  age: number;
  sex: "Male" | "Female" | "Other" | "Prefer not to say";
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  avatarUrl?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  healthProfile: {
    heightCm: number;
    weightKg: number;
    bmi: number;
    existingConditions: string[];
    familyHistory: string[];
    generalConcerns: string;
  };
  lifestyle: {
    activityLevel: "Sedentary" | "Lightly active" | "Moderately active" | "Very active";
    sleepAverageHours: number;
    dietType: "Omnivore" | "Vegetarian" | "Vegan" | "Pescatarian" | "Mediterranean" | "Other";
    smokingStatus: "Never" | "Former" | "Current";
    alcoholIntake: "None" | "Occasional" | "Moderate";
  };
  aiPermissions: {
    allowMedicalReports: boolean;
    allowMedicines: boolean;
    allowSymptoms: boolean;
    allowHealthMeasurements: boolean;
    allowHealthProfile: boolean;
  };
  privacySettings: {
    shareWithEmergency: boolean;
    localDataRetentionOnly: boolean;
  };
}

export interface AllergyItem {
  id: string;
  allergen: string;
  type: "Food" | "Medication" | "Environmental" | "Other";
  severity: "Mild" | "Moderate" | "Severe";
  reaction: string;
  notes?: string;
}

