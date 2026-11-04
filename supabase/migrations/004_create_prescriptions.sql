-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    document_name TEXT,
    doctor_name TEXT,
    doctor_specialty TEXT,
    clinic_name TEXT,
    visit_date DATE,
    prescription_date DATE,
    follow_up_date DATE,
    follow_up_instruction TEXT,
    diagnosis_text TEXT,
    tests_advised TEXT[] DEFAULT '{}',
    general_instructions TEXT[] DEFAULT '{}',
    extracted_fields JSONB DEFAULT '{}'::jsonb,
    file_type TEXT,
    preview_url TEXT,
    verification_status TEXT DEFAULT 'needs_review' CHECK (verification_status IN (
        'needs_review', 'user_confirmed', 'processing', 'failed'
    )),
    workflow_stage TEXT DEFAULT 'uploading' CHECK (workflow_stage IN (
        'uploading', 'reading', 'extracting', 'identifying_medicines',
        'preparing_care_plan', 'needs_review', 'confirmed'
    )),
    requires_user_review BOOLEAN DEFAULT TRUE,
    ocr_provider TEXT,
    ocr_confidence NUMERIC,
    ocr_warnings TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prescriptions" ON prescriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prescriptions" ON prescriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prescriptions" ON prescriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_prescriptions_user_id ON prescriptions(user_id);
CREATE INDEX idx_prescriptions_verification ON prescriptions(verification_status);
CREATE INDEX idx_prescriptions_created_at ON prescriptions(created_at DESC);
CREATE INDEX idx_prescriptions_document_id ON prescriptions(document_id);