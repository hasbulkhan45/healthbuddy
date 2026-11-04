-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    specialty TEXT,
    clinic_or_hospital TEXT,
    appointment_date DATE NOT NULL,
    appointment_time TIME,
    purpose TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Completed', 'Cancelled', 'Rescheduled')),
    location_type TEXT DEFAULT 'In-person' CHECK (location_type IN ('In-person', 'Video consultation', 'Phone')),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON appointments
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);