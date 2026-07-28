# SECURITY RULES (Supabase RLS)

## Core Philosophy
Every table in the Ras Ali Labs Platform Core utilizes PostgreSQL Row Level Security (RLS) to enforce strict multi-tenant isolation. Under no circumstances can data from Organization A bleed into Organization B.

## Storage Buckets Security
Four primary storage buckets are configured with the following path structures and RLS policies:

1. **`avatars`** -> `users/{user_id}/` (Users can read all, update their own)
2. **`organization-assets`** -> `organizations/{organization_id}/` (Org members only)
3. **`documents`** -> `organizations/{organization_id}/documents/` (Org members only)
4. **`ai-knowledge`** -> `organizations/{organization_id}/knowledge/` (Org members only)

## RLS Policy Breakdown

### Users & Profiles
- **Policy:** Users can only view and edit their own `profiles` row (`auth.uid() = id`).
- **Trigger Security:** System-level triggers execute with `SECURITY DEFINER` privileges to safely map `auth.users` to `profiles` without opening table access.

### Multi-Tenancy (Organizations)
- **Policy:** Read access to `organizations` and `organization_members` is restricted to rows where the user is an active member, evaluated via `get_user_organizations()`.

### Licensing & Billing
- **Policy:** `licenses`, `subscriptions`, and `audit_logs` are strictly isolated by `organization_id`.
- **Policy:** Product and Subscription Plan definitions (`products`, `subscription_plans`) are universally readable by authenticated users for pricing and feature display.

### Action Isolation (Auditing)
- **Policy:** Users can read `audit_logs` for their organization. The system (via Edge Functions) can insert logs for any organization. Users can only insert logs tied to their own `user_id`.
