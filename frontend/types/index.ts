// Core role types
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  SALES = 'sales',
  CONSUMER = 'consumer',
}

// Link status and types
export enum LinkStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  BLOCKED = 'blocked',
}

export interface Link {
  id: string;
  supplierId: string;
  supplierName: string;
  consumerId: string;
  consumerName: string;
  status: LinkStatus;
  requestedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  archived: boolean;
}

export interface LinkRequest {
  supplierId: string;
  consumerId: string;
}

// Catalog/Product types
export interface Product {
  id: string;
  supplierId: string;
  name: string;
  description?: string;
  unit: string;
  priceKZT: number;
  stock: number;
  moq: number; // minimum order quantity
  imageUrl?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  unit: string;
  priceKZT: number;
  stock: number;
  moq: number;
  imageUrl?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  archived?: boolean;
}

// Cart types
export interface CartItem {
  productId: string;
  quantity: number;
}

// Order types
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  priceKZT: number;
  totalKZT: number;
}

export interface Order {
  id: string;
  supplierId: string;
  supplierName: string;
  consumerId: string;
  consumerName: string;
  status: OrderStatus;
  items: OrderItem[];
  totalKZT: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  archived: boolean;
}

export interface CreateOrderDto {
  supplierId: string;
  items: { productId: string; quantity: number }[];
  notes?: string;
}

// Chat types
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  type: MessageType;
  content: string;
  attachmentUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface Thread {
  id: string;
  supplierId: string;
  supplierName: string;
  consumerId: string;
  consumerName: string;
  assignedSalesId?: string;
  assignedSalesName?: string;
  lastMessage?: Message;
  unreadCount: number;
  escalated: boolean;
  escalatedAt?: string;
  escalatedBy?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface CreateMessageDto {
  content: string;
  type: MessageType;
  attachmentUrl?: string;
}

export interface TypingIndicator {
  threadId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

// Complaint types
export enum ComplaintStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

export interface Complaint {
  id: string;
  orderId: string;
  threadId: string;
  reportedBy: string;
  reporterName: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  assignedTo?: string;
  assignedToName?: string;
  resolution?: string;
  escalated: boolean;
  escalatedAt?: string;
  escalatedTo?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  archived: boolean;
}

export interface CreateComplaintDto {
  orderId: string;
  subject: string;
  description: string;
}

export interface UpdateComplaintDto {
  status?: ComplaintStatus;
  assignedTo?: string;
  resolution?: string;
  escalated?: boolean;
  escalatedTo?: string;
}

// Incident types
export enum IncidentStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  archived: boolean;
}

export interface CreateIncidentDto {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpdateIncidentDto {
  status?: IncidentStatus;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// User/Session types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  active: boolean;
}

export interface SessionData {
  user: User;
  expiresAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter/Sort types
export interface FilterParams {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
