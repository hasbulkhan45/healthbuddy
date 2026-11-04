-- Prescription medicines (extracted from prescriptions)
CREATE TABLE prescription_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    generic_name TEXT,
    strength TEXT,
    dosage TEXT,
    dosage_unit TEXT,
    frequency TEXT,
    route TEXT DEFAULT 'Oral',
    timing TEXT,
    before_or_after_food TEXT,
    duration TEXT,
    start_date DATE,
    end_date DATE,
    additional_instructions TEXT,
    extraction_confidence NUMERIC DEFAULT 0,
    verification_status TEXT DEFAULT 'needs_review' CHECK (verification_status IN (
        'needs_review', 'user_confirmed', 'rejected'
    )),
    is_as_needed BOOLEAN DEFAULT FALSE,
    reminder_times TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE prescription_medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prescription medicines" ON prescription_medicines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prescriptions WHERE prescriptions.id = prescription_medicines.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own prescription medicines" ON prescription_medicines
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM prescriptions WHERE prescriptions.id = prescription_medicines.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own prescription medicines" ON prescription_medicines
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM prescriptions WHERE prescriptions.id = prescription_medicines.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own prescription medicines" ON prescription_medicines
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM prescriptions WHERE prescriptions.id = prescription_medicines.prescription_id
            AND prescriptions.user_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX idx_prescription_medicines_prescription_id ON prescription_medicines(prescription_id);