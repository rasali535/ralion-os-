# MIGRATION GUIDE: Firebase to Supabase Core

This guide outlines the process of migrating the existing Ras Ali Labs `ralion-os` project from Firebase Data Connect / Firebase Auth to the new Supabase Platform Core.

## 1. Database Migration
All required PostgreSQL tables, RLS policies, and triggers are consolidated into a single foundational migration file:
`supabase/migrations/20260728000000_core_platform_foundation.sql`

To apply this to your linked Supabase project:
```bash
npx supabase link --project-ref yidsfihagwttlmhfynmf
# Enter your database password when prompted
npx supabase db push
```

## 2. Authentication Migration (Frontend)
Firebase Auth has been deprecated. The Next.js frontend must be updated to use `@supabase/ssr` for authentication.
- Remove all `firebase/auth` imports.
- Replace `firebaseConfig` with Supabase Client initialization (`createBrowserClient` / `createServerClient`).

## 3. Data Connect Teardown
- The `dataconnect/` folder and `firebase/` folder have been safely removed.
- Any frontend components querying `getFirebaseApp()` or using `@dataconnect/generated` must be updated to use standard Supabase SQL queries or PostgREST via the Supabase JS client.

## 4. Supabase Type Generation
After pushing the migration to Supabase, generate TypeScript definitions to ensure type safety across the frontend:
```bash
npx supabase gen types typescript --project-id yidsfihagwttlmhfynmf > apps/web/src/types/supabase.ts
```
