export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'agent' | 'admin';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'triaged' | 'assigned' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
  customerId: string;
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
  dueSLA?: string;
  tags?: string[];
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  author?: User;
  content: string;
  isInternal: boolean;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  criticalTickets: number;
  slaBreaches: number;
  avgResolutionTime: number;
}

export interface SLAPolicy {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  responseSLA: number; // in minutes
  resolutionSLA: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
