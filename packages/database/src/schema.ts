import { LicenseTier, UserRole } from '@ralion/auth';

// Multi-tenant Base Item
export interface TenantBaseDocument {
  id: string;
  orgId: string;
  branchId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// CRM Contact
export interface Contact extends TenantBaseDocument {
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  type: 'LEAD' | 'CUSTOMER' | 'SUPPLIER' | 'PARTNER';
  status: 'ACTIVE' | 'PROSPECT' | 'ARCHIVED';
  address?: string;
  tags: string[];
  notes?: string;
  assignedTo?: string;
}

// CRM Activity Timeline Item
export interface TimelineActivity extends TenantBaseDocument {
  contactId: string;
  activityType: 'NOTE' | 'CALL' | 'EMAIL' | 'APPOINTMENT' | 'TASK' | 'PURCHASE';
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

// CRM Sales Deal / Pipeline Stage
export type DealStage = 'LEAD' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface SalesDeal extends TenantBaseDocument {
  title: string;
  contactId: string;
  contactName: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number; // 0 to 100
  expectedCloseDate: string;
  assignedTo: string;
  notes?: string;
}

// Task & Project Management
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';

export interface Project extends TenantBaseDocument {
  name: string;
  description: string;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  dueDate?: string;
  members: string[];
}

export interface TaskItem extends TenantBaseDocument {
  title: string;
  description?: string;
  projectId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string;
  tags: string[];
  attachments?: string[];
  commentsCount: number;
}

// Calendar Events
export interface CalendarEvent extends TenantBaseDocument {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location?: string;
  category: 'MEETING' | 'APPOINTMENT' | 'TASK' | 'REMINDER' | 'PERSONAL';
  attendees: string[];
  recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

// Document Management
export interface DocumentFile extends TenantBaseDocument {
  name: string;
  folderId?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  version: number;
  tags: string[];
  sharedWithRoles: UserRole[];
}

// Visual No-Code Workflow Engine
export interface WorkflowRule extends TenantBaseDocument {
  name: string;
  description: string;
  isActive: boolean;
  trigger: {
    event: 'NEW_CUSTOMER' | 'DEAL_WON' | 'TASK_OVERDUE' | 'INVOICE_CREATED';
    conditions?: Record<string, any>;
  };
  actions: Array<{
    type: 'SEND_EMAIL' | 'CREATE_TASK' | 'NOTIFY_USER' | 'GENERATE_DOC';
    payload: Record<string, any>;
  }>;
  executionCount: number;
}

// Billing & Invoicing
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice extends TenantBaseDocument {
  invoiceNumber: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paidAt?: string;
}

// Mari AI RAG Knowledge Base
export interface KnowledgeDoc extends TenantBaseDocument {
  title: string;
  category: 'POLICY' | 'MANUAL' | 'PRODUCT' | 'SOP' | 'TRAINING';
  content: string;
  fileUrl?: string;
  chunkCount: number;
  vectorIndexed: boolean;
}

export interface MariChatMessage extends TenantBaseDocument {
  conversationId: string;
  sender: 'USER' | 'MARI';
  text: string;
  actionsSuggested?: Array<{
    type: string;
    label: string;
    payload: any;
  }>;
}

// Growth / Marketing Module
export interface SocialPost extends TenantBaseDocument {
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'TIKTOK' | 'X' | 'YOUTUBE';
  content: string;
  mediaUrls?: string[];
  scheduledTime: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  aiGenerated: boolean;
}

export interface MarketingCampaign extends TenantBaseDocument {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  budget?: number;
  channels: string[];
  aiStrategy?: string;
}

// Industry Plugin: Health
export interface HealthRecord extends TenantBaseDocument {
  patientName: string;
  dob: string;
  gender: string;
  phone: string;
  caseNotes: string;
  assessmentSummary: string;
  nextAppointment?: string;
}

// Industry Plugin: Funeral
export interface FuneralCase extends TenantBaseDocument {
  caseNumber: string;
  deceasedName: string;
  dateOfPassing: string;
  familyName: string;
  primaryContactPhone: string;
  casketSelected: string;
  hearseAssigned?: string;
  serviceDate: string;
  status: 'INTAKE' | 'PREPARATION' | 'SERVICE' | 'COMPLETED';
}

// Industry Plugin: Logistics
export interface FleetShipment extends TenantBaseDocument {
  trackingNumber: string;
  origin: string;
  destination: string;
  driverId: string;
  driverName: string;
  vehicleRegistration: string;
  status: 'DISPATCHED' | 'IN_TRANSIT' | 'CUSTOMS_HOLD' | 'DELIVERED';
  customsCleared: boolean;
  eta: string;
}

// Industry Plugin: Trade
export interface TradeOrder extends TenantBaseDocument {
  orderNumber: string;
  supplierName: string;
  orderItems: Array<{ itemName: string; qty: number; price: number }>;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'SHIPPED' | 'RECEIVED';
}
