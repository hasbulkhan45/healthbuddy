-- Extracted lab results (from medical records)
CREATE TABLE extracted_lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    result_value TEXT,
    unit TEXT,
    reference_range TEXT,
    status TEXT CHECK (status IN ('normal', 'borderline', 'high', 'low', 'critical')),
    status_label TEXT,
    extraction_status TEXT DEFAULT 'extracted' CHECK (extraction_status IN (
        'extracted', 'user_confirmed', 'rejected', 'flagged'
    )),
    confidence NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE extracted_lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lab results" ON extracted_lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medical_records WHERE medical_records.id = extracted_lab_results.record_id
            AND medical_records.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own lab results" ON extracted_lab_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM medical_records WHERE medical_records.id = extracted_lab_results.record_id
            AND medical_records.user_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX idx_extracted_lab_results_record_id ON extracted_lab_results(record_id);
CREATE INDEX idx_extracted_lab_results_test_name ON extracted_lab_results(test_name);