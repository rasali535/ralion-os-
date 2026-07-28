-- =====================================================================================
-- PHASE 8 & PHASE 9: MARKETPLACE, DEVELOPER PLATFORM, ENTERPRISE & GOVERNMENT EDITION
-- =====================================================================================

-- 1. MARKETPLACE ITEMS (Modules, Integrations, AI Agents, Templates)
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('module', 'integration', 'agent', 'template')),
    category TEXT DEFAULT 'general',
    description TEXT,
    author TEXT DEFAULT 'Ras Ali Labs',
    price NUMERIC(10,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'BWP',
    rating NUMERIC(3,2) DEFAULT 5.0,
    downloads_count INTEGER DEFAULT 0,
    icon TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active marketplace items" ON public.marketplace_items FOR SELECT USING (status = 'active');

-- 2. DEVELOPER API KEYS & WEBHOOKS
CREATE TABLE IF NOT EXISTS public.developer_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['read'],
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.developer_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view API keys" ON public.developer_api_keys FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

CREATE TABLE IF NOT EXISTS public.webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT[] NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'failing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage webhooks" ON public.webhooks FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- 3. ENTERPRISE & SSO CONFIGURATIONS
CREATE TABLE IF NOT EXISTS public.enterprise_sso_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('azure_ad', 'okta', 'google_workspace', 'saml_custom')),
    metadata_url TEXT,
    domain_allowlist TEXT[],
    enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.enterprise_sso_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org admins view SSO config" ON public.enterprise_sso_configs FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- 4. GOVERNMENT EDITION: CITIZEN CASES & WORKFLOWS
CREATE TABLE IF NOT EXISTS public.government_citizen_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    reference_no TEXT UNIQUE DEFAULT ('GOV-CASE-' || substring(uuid_generate_v4()::text, 1, 8)),
    citizen_name TEXT NOT NULL,
    national_id TEXT,
    contact_phone TEXT,
    ministry TEXT DEFAULT 'Ministry of Infrastructure',
    case_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'escalated', 'closed')),
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.government_citizen_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Government workers view cases" ON public.government_citizen_cases FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- SEED MARKETPLACE ITEMS
INSERT INTO public.marketplace_items (title, slug, type, category, description, author, price, rating, downloads_count, icon) VALUES
('Ralion HR & Payroll', 'ralion-hr-payroll', 'module', 'hr', 'Complete staff management, leave tracking, and Botswana BURS tax ready payroll.', 'Ras Ali Labs', 499.00, 4.9, 128, '👥'),
('Sage & Xero Accounting Sync', 'sage-xero-sync', 'integration', 'finance', 'Bi-directional financial sync with Xero and Sage Pastel Accounting.', 'Ras Ali Labs', 199.00, 4.8, 210, '💸'),
('Mari Executive Advisor Agent', 'mari-executive-agent', 'agent', 'ai', 'Autonomous CEO/CFO advisory agent for automated daily strategic intelligence.', 'Mari AI Core', 0.00, 5.0, 450, '🧠'),
('Government Case Workflow Template', 'gov-case-template', 'template', 'government', 'Pre-configured workflow and form templates for public sector citizen request processing.', 'Ras Ali Labs', 0.00, 4.9, 85, '🏛️')
ON CONFLICT (slug) DO NOTHING;
