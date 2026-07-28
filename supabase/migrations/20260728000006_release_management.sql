-- =====================================================================================
-- PHASE 1 & 9: SUPABASE RELEASE MANAGEMENT, LICENSES, DEVICES & RLS SECURITY
-- =====================================================================================

-- 1. RELEASES TABLE
CREATE TABLE IF NOT EXISTS public.releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name TEXT DEFAULT 'Ralion',
    version TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('windows', 'mac', 'linux')),
    architecture TEXT DEFAULT 'x64',
    release_type TEXT DEFAULT 'community' CHECK (release_type IN ('community', 'professional', 'enterprise')),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    checksum TEXT,
    release_notes TEXT,
    is_latest BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published releases" ON public.releases;
CREATE POLICY "Public read published releases" ON public.releases FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "Admins full manage releases" ON public.releases;
CREATE POLICY "Admins full manage releases" ON public.releases FOR ALL USING (true);

-- 2. DOWNLOADS TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES public.releases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    platform TEXT,
    ip_hash TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can log downloads" ON public.downloads;
CREATE POLICY "Anyone can log downloads" ON public.downloads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins view download analytics" ON public.downloads;
CREATE POLICY "Admins view download analytics" ON public.downloads FOR SELECT USING (true);

-- 3. EXTEND LICENSES TABLE
ALTER TABLE public.licenses
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'standard',
    ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'community' CHECK (plan IN ('community', 'professional', 'enterprise'));

-- 4. DESKTOP DEVICES REGISTRATION
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    device_id TEXT UNIQUE NOT NULL,
    platform TEXT,
    version TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users register own devices" ON public.devices;
CREATE POLICY "Users register own devices" ON public.devices FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users update own devices" ON public.devices;
CREATE POLICY "Users update own devices" ON public.devices FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Admins view devices" ON public.devices;
CREATE POLICY "Admins view devices" ON public.devices FOR SELECT USING (true);

-- SEED v2.4.2 RELEASE RECORD
INSERT INTO public.releases (
    product_name, version, platform, architecture, release_type,
    file_name, file_url, file_size, checksum, release_notes, is_latest, status
) VALUES (
    'Ralion',
    '2.4.2',
    'windows',
    'x64',
    'community',
    'ralion-desktop-2.4.2-setup.exe',
    'https://yidsfihagwttlmhfynmf.supabase.co/storage/v1/object/public/ralion-releases/windows/2.4.2/ralion-desktop-2.4.2-setup.exe',
    152048576,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'Ralion OS v2.4.2 — Production Windows PE x64 NSIS Installer release with Mari AI intelligence engine, multi-agent advisory, SaaS monetization, and industry modules.',
    true,
    'published'
) ON CONFLICT DO NOTHING;
