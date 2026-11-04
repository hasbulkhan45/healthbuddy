-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    date_of_birth DATE,
    sex TEXT CHECK (sex IN ('Male', 'Female', 'Other')),
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferred_units JSONB DEFAULT '{"temperature": "celsius", "weight": "kg", "height": "cm", "glucose": "mg/dL"}'::jsonb,
    ai_permissions JSONB DEFAULT '{
        "allowMedicalReports": true,
        "allowMedicines": true,
        "allowSymptoms": true,
        "allowHealthMeasurements": true,
        "allowHealthProfile": true
    }'::jsonb,
    health_profile JSONB DEFAULT '{
        "heightCm": null,
        "weightKg": null,
        "bmi": null,
        "existingConditions": [],
        "familyHistory": []
    }'::jsonb,
    lifestyle JSONB DEFAULT '{
        "activityLevel": "Sedentary",
        "sleepAverageHours": 7,
        "dietType": "Standard",
        "smokingStatus": "Never"
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);