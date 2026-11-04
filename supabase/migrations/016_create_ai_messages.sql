-- AI Messages
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    context_used JSONB DEFAULT '{}'::jsonb,
    citations JSONB DEFAULT '[]'::jsonb,
    suggested_follow_ups TEXT[] DEFAULT '{}',
    is_demo_response BOOLEAN DEFAULT FALSE,
    model_used TEXT,
    token_count INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON ai_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own messages" ON ai_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(created_at);
CREATE INDEX idx_ai_messages_sender ON ai_messages(sender);