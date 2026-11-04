-- Medication reminders (scheduled doses)
CREATE TABLE medication_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    strength TEXT,
    scheduled_time TIME NOT NULL,
    scheduled_date DATE NOT NULL,
    instructions TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'snoozed')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE medication_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON medication_reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON medication_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON medication_reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON medication_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_medication_reminders_user_id ON medication_reminders(user_id);
CREATE INDEX idx_medication_reminders_date_time ON medication_reminders(scheduled_date, scheduled_time);
CREATE INDEX idx_medication_reminders_medication_id ON medication_reminders(medication_id);
CREATE INDEX idx_medication_reminders_status ON medication_reminders(status);