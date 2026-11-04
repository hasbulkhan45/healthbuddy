-- Health insights (AI-generated insights)
CREATE TABLE health_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    detail TEXT,
    category TEXT,
    insight_type TEXT CHECK (insight_type IN ('trend', 'correlation', 'alert', 'recommendation', 'educational')),
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'alert')),
    source_data JSONB DEFAULT '{}'::jsonb,
    related_metric_ids UUID[],
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMPTZ,
    is_demo_insight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE health_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON health_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON health_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON health_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_health_insights_user_id ON health_insights(user_id);
CREATE INDEX idx_health_insights_category ON health_insights(category);
CREATE INDEX idx_health_insights_created_at ON health_insights(created_at DESC);