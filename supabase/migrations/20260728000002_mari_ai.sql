-- =====================================================================================
-- PHASE 3: MARI AI INTELLIGENCE ENGINE
-- =====================================================================================

-- Enable vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================================================
-- 1. AI CONVERSATIONS
-- =====================================================================================
CREATE TABLE public.mari_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_mari_conversations_updated_at BEFORE UPDATE ON mari_conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.mari_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own conversations" ON public.mari_conversations FOR ALL USING (organization_id IN (SELECT get_user_organizations()) AND user_id = auth.uid());

-- =====================================================================================
-- 2. AI MESSAGES
-- =====================================================================================
CREATE TABLE public.mari_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.mari_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.mari_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access messages of their conversations" ON public.mari_messages FOR ALL
    USING (conversation_id IN (SELECT id FROM public.mari_conversations WHERE user_id = auth.uid()));

-- =====================================================================================
-- 3. AI KNOWLEDGE BASE (with pgvector embeddings)
-- =====================================================================================
CREATE TABLE public.mari_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('document', 'customer', 'project', 'report', 'manual')),
    source_id UUID,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.mari_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access org knowledge" ON public.mari_knowledge FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- Create vector index for similarity search
CREATE INDEX IF NOT EXISTS mari_knowledge_embedding_idx ON public.mari_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =====================================================================================
-- 4. AUTOMATION WORKFLOWS
-- =====================================================================================
CREATE TABLE public.mari_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    trigger TEXT NOT NULL CHECK (trigger IN ('customer_created', 'task_overdue', 'document_uploaded', 'lead_won', 'manual')),
    conditions JSONB DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '[]',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_mari_workflows_updated_at BEFORE UPDATE ON mari_workflows FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.mari_workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage org workflows" ON public.mari_workflows FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 5. AI ACTIVITY AUDIT LOGS
-- =====================================================================================
CREATE TABLE public.mari_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    agent_used TEXT,
    data_sources_accessed TEXT[],
    response_summary TEXT,
    tokens_used INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.mari_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view activity logs" ON public.mari_activity_logs FOR SELECT USING (organization_id IN (SELECT get_user_organizations()));
CREATE POLICY "System inserts activity logs" ON public.mari_activity_logs FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 6. MARI AI SETTINGS
-- =====================================================================================
CREATE TABLE public.mari_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    ai_enabled BOOLEAN DEFAULT true,
    data_sources JSONB DEFAULT '{"customers": true, "tasks": true, "documents": true, "reports": true}',
    privacy_mode BOOLEAN DEFAULT false,
    usage_limit_daily INTEGER DEFAULT 1000,
    model_preference TEXT DEFAULT 'gemini/gemini-2.0-flash',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_mari_settings_updated_at BEFORE UPDATE ON mari_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.mari_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org owners manage AI settings" ON public.mari_settings FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 7. SEED DEFAULT WORKFLOWS
-- =====================================================================================
-- Note: Organization-specific seeds happen when an org is provisioned
-- Default workflow templates are handled in application code

-- =====================================================================================
-- 8. HELPER FUNCTION: Knowledge Base Similarity Search
-- =====================================================================================
CREATE OR REPLACE FUNCTION public.match_knowledge(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.78,
    match_count INT DEFAULT 5,
    p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    source_type TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        mk.id,
        mk.title,
        mk.content,
        mk.source_type,
        1 - (mk.embedding <=> query_embedding) AS similarity
    FROM public.mari_knowledge mk
    WHERE
        (p_organization_id IS NULL OR mk.organization_id = p_organization_id)
        AND 1 - (mk.embedding <=> query_embedding) > match_threshold
    ORDER BY mk.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
