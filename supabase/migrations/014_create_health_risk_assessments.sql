-- Health risk assessments
CREATE TABLE health_risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Critical')),
    score NUMERIC,
    factors JSONB DEFAULT '{}'::jsonb,
    recommendations TEXT[],
    assessment_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE health_risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own risk assessments" ON health_risk_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own risk assessments" ON health_risk_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own risk assessments" ON health_risk_assessments
    FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_health_risk_assessments_user_id ON health_risk_assessments(user_id);
CREATE INDEX idx_health_risk_assessments_category ON health_risk_assessments(category);
CREATE INDEX idx_health_risk_assessments_risk_level ON health_risk_assessments(risk_level);