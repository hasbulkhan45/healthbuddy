-- Medication logs (history of taken/skipped doses)
CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL,
    strength TEXT,
    scheduled_time TIME NOT NULL,
    scheduled_date DATE NOT NULL,
    actual_time TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('completed', 'skipped', 'partial')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON medication_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON medication_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX idx_medication_logs_date ON medication_logs(scheduled_date DESC);
CREATE INDEX idx_medication_logs_medication_id ON medication_logs(medication_id);