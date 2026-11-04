-- Health metrics / measurements
CREATE TABLE health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'blood_pressure', 'heart_rate', 'blood_glucose', 'weight', 'spo2',
        'temperature', 'respiratory_rate', 'body_fat', 'muscle_mass', 'water_intake'
    )),
    value NUMERIC NOT NULL,
    secondary_value NUMERIC, -- For blood pressure (diastolic)
    unit TEXT NOT NULL,
    formatted_value TEXT,
    status TEXT NOT NULL CHECK (status IN ('normal', 'borderline', 'high', 'low', 'critical')),
    status_label TEXT,
    reference_range TEXT,
    source TEXT DEFAULT 'manual',
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics" ON health_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics" ON health_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics" ON health_metrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own metrics" ON health_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_type ON health_metrics(metric_type);
CREATE INDEX idx_health_metrics_recorded_at ON health_metrics(recorded_at DESC);
CREATE INDEX idx_health_metrics_user_type_date ON health_metrics(user_id, metric_type, recorded_at DESC);