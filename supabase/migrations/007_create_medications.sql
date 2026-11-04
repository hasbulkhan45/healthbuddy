-- Medications (active medications confirmed by user)
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    active_ingredient TEXT,
    strength TEXT,
    dosage_form TEXT DEFAULT 'Tablet',
    user_confirmed_instructions TEXT,
    frequency TEXT,
    prescribed_by TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Discontinued', 'Paused')),
    notes TEXT,
    reminder_enabled BOOLEAN DEFAULT FALSE,
    reminder_times TEXT[] DEFAULT '{}',
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    prescription_medicine_id UUID REFERENCES prescription_medicines(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medications" ON medications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications" ON medications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications" ON medications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications" ON medications
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_status ON medications(status);
CREATE INDEX idx_medications_prescription_id ON medications(prescription_id);