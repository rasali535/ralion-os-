# Ralion Platform — System Architecture & Design Specification

**Ras Ali Labs | Enterprise AI-Powered Business Operating System**

---

## 1. Overview

Ralion is an intelligent, multi-tenant Business Operating System designed to run operations, CRM, tasks, documents, workflows, billing, marketing, and industry-specific processes from a single ecosystem.

### Core Ecosystem Architecture
- **Web App**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion, Recharts.
- **Desktop App**: Electron & Electron Builder targeting Windows (`.exe`/`.msi`), macOS (`.dmg`), and Linux (`.AppImage`).
- **Database & Backend**: Firebase Cloud Firestore, Firebase Storage, Firebase Auth, and Firebase Cloud Functions (Node.js 20).
- **AI Core**: **Mari AI Assistant Platform** with RAG vector search, automated actions, content studio, and AI/ML API integration.

---

## 2. Multi-Tenant Database Schema

Firestore enforces multi-tenant boundary isolation at the top-level path:

```
/organizations/{orgId}
  ├── /users/{userId}
  ├── /branches/{branchId}
  ├── /roles/{roleId}
  ├── /contacts/{contactId}
  ├── /deals/{dealId}
  ├── /tasks/{taskId}
  ├── /events/{eventId}
  ├── /documents/{docId}
  ├── /workflows/{workflowId}
  ├── /invoices/{invoiceId}
  ├── /knowledge/{kbId}
  └── /industry/
        ├── /health_records/{recordId}
        ├── /funeral_cases/{caseId}
        ├── /logistics_shipments/{shipmentId}
        └── /trade_orders/{orderId}
```

---

## 3. Role-Based Access Control (RBAC)

1. **Platform Admin**: System administrators at Ras Ali Labs.
2. **Organization Owner**: Business owner with complete management capabilities.
3. **Manager**: Branch/team managers approving workflows and viewing reports.
4. **Employee**: Team members executing assigned module tasks.
5. **Custom Roles**: Organizations can define custom permission matrices.

---

## 4. Mari AI RAG Architecture

1. **Document Ingestion**: Enterprise documents and SOPs uploaded to `/organizations/{orgId}/knowledge`.
2. **Vector Chunking**: Cloud Function `processMariRagVector` splits text into 500-word chunks and indexes vectors.
3. **Query Engine**: Mari AI processes natural language queries ("Show sales this month", "Who has overdue payments?") and returns structured answers alongside actionable UI triggers.

---

## 5. Plugin Architecture for Industry Modules

Industry modules are modular plugins registered in `@ralion/modules`:
- **Ralion Health**: Clinical records, case notes, wellness assessments.
- **Ralion Funeral**: Funeral case files, casket inventory, hearse fleet dispatches.
- **Ralion Logistics**: Fleet shipments, driver dispatch, customs border clearance.
- **Ralion Trade**: B2B procurement marketplace, vendor catalogs, purchase orders.
