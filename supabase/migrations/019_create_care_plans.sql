-- Care plans (generated from prescriptions)
CREATE TABLE care_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    summary TEXT,
    medication_schedule JSONB DEFAULT '[]'::jsonb,
    follow_up_appointment JSONB DEFAULT '{}'::jsonb,
    tests JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    is_user_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own care plans" ON care_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care plans" ON care_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care plans" ON care_plans
    FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_care_plans_user_id ON care_plans(user_id);
CREATE INDEX idx_care_plans_prescription_id ON care_plans(prescription_id);
CREATE INDEX idx_care_plans_status ON care_plans(status);