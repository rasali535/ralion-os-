# Ralion Product Blueprint (PRD)

**Brand Statement**: *Ras Ali Labs | Ralion — Empowered to Prosper (Powered by Mari AI)*

---

## 1. Product Overview

- **Product Name**: Ralion Platform
- **Tagline**: Empowered to Prosper
- **Company**: Ras Ali Labs
- **Mission**: An AI-powered modular business operating system that empowers organizations with intelligence, automation, insights, and growth capabilities. Software that gives people and organizations the power to succeed.

---

## 2. Core Strategic Philosophy: Engine First, Modules Second

Ralion is not built as disconnected monolithic applications. 

It is built as an **extensible platform engine**:
1. **Ralion Core Engine**: Unified Auth, Multi-Tenant Hierarchy, RBAC Permissions, Dashboard Engine, CRM Engine, Task Engine, Calendar Engine, Document Engine, Visual Workflows, Subscriptions & Invoicing.
2. **Mari AI Engine**: Intelligence layer integrated across every module (Conversational AI, RAG Knowledge vectors, Mari Actions).
3. **Module Plugins**: Industry solutions built on top of the core engine (Ralion Health, Ralion Funeral, Ralion Logistics, Ralion Trade, Ralion Growth).

---

## 3. Ralion MVP v1 Scope & Boundaries

### Core Platform MVP Features

#### A. Authentication & Tenant Identity
- Email/Password and Google OAuth.
- Password reset workflows.
- Organization accounts with multi-tenant isolation (`organizations/{orgId}`).

#### B. Organization & Branch Hierarchy
- Hierarchy: `Organization` → `Branches` → `Users` → `Roles` → `Permissions`.
- Support for multi-branch organizations (e.g., Gaborone, Francistown, Mahalapye).

#### C. User & Permission Matrix (RBAC)
- Built-in Roles: `Owner`, `Admin`, `Manager`, `Staff`, `Viewer`.
- Custom Roles capability for enterprise tenants.

#### D. Dynamic Dashboard Engine
- Executive command center (CEO, Operations, Marketing views).
- KPI metric widgets (Revenue, Customers, Pending Tasks, Mari AI Insights).

#### E. Universal CRM Engine
- Contacts & Companies directory (Leads, Customers, Suppliers, Partners).
- Drag-and-drop Sales Pipeline board with stage probabilities.
- Activity Timeline (Calls, Emails, Notes, Purchases).

#### F. Task & Project Engine
- Project task tracking (Kanban board, List view, Calendar view).
- Priorities (`URGENT`, `HIGH`, `MEDIUM`, `LOW`) and status columns.

#### G. Universal Calendar Engine
- Cross-module event scheduler (Client Meetings, Clinical Intakes, Fleet Dispatches).

#### H. Document Management Engine
- Secure file storage, folder hierarchy, PDF document generation, Mari AI RAG vector indexing indicators.

#### I. Visual Workflows Engine
- Visual no-code automation builder (`Trigger: New Customer` → `Action: Send Email`, `Create Task`, `Notify Manager`).

---

## 4. Product Naming & Taglines

| Product Module | Tagline & Positioning |
| :--- | :--- |
| **Ralion Business** | *Empowered to Prosper — Run your business smarter.* |
| **Ralion Growth** | *Empowered to Prosper — Create. Connect. Convert.* |
| **Ralion Health** | *Empowered to Prosper — Better care through intelligent technology.* |
| **Ralion Logistics** | *Empowered to Prosper — Move business forward.* |
| **Ralion Funeral** | *Empowered to Prosper — Supporting families with dignity and efficiency.* |
| **Ralion Trade** | *Empowered to Prosper — Connecting opportunities and markets.* |

---

## 5. Commercial & Community Strategy

### Tier Structure
1. **Community Edition (Free)**: Up to 5 users, basic CRM & Tasks, 100 Mari AI credits/month.
2. **Professional Edition (Paid)**: Up to 25 users, unlimited workflows, 2,500 Mari AI credits/month, industry plugin access.
3. **Enterprise Edition (Custom)**: Unlimited branches & users, white-label branding, dedicated Mari RAG vectors.
