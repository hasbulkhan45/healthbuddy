-- Symptoms journal
CREATE TABLE symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symptom_name TEXT NOT NULL,
    severity INTEGER CHECK (severity >= 1 AND severity <= 10),
    start_date DATE NOT NULL,
    duration TEXT,
    frequency TEXT,
    associated_symptoms TEXT[] DEFAULT '{}',
    possible_triggers TEXT,
    notes TEXT,
    is_emergency_alert BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptoms" ON symptoms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms" ON symptoms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptoms" ON symptoms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptoms" ON symptoms
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_symptoms_recorded_at ON symptoms(recorded_at DESC);
CREATE INDEX idx_symptoms_severity ON symptoms(severity);