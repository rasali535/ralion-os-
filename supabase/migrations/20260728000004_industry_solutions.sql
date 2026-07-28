-- =====================================================================================
-- PHASE 6: INDUSTRY SOLUTIONS PLATFORM
-- Modules: Growth, Logistics, Health, Trade
-- =====================================================================================

-- =====================================================================================
-- MODULE 1: RALION GROWTH (Marketing & Social Media)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.growth_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'email')),
    media_urls TEXT[],
    hashtags TEXT[],
    campaign_id UUID,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'archived')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    engagement_likes INTEGER DEFAULT 0,
    engagement_comments INTEGER DEFAULT 0,
    engagement_shares INTEGER DEFAULT 0,
    engagement_reach INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_growth_content_updated_at BEFORE UPDATE ON growth_content FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.growth_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage growth content" ON public.growth_content FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

CREATE TABLE IF NOT EXISTS public.growth_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    objective TEXT,
    target_audience JSONB DEFAULT '{}',
    platforms TEXT[],
    start_date DATE,
    end_date DATE,
    budget NUMERIC(12,2),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_growth_campaigns_updated_at BEFORE UPDATE ON growth_campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.growth_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage campaigns" ON public.growth_campaigns FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- Add FK from growth_content to campaigns
ALTER TABLE public.growth_content ADD CONSTRAINT fk_growth_campaign FOREIGN KEY (campaign_id) REFERENCES public.growth_campaigns(id) ON DELETE SET NULL;

-- =====================================================================================
-- MODULE 2: RALION LOGISTICS (Fleet & Shipment Management)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.logistics_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    registration TEXT NOT NULL,
    make TEXT,
    model TEXT,
    year INTEGER,
    vehicle_type TEXT CHECK (vehicle_type IN ('truck', 'van', 'motorcycle', 'car', 'bus', 'other')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired', 'unavailable')),
    assigned_driver_id UUID,
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_logistics_vehicles_updated_at BEFORE UPDATE ON logistics_vehicles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.logistics_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage vehicles" ON public.logistics_vehicles FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

CREATE TABLE IF NOT EXISTS public.logistics_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    license_number TEXT,
    license_expiry DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'off_duty', 'suspended', 'terminated')),
    performance_rating NUMERIC(3,1),
    total_deliveries INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_logistics_drivers_updated_at BEFORE UPDATE ON logistics_drivers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.logistics_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage drivers" ON public.logistics_drivers FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- Add FK for vehicle driver
ALTER TABLE public.logistics_vehicles ADD CONSTRAINT fk_vehicle_driver FOREIGN KEY (assigned_driver_id) REFERENCES public.logistics_drivers(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.logistics_shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    tracking_number TEXT UNIQUE NOT NULL DEFAULT ('SHP-' || substring(uuid_generate_v4()::text, 1, 8)),
    customer_id UUID REFERENCES public.ralion_customers(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.logistics_vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.logistics_drivers(id) ON DELETE SET NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'collected', 'in_transit', 'at_customs', 'customs_cleared', 'delivered', 'completed', 'cancelled')),
    weight_kg NUMERIC(10,2),
    customs_cleared BOOLEAN DEFAULT false,
    documents JSONB DEFAULT '[]',
    estimated_delivery DATE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_logistics_shipments_updated_at BEFORE UPDATE ON logistics_shipments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.logistics_shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage shipments" ON public.logistics_shipments FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

CREATE TABLE IF NOT EXISTS public.logistics_tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES public.logistics_shipments(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    location TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.logistics_tracking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view tracking" ON public.logistics_tracking_events FOR ALL
    USING (shipment_id IN (SELECT id FROM public.logistics_shipments WHERE organization_id IN (SELECT get_user_organizations())));

-- =====================================================================================
-- MODULE 3: RALION HEALTH (Clinical & Wellness Management)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.health_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    intake_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged', 'referred')),
    assigned_professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_health_clients_updated_at BEFORE UPDATE ON health_clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.health_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Health professionals access org clients" ON public.health_clients FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

CREATE TABLE IF NOT EXISTS public.health_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.health_clients(id) ON DELETE CASCADE NOT NULL,
    professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    type TEXT DEFAULT 'session' CHECK (type IN ('intake', 'session', 'follow_up', 'group', 'assessment')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_health_appointments_updated_at BEFORE UPDATE ON health_appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.health_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org professionals manage appointments" ON public.health_appointments FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

CREATE TABLE IF NOT EXISTS public.health_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.health_clients(id) ON DELETE CASCADE NOT NULL,
    assigned_professional_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    presenting_issue TEXT,
    case_notes TEXT,
    progress TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'referred', 'on_hold')),
    opened_at DATE DEFAULT CURRENT_DATE,
    closed_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_health_cases_updated_at BEFORE UPDATE ON health_cases FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org professionals manage cases" ON public.health_cases FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

-- =====================================================================================
-- MODULE 4: RALION TRADE (Commerce & Procurement)
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.trade_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    country TEXT,
    category TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    rating NUMERIC(3,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_trade_suppliers_updated_at BEFORE UPDATE ON trade_suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.trade_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage suppliers" ON public.trade_suppliers FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

CREATE TABLE IF NOT EXISTS public.trade_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES public.trade_suppliers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    category TEXT,
    unit_price NUMERIC(12,2),
    currency TEXT DEFAULT 'BWP',
    unit TEXT DEFAULT 'unit',
    stock_quantity INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'out_of_stock')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_trade_products_updated_at BEFORE UPDATE ON trade_products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.trade_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage products" ON public.trade_products FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

CREATE TABLE IF NOT EXISTS public.trade_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES public.trade_suppliers(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE DEFAULT ('ORD-' || substring(uuid_generate_v4()::text, 1, 8)),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
    total_amount NUMERIC(14,2),
    currency TEXT DEFAULT 'BWP',
    notes TEXT,
    expected_delivery DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER update_trade_orders_updated_at BEFORE UPDATE ON trade_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
ALTER TABLE public.trade_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage orders" ON public.trade_orders FOR ALL USING (organization_id IN (SELECT get_user_organizations()));

CREATE TABLE IF NOT EXISTS public.trade_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.trade_orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.trade_products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.trade_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage order items" ON public.trade_order_items FOR ALL
    USING (order_id IN (SELECT id FROM public.trade_orders WHERE organization_id IN (SELECT get_user_organizations())));

-- =====================================================================================
-- DESKTOP EVENTS TRACKING
-- =====================================================================================
CREATE TABLE IF NOT EXISTS public.desktop_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('app_launched', 'login', 'logout', 'sync_completed', 'update_installed', 'license_activated', 'error')),
    app_version TEXT,
    platform TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.desktop_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System inserts desktop events" ON public.desktop_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Org members view their events" ON public.desktop_events FOR SELECT USING (organization_id IN (SELECT get_user_organizations()) OR user_id = auth.uid());
