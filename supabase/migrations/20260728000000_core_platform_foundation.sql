-- =====================================================================================
-- RAS ALI LABS PLATFORM CORE - FOUNDATIONAL MIGRATION
-- =====================================================================================
-- This migration script establishes the core Supabase schema including:
-- 1. Profiles & Users
-- 2. Organizations & Members
-- 3. RBAC (Roles, Permissions)
-- 4. Products ecosystem
-- 5. Billing (Subscriptions)
-- 6. Licensing & Devices
-- 7. Audit & Notifications
-- 8. RLS Policies
-- 9. Utility Functions
-- =====================================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- PHASE 1: USER MANAGEMENT FOUNDATION
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    country TEXT,
    timezone TEXT,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to create profile after user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
    ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================================================
-- PHASE 2: ORGANIZATION SYSTEM
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    industry TEXT,
    company_size TEXT,
    country TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE
    ON organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role_id UUID, -- References roles(id) later
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, user_id)
);

-- =====================================================================================
-- PHASE 3: ROLE BASED ACCESS CONTROL (RBAC)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- NULL means global/default role
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.organization_members 
    ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    module TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(role_id, permission_id)
);

-- =====================================================================================
-- PHASE 4: PRODUCT Ecosystem Management
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id, organization_id)
);

-- =====================================================================================
-- PHASE 5: BILLING FOUNDATION
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'once')),
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- PHASE 6: LICENSING SYSTEM
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    license_key TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.registered_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE NOT NULL,
    device_name TEXT NOT NULL,
    device_identifier TEXT NOT NULL UNIQUE,
    platform TEXT CHECK (platform IN ('Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Web')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- PHASE 8: AUDIT SYSTEM
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- PHASE 9: NOTIFICATION SYSTEM
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'system',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================================
-- PHASE 11: DATABASE FUNCTIONS
-- =====================================================================================
-- Get User Organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY 
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permission Check
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_members om
        JOIN public.role_permissions rp ON om.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE om.user_id = auth.uid() AND p.name = permission_name
    ) INTO has_perm;
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Product Access Check
CREATE OR REPLACE FUNCTION public.has_product_access(p_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_products up
        JOIN public.products p ON up.product_id = p.id
        WHERE up.user_id = auth.uid() AND p.slug = p_slug AND up.status = 'active'
    ) INTO has_access;
    RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================================
-- PHASE 10: ROW LEVEL SECURITY (RLS)
-- =====================================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registered_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Organizations: Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON public.organizations FOR SELECT 
    USING (id IN (SELECT get_user_organizations()));

-- Organization Members: Users can view members of their organizations
CREATE POLICY "Users can view members of their organizations" ON public.organization_members FOR SELECT
    USING (organization_id IN (SELECT get_user_organizations()));

-- Roles & Permissions: Read access for authenticated users (or scoped by organization)
CREATE POLICY "Anyone can view global and org roles" ON public.roles FOR SELECT 
    USING (organization_id IS NULL OR organization_id IN (SELECT get_user_organizations()));

CREATE POLICY "Anyone can view permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Anyone can view role permissions" ON public.role_permissions FOR SELECT USING (true);

-- Products & Subscriptions: Read access
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Users can view their product access" ON public.user_products FOR SELECT 
    USING (user_id = auth.uid() OR organization_id IN (SELECT get_user_organizations()));

CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Users can view org subscriptions" ON public.subscriptions FOR SELECT 
    USING (organization_id IN (SELECT get_user_organizations()));

-- Licenses
CREATE POLICY "Users can view org licenses" ON public.licenses FOR SELECT 
    USING (organization_id IN (SELECT get_user_organizations()));

-- Audit Logs
CREATE POLICY "Users can view org audit logs" ON public.audit_logs FOR SELECT 
    USING (organization_id IN (SELECT get_user_organizations()));
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT 
    WITH CHECK (organization_id IN (SELECT get_user_organizations()) OR user_id = auth.uid());

-- Notifications
CREATE POLICY "Users can view and manage their notifications" ON public.notifications FOR ALL 
    USING (user_id = auth.uid());

-- =====================================================================================
-- PHASE 7: SEED DATA
-- =====================================================================================
-- Seed Products
INSERT INTO public.products (name, slug, description) VALUES
('Ralion', 'ralion', 'Ralion Business Operating System'),
('Mari AI', 'mari-ai', 'Mari Enterprise AI Assistant'),
('TradeGrid Africa', 'tradegrid-africa', 'B2B Trade and Logistics platform'),
('DFS Platform', 'dfs-platform', 'Doves Funeral System Platform')
ON CONFLICT (slug) DO NOTHING;

-- Seed Default Roles
INSERT INTO public.roles (name, description, organization_id) VALUES
('Owner', 'Full access to all organization settings and data', NULL),
('Administrator', 'Manage users and settings', NULL),
('Manager', 'Manage day-to-day operations', NULL),
('Staff', 'Standard access to assigned resources', NULL),
('Viewer', 'Read-only access', NULL);

-- Seed Subscription Plans
INSERT INTO public.subscription_plans (name, description, price, billing_cycle, features) VALUES
('Community', 'Free tier for small teams', 0, 'monthly', '{"max_users": 5, "features": ["core"]}'::jsonb),
('Professional', 'For growing businesses', 999, 'monthly', '{"max_users": 50, "features": ["core", "ai", "advanced_reporting"]}'::jsonb),
('Enterprise', 'Custom solutions for large organizations', 2500, 'monthly', '{"max_users": -1, "features": ["all", "dedicated_support"]}'::jsonb);

-- Seed Permissions
INSERT INTO public.permissions (name, module, description) VALUES
('customers.view', 'customers', 'View customer details'),
('customers.create', 'customers', 'Create new customers'),
('customers.edit', 'customers', 'Edit customer details'),
('documents.upload', 'documents', 'Upload documents to knowledge base'),
('reports.view', 'reports', 'View analytics and reports'),
('users.manage', 'settings', 'Manage organization users and roles')
ON CONFLICT (name) DO NOTHING;
