-- Medical records / reports
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'lab_report', 'prescription', 'imaging', 'discharge_summary',
        'vaccination', 'referral', 'other'
    )),
    category_label TEXT,
    institution_name TEXT,
    document_date DATE,
    file_size TEXT,
    file_type TEXT,
    file_path TEXT, -- Supabase Storage path
    verification_status TEXT DEFAULT 'extracted' CHECK (verification_status IN (
        'extracted', 'user_confirmed', 'needs_review', 'verified'
    )),
    summary TEXT,
    extracted_results JSONB DEFAULT '[]'::jsonb,
    raw_text TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records" ON medical_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON medical_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON medical_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON medical_records
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX idx_medical_records_category ON medical_records(category);
CREATE INDEX idx_medical_records_uploaded_at ON medical_records(uploaded_at DESC);