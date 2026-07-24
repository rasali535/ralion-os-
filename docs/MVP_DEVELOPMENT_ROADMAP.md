# Ralion MVP Development Roadmap

**Ras Ali Labs | Empowered to Prosper**

---

## 1. Development Sequence Strategy

The fundamental rule of the Ralion strategy: **Don't build applications. Build the Ralion engine, then release applications as modules.**

---

## 2. Phase Breakdown & Build Prompts

### Build Prompt 1: Ralion Foundation & Engine
- Monorepo setup (`@ralion/ui`, `@ralion/auth`, `@ralion/database`, `@ralion/core`, `@ralion/ai`, `@ralion/modules`).
- Multi-tenant Firebase setup (`ralion-os` #1001961763703) and Google Cloud SQL (`us-east4`).
- Multi-branch organization hierarchy and RBAC roles (`Owner`, `Admin`, `Manager`, `Staff`, `Viewer`).
- Executive Dashboard Engine (CEO, Operations, Marketing views).

### Build Prompt 2: Universal CRM & Operations
- Contacts directory (Leads, Customers, Suppliers, Partners).
- Drag-and-drop Sales Pipeline board with stage win probabilities.
- Task management (Kanban & List views), Universal Calendar, Document Storage, Visual Workflows.

### Build Prompt 3: Mari AI Platform
- Mari AI Assistant Workspace (`/mari-ai`).
- RAG Knowledge Base Vector Search Engine (`/mari-ai/knowledge`).
- AI/ML API Key (`37d9bb3553feb58ff0ec6ed0b8e86975`) integration.
- Mari Action Execution Drivers (Create Task, Draft Email, Export PDF Report, Navigate).

### Build Prompt 4: Desktop Application
- Electron wrapper targeting Windows (`.exe`/`.msi`), macOS (`.dmg`), and Linux (`.AppImage`).
- Hardware device hash activation and 7-day offline grace period.

### Build Prompt 5: First Client Industry Module — Ralion Health (Pameltex Case Study)
- **Target Client**: Pameltex Healthcare.
- Clinical patient intake records, case notes, wellness assessments, appointment schedules.
- Real client testing, feedback, and live case study validation.

---

## 3. Demo Showcase Environment ("Ralion Demo Enterprise")

Pre-configured showcase environment for potential clients and investors:
- **Organization**: Ralion Demo Enterprise
- **Sample Data**: 4 Sales Deals ($142.5k pipeline), 4 Active Tasks, 4 Scheduled Events, 4 Knowledge Documents, and 4 Industry Plugins.

---

## 4. Community Edition & Commercial Growth Roadmap

1. **Community Edition Release**: Free downloadable desktop app & web sign up at `rasalilabs.com`.
2. **Professional Edition**: Paid SaaS tier for growing SMBs requiring workflow automation and AI credits.
3. **Enterprise Edition**: Custom multi-branch deployment for large corporations, healthcare facilities, and logistics fleets.
