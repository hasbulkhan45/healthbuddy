-- Preventive care items
CREATE TABLE preventive_care (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    importance_explanation TEXT,
    status TEXT DEFAULT 'Due soon' CHECK (status IN ('Up to date', 'Due soon', 'Overdue', 'Not applicable')),
    due_date DATE,
    last_completed_date DATE,
    frequency_months INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE preventive_care ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preventive care" ON preventive_care
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preventive care" ON preventive_care
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preventive care" ON preventive_care
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preventive care" ON preventive_care
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_preventive_care_user_id ON preventive_care(user_id);
CREATE INDEX idx_preventive_care_status ON preventive_care(status);
CREATE INDEX idx_preventive_care_due_date ON preventive_care(due_date);