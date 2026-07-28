# DATABASE ARCHITECTURE (Supabase Core)

## Overview
This architecture establishes the foundational PostgreSQL schema for Ras Ali Labs Platform Core on Supabase, prioritizing strict multi-tenancy, Role-Based Access Control (RBAC), and scalable product licensing.

## Key Schemas & Tables

### 1. User Management & Profiles
- **`auth.users`**: Managed by Supabase Auth.
- **`profiles`**: Tied 1:1 with `auth.users`. Contains user details (name, avatar, timezone, etc). Created automatically via database triggers on user signup.

### 2. Organization System (Multi-Tenancy)
- **`organizations`**: Represents customer tenants (e.g., Pameltex, Doves Funeral).
- **`organization_members`**: Link table mapping `profiles` to `organizations` with a specific `role_id`. Ensures users can belong to multiple workspaces with varying permissions.

### 3. Role-Based Access Control (RBAC)
- **`roles`**: Defines sets of permissions. Can be global (NULL `organization_id`) or custom per-organization. Default roles include Owner, Administrator, Manager, Staff, Viewer.
- **`permissions`**: Granular access definitions (e.g., `customers.view`, `documents.upload`).
- **`role_permissions`**: Maps permissions to roles.

### 4. Product Ecosystem & Licensing
- **`products`**: Central registry for all Ras Ali Labs products (e.g., Ralion, Mari AI).
- **`user_products`**: Controls product enablement for specific users within an organization context.
- **`licenses`**: Tracks product licensing, keys, and expiration per organization.
- **`registered_devices`**: Maps device footprints (Desktop, Web, etc.) to valid licenses for activation tracking.

### 5. Billing System
- **`subscription_plans`**: Available tiers (Community, Professional, Enterprise) and feature flags.
- **`subscriptions`**: Active subscriptions binding an organization to a plan with billing cycles.

### 6. Audit & Notification
- **`audit_logs`**: Immutable tracking of critical actions (login, data updates, permission changes).
- **`notifications`**: System, AI, or business alerts scoped to individual users.

## Functions
- `get_user_organizations()`: Returns UUIDs of all orgs the caller belongs to.
- `has_permission(permission_name)`: Verifies if the caller has a specific permission in their active context.
- `has_product_access(product_slug)`: Verifies if a product is enabled for the caller.
