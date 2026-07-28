-- =====================================================================================
-- PHASE 4: SAAS PLATFORM, LICENSING & MONETIZATION
-- Extends the existing billing foundation (migration 000000)
-- =====================================================================================

-- =====================================================================================
-- 1. EXTEND subscription_plans WITH COMMERCIAL FIELDS
-- =====================================================================================
ALTER TABLE public.subscription_plans
    ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BWP',
    ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- =====================================================================================
-- 2. EXTEND subscriptions WITH TRIAL & EDITION FIELDS
-- =====================================================================================
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS edition TEXT DEFAULT 'community' CHECK (edition IN ('community', 'professional', 'enterprise')),
    ADD COLUMN IF NOT EXISTS trial_start DATE,
    ADD COLUMN IF NOT EXISTS trial_end DATE,
    ADD COLUMN IF NOT EXISTS subscription_start DATE,
    ADD COLUMN IF NOT EXISTS subscription_end DATE,
    ADD COLUMN IF NOT EXISTS payment_provider TEXT,
    ADD COLUMN IF NOT EXISTS external_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- =====================================================================================
-- 3. EXTEND registered_devices
-- =====================================================================================
ALTER TABLE public.registered_devices
    ADD COLUMN IF NOT EXISTS device_id TEXT,
    ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =====================================================================================
-- 4. FEATURE FLAGS REGISTRY
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    module TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view features" ON public.features FOR SELECT USING (true);

-- =====================================================================================
-- 5. PLAN FEATURES (which plans unlock which features)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.plan_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE NOT NULL,
    feature_id UUID REFERENCES public.features(id) ON DELETE CASCADE NOT NULL,
    limit_value INTEGER DEFAULT -1, -- -1 = unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(plan_id, feature_id)
);
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view plan features" ON public.plan_features FOR SELECT USING (true);

-- =====================================================================================
-- 6. USAGE METRICS
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    metric_name TEXT NOT NULL,
    value BIGINT DEFAULT 0,
    period TEXT NOT NULL, -- e.g. '2026-07'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, metric_name, period)
);
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view usage metrics" ON public.usage_metrics FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 7. PAYMENTS TABLE (provider-agnostic)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'BWP',
    payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'paypal', 'orange_money', 'mascom_myzaka', 'bnb', 'manual')),
    transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    metadata JSONB DEFAULT '{}',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view payments" ON public.payments FOR SELECT USING (organization_id IN (SELECT get_user_organizations()));
CREATE POLICY "System inserts payments" ON public.payments FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 8. MODULE MARKETPLACE
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    version TEXT DEFAULT '1.0.0',
    icon TEXT,
    category TEXT DEFAULT 'industry',
    required_edition TEXT DEFAULT 'professional' CHECK (required_edition IN ('community', 'professional', 'enterprise')),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'beta', 'coming_soon', 'deprecated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.organization_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    activated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
    UNIQUE(organization_id, module_id)
);
ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view their modules" ON public.organization_modules FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 9. DOWNLOAD RELEASES (Desktop App Center)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.download_releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    version TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('windows', 'macos', 'linux')),
    download_url TEXT NOT NULL,
    file_size_mb NUMERIC(10,2),
    checksum TEXT,
    release_notes TEXT,
    is_latest BOOLEAN DEFAULT false,
    released_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, version, platform)
);
ALTER TABLE public.download_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view download releases" ON public.download_releases FOR SELECT USING (true);

-- =====================================================================================
-- 10. SEED: FEATURE FLAGS
-- =====================================================================================
INSERT INTO public.features (name, slug, module, description) VALUES
('Customer Management', 'crm', 'customers', 'Core CRM and customer management'),
('Lead Pipeline', 'leads', 'leads', 'Kanban lead pipeline and sales tracking'),
('Task Management', 'tasks', 'tasks', 'Task boards and project tracking'),
('Calendar & Scheduling', 'calendar', 'calendar', 'Business calendar and appointments'),
('Document Storage', 'documents', 'documents', 'Document upload and management'),
('Basic Reports', 'basic_reports', 'reports', 'Standard business reporting'),
('Advanced Reports', 'advanced_reports', 'reports', 'AI-powered analytics and custom reports'),
('Mari AI (Limited)', 'mari_ai_limited', 'ai', 'Mari AI with 100 queries/month'),
('Mari AI (Unlimited)', 'mari_ai_unlimited', 'ai', 'Unlimited Mari AI queries + agents'),
('Automation Workflows', 'automation', 'automation', 'No-code workflow automation engine'),
('API Access', 'api_access', 'api', 'REST API access for integrations'),
('Custom Modules', 'custom_modules', 'modules', 'Industry-specific plugin modules'),
('Advanced Permissions', 'advanced_permissions', 'settings', 'Fine-grained role & permission control'),
('Dedicated Support', 'dedicated_support', 'support', 'Priority 24/7 support and SLA')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================================
-- 11. SEED: UPDATE SUBSCRIPTION PLANS WITH SLUGS & LIMITS
-- =====================================================================================
UPDATE public.subscription_plans SET
    slug = 'community',
    currency = 'BWP',
    trial_days = 0,
    limits = '{"max_users": 3, "max_storage_gb": 1, "max_ai_requests_monthly": 100, "max_documents": 50}'::jsonb
