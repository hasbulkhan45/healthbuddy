-- Follow-up tasks
CREATE TABLE follow_up_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Doctor follow-up',
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    source TEXT,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE follow_up_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON follow_up_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON follow_up_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON follow_up_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON follow_up_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_follow_up_tasks_user_id ON follow_up_tasks(user_id);
CREATE INDEX idx_follow_up_tasks_due_date ON follow_up_tasks(due_date);
CREATE INDEX idx_follow_up_tasks_completed ON follow_up_tasks(is_completed);