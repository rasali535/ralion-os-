-- =====================================================================================
-- RALION CORE PLATFORM - PHASE 2 MIGRATION
-- =====================================================================================

-- =====================================================================================
-- 1. CRM: CUSTOMER MANAGEMENT
-- =====================================================================================
CREATE TABLE public.ralion_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    category TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_ralion_customers_updated_at BEFORE UPDATE ON ralion_customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.ralion_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org customers" ON public.ralion_customers FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 2. LEAD MANAGEMENT
-- =====================================================================================
CREATE TABLE public.ralion_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT,
    status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    assigned_user UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ralion_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org leads" ON public.ralion_leads FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 3. PROJECT MANAGEMENT
-- =====================================================================================
CREATE TABLE public.ralion_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Planning' CHECK (status IN ('Planning', 'Active', 'On Hold', 'Completed')),
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ralion_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org projects" ON public.ralion_projects FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 4. TASK MANAGEMENT
-- =====================================================================================
CREATE TABLE public.ralion_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.ralion_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    due_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ralion_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org tasks" ON public.ralion_tasks FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 5. CALENDAR SYSTEM
-- =====================================================================================
CREATE TABLE public.ralion_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT DEFAULT 'Meeting' CHECK (type IN ('Meeting', 'Appointment', 'Reminder', 'Task')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ralion_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org events" ON public.ralion_events FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 6. DOCUMENT MANAGEMENT
-- =====================================================================================
CREATE TABLE public.ralion_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    category TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ralion_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage org documents" ON public.ralion_documents FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- 7. AUDIT LOGGING TRIGGERS
-- =====================================================================================
-- Function to genericly log to audit_logs
CREATE OR REPLACE FUNCTION public.log_ralion_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (organization_id, user_id, action, module, metadata)
    VALUES (
        NEW.organization_id,
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        jsonb_build_object('record_id', NEW.id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit triggers for Customers
CREATE TRIGGER audit_customers_insert AFTER INSERT ON public.ralion_customers FOR EACH ROW EXECUTE PROCEDURE public.log_ralion_audit();
CREATE TRIGGER audit_customers_update AFTER UPDATE ON public.ralion_customers FOR EACH ROW EXECUTE PROCEDURE public.log_ralion_audit();
CREATE TRIGGER audit_customers_delete AFTER DELETE ON public.ralion_customers FOR EACH ROW EXECUTE PROCEDURE public.log_ralion_audit();

-- Audit triggers for Documents
CREATE TRIGGER audit_documents_insert AFTER INSERT ON public.ralion_documents FOR EACH ROW EXECUTE PROCEDURE public.log_ralion_audit();
CREATE TRIGGER audit_documents_delete AFTER DELETE ON public.ralion_documents FOR EACH ROW EXECUTE PROCEDURE public.log_ralion_audit();