WHERE name = 'Community';

UPDATE public.subscription_plans SET
    slug = 'professional',
    currency = 'BWP',
    trial_days = 14,
    limits = '{"max_users": -1, "max_storage_gb": 100, "max_ai_requests_monthly": 5000, "max_documents": -1}'::jsonb
WHERE name = 'Professional';

UPDATE public.subscription_plans SET
    slug = 'enterprise',
    currency = 'BWP',
    trial_days = 30,
    limits = '{"max_users": -1, "max_storage_gb": -1, "max_ai_requests_monthly": -1, "max_documents": -1}'::jsonb
WHERE name = 'Enterprise';

-- =====================================================================================
-- 12. SEED: PLAN FEATURES MAPPING
-- =====================================================================================
DO $$
DECLARE
    v_community_id UUID;
    v_professional_id UUID;
    v_enterprise_id UUID;
BEGIN
    SELECT id INTO v_community_id FROM public.subscription_plans WHERE slug = 'community' LIMIT 1;
    SELECT id INTO v_professional_id FROM public.subscription_plans WHERE slug = 'professional' LIMIT 1;
    SELECT id INTO v_enterprise_id FROM public.subscription_plans WHERE slug = 'enterprise' LIMIT 1;

    -- Community features
    INSERT INTO public.plan_features (plan_id, feature_id, limit_value)
    SELECT v_community_id, id, CASE slug
        WHEN 'mari_ai_limited' THEN 100
        WHEN 'max_documents' THEN 50
        ELSE -1 END
    FROM public.features
    WHERE slug IN ('crm', 'leads', 'tasks', 'calendar', 'documents', 'basic_reports', 'mari_ai_limited')
    ON CONFLICT DO NOTHING;

    -- Professional features (everything community + more)
    INSERT INTO public.plan_features (plan_id, feature_id, limit_value)
    SELECT v_professional_id, id, -1
    FROM public.features
    WHERE slug IN ('crm', 'leads', 'tasks', 'calendar', 'documents', 'basic_reports',
                   'advanced_reports', 'mari_ai_unlimited', 'automation', 'advanced_permissions')
    ON CONFLICT DO NOTHING;

    -- Enterprise features (everything)
    INSERT INTO public.plan_features (plan_id, feature_id, limit_value)
    SELECT v_enterprise_id, id, -1
    FROM public.features
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================================================
-- 13. SEED: MODULE MARKETPLACE
-- =====================================================================================
INSERT INTO public.modules (name, slug, description, icon, category, required_edition, status) VALUES
('Ralion Core', 'ralion-core', 'Core business OS modules — CRM, Tasks, Calendar, Documents', '🏢', 'core', 'community', 'available'),
('Ralion Health', 'ralion-health', 'Healthcare clinic and patient management system', '🏥', 'industry', 'professional', 'available'),
('Ralion Funeral', 'ralion-funeral', 'Funeral parlour operations and case management', '⚜️', 'industry', 'professional', 'available'),
('Ralion Logistics', 'ralion-logistics', 'Fleet, customs, and shipment management', '🚛', 'industry', 'professional', 'available'),
('Ralion Trade', 'ralion-trade', 'B2B trade, wholesale, and procurement platform', '📦', 'industry', 'professional', 'available'),
('Ralion Growth', 'ralion-growth', 'AI-powered marketing, social media, and growth tools', '📈', 'marketing', 'professional', 'available')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================================
-- 14. HELPER: Check if org has feature access
-- =====================================================================================
CREATE OR REPLACE FUNCTION public.org_has_feature(p_org_id UUID, p_feature_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.subscriptions s
        JOIN public.plan_features pf ON s.plan_id = pf.plan_id
        JOIN public.features f ON pf.feature_id = f.id
        WHERE s.organization_id = p_org_id
          AND s.status IN ('active', 'trialing')
          AND f.slug = p_feature_slug
    ) INTO has_access;
    RETURN COALESCE(has_access, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- 15. HELPER: Get org subscription edition
-- =====================================================================================
CREATE OR REPLACE FUNCTION public.get_org_edition(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_edition TEXT;
BEGIN
    SELECT COALESCE(s.edition, 'community')
    INTO v_edition
    FROM public.subscriptions s
    WHERE s.organization_id = p_org_id
      AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
    RETURN COALESCE(v_edition, 'community');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
