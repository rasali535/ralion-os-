# DEPLOYMENT GUIDE (Supabase Core)

## Environment Configuration
Deploying the Ras Ali Labs Platform Core requires configuring environment variables for the frontend applications and Edge Functions.

### 1. Frontend Web App (`apps/web/.env.local`)
Ensure the following variables are set to connect to the Supabase instance:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yidsfihagwttlmhfynmf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4QwqM-obElPsgghW6r06ag_yfuIibbt
```

### 2. Edge Functions Deployment
The Supabase Deno Edge Functions handle billing, licenses, and AI integrations securely.
To deploy these functions to the live project:
```bash
npx supabase functions deploy --project-ref yidsfihagwttlmhfynmf
```

### 3. Edge Function Environment Variables
Edge Functions require specific environment variables (e.g., Stripe API keys, Gemini AI keys) that must be securely pushed to the Supabase environment:
```bash
npx supabase secrets set --project-ref yidsfihagwttlmhfynmf STRIPE_API_KEY=sk_live_...
npx supabase secrets set --project-ref yidsfihagwttlmhfynmf GEMINI_API_KEY=AIza...
```

## Storage Buckets Initialization
Ensure the storage buckets are manually created in the Supabase Dashboard, or pushed via seed migrations:
- `avatars` (Public visibility allowed)
- `organization-assets` (Restricted visibility)
- `documents` (Restricted visibility)
- `ai-knowledge` (Restricted visibility)
