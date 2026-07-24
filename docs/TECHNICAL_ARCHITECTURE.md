# Ralion Technical Architecture Document

**Ras Ali Labs | Building Intelligent Business Ecosystems**

---

## 1. System Architecture Overview

```
                      RALION PLATFORM
                            |
                 Firebase / GCP Core Backend
                            |
   +------------------------+------------------------+
   |                        |                        |
Auth Engine             Cloud Firestore            Cloud Storage
(Firebase Auth)       (Multi-Tenant Data)        (Document Vault)
   |                        |                        |
   +------------------------+------------------------+
                            |
                     Core Engine Layer
   +-------------------------------------------------+
   | CRM  • Tasks  • Calendar  • Docs  • Workflows   |
   +-------------------------------------------------+
                            |
                 Mari AI Intelligence Layer
   +-------------------------------------------------+
   | Natural Query Engine • RAG Vector Search • Actions |
   +-------------------------------------------------+
                            |
                   Plugin Module Layer
   +-------------------------------------------------+
   | Growth  • Health  • Funeral  • Logistics • Trade |
   +-------------------------------------------------+
                            |
                   Client Delivery Apps
   +-------------------------------------------------+
   | Web (Next.js 15) • Desktop (Electron Windows/Mac)|
   +-------------------------------------------------+
```

---

## 2. Multi-Tenant Database Architecture

The core data schema provides hard isolation per organization tenant at `/organizations/{orgId}`.

### Core Schemas (`packages/database/src/schema.ts`)

```
users
  - uid: string
  - email: string
  - orgId: string
  - role: 'PLATFORM_ADMIN' | 'ORGANIZATION_OWNER' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOM'
  - branchId: string

organizations
  - id: string
  - name: string
  - licenseTier: 'COMMUNITY' | 'PROFESSIONAL' | 'ENTERPRISE'
  - enabledModules: string[]

branches
  - id: string
  - name: string
  - code: string
  - isMain: boolean

contacts (CRM)
  - id: string
  - orgId: string
  - name: string
  - type: 'LEAD' | 'CUSTOMER' | 'SUPPLIER' | 'PARTNER'
  - stage: 'LEAD' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST'
  - dealValue: number

tasks
  - id: string
  - orgId: string
  - title: string
  - status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED'
  - priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

events (Calendar)
  - id: string
  - startTime: string
  - endTime: string
  - category: 'MEETING' | 'APPOINTMENT' | 'REMINDER' | 'DISPATCH'

documents
  - id: string
  - fileUrl: string
  - vectorIndexed: boolean

workflows
  - id: string
  - trigger: { event: string }
  - actions: Array<{ type: string, payload: any }>

invoices
  - id: string
  - total: number
  - status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'
```

---

### Industry Extension Schema Patterns

Industry plugins extend the core schema without altering core tables:

#### Healthcare Extension (Ralion Health)
```
/organizations/{orgId}/industry/health_records/{recordId}
  - patientName: string
  - caseNotes: string
  - assessmentSummary: string
  - nextAppointment: string
```

#### Funeral Extension (Ralion Funeral)
```
/organizations/{orgId}/industry/funeral_cases/{caseId}
  - caseNumber: string
  - deceasedName: string
  - casketSelected: string
  - hearseAssigned: string
```

#### Logistics Extension (Ralion Logistics)
```
/organizations/{orgId}/industry/logistics_shipments/{shipmentId}
  - trackingNumber: string
  - origin: string
  - destination: string
  - customsCleared: boolean
```

#### Trade Extension (Ralion Trade)
```
/organizations/{orgId}/industry/trade_orders/{orderId}
  - orderNumber: string
  - supplierName: string
  - totalAmount: number
```

---

## 3. Mari AI Intelligence Architecture

1. **RAG Vector Search**: Documents uploaded to `/organizations/{orgId}/knowledge` are chunked into 500-word segments and indexed.
2. **AI/ML API Engine**: Integrates with `https://api.aimlapi.com/chat/completions` using key `37d9bb3553feb58ff0ec6ed0b8e86975` with local rule fallback.
3. **Mari Action Drivers**: Handlers normalize `action.data` and `action.payload` to trigger automated task creation, email drafting, report generation, and router navigation.

---

## 4. Electron Desktop Architecture & Security

- **Process Isolation**: Main process (`apps/desktop/src/main.ts`) runs in sandboxed context with IPC bridge (`preload.ts`).
- **Device Activation**: Validates hardware serial hash for active seat validation.
- **Offline Grace Engine**: Supports up to 7 days of offline operations with local cache before requiring Mari sync.
