-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Document embeddings for RAG (medical records, prescriptions, etc.)
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'medical_record',
        'prescription',
        'lab_result',
        'symptom',
        'medication',
        'appointment',
        'care_plan',
        'health_insight'
    )),
    document_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    chunk_text TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(document_type, document_id, chunk_index)
);

-- Row Level Security
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own embeddings" ON document_embeddings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own embeddings" ON document_embeddings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own embeddings" ON document_embeddings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own embeddings" ON document_embeddings
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_document_embeddings_user_id ON document_embeddings(user_id);
CREATE INDEX idx_document_embeddings_document ON document_embeddings(document_type, document_id);
CREATE INDEX idx_document_embeddings_embedding ON document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION search_document_embeddings(
    query_embedding vector(1536),
    user_id_param UUID,
    document_types TEXT[] DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    document_type TEXT,
    document_id UUID,
    chunk_index INTEGER,
    chunk_text TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        de.id,
        de.document_type,
        de.document_id,
        de.chunk_index,
        de.chunk_text,
        de.metadata,
        1 - (de.embedding <=> query_embedding) AS similarity
    FROM document_embeddings de
    WHERE de.user_id = user_id_param
        AND (document_types IS NULL OR de.document_type = ANY(document_types))
        AND de.embedding IS NOT NULL
        AND 1 - (de.embedding <=> query_embedding) > match_threshold
    ORDER BY de.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;