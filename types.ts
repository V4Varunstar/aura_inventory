// Multi-Tenant Types
export enum SubscriptionPlan {
  Free = 'free',
  Starter = 'starter',
  Pro = 'pro',
  Business = 'business',
}

export enum SubscriptionStatus {
  Active = 'active',
  Inactive = 'inactive',
  Trialing = 'trialing',
  PastDue = 'past_due',
  Canceled = 'canceled',
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId?: string;
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  validFrom?: Date; // Subscription validity start date
  validTo?: Date;   // Subscription validity end date
  loginAllowed?: boolean; // Super Admin can control login access
  orgId: string; // Unique organization identifier for data isolation
  isActive: boolean; // For Super Admin to activate/deactivate
  limits: {
    maxUsers: number;
    maxWarehouses: number;
    maxProducts: number;
  };
  usage: {
    users: number;
    warehouses: number;
    products: number;
  };
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Role {
  Owner = 'Owner',
  Admin = 'Admin',
  Manager = 'Manager', 
  Employee = 'Employee',
  Viewer = 'Viewer',
  SuperAdmin = 'SuperAdmin',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  photoURL?: string;
  role?: Role; // For Super Admin users
  orgId?: string; // Organization ID for data isolation
  companyId?: string; // Company ID for regular users
  isEnabled?: boolean; // Enable/disable user
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: Role;
  isEnabled: boolean;
  invitedBy?: string;
  invitedAt?: Date;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductCategory {
  HairCare = 'Hair Care',
  SkinCare = 'Skin Care',
  FaceCare = 'Face Care',
  BodyCare = 'Body Care',
}

export enum ProductUnit {
  Pcs = 'pcs',
  Ml = 'ml',
  G = 'g',
}

// Source Management - Custom Sources/Destinations
export interface Source {
  id: string;
  companyId: string;
  name: string;
  type: 'inward' | 'outward' | 'both' | 'supplier' | 'warehouse' | 'return';
  isActive: boolean;
  isDefault?: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  companyId: string;
  sku: string;
  ean?: string; // EAN/Barcode for scanning
  name: string;
  imageUrl: string;
  category: ProductCategory;
  unit: ProductUnit;
  mrp: number;
  costPrice: number;
  batchTracking: boolean;
  lowStockThreshold: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  location: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Batch {
  id: string;
  productId: string;
  batchNo: string;
  quantity: number;
  mfgDate: Date;
  expDate: Date;
  costPrice: number;
  createdAt: Date;
}

export interface Stock {
  id: string; // Composite key: `${productId}_${warehouseId}`
  productId: string;
  warehouseId: string;
  quantity: number;
  avgCost: number;
  stockValue: number;
  reserved: number;
  updatedAt: Date;
}

export enum InwardSource {
  Factory = 'Factory',
  AmazonReturn = 'Amazon Return',
  FlipkartReturn = 'Flipkart Return',
  MeeshoReturn = 'Meesho Return',
  MyntraReturn = 'Myntra Return',
  FbaWarehouseReturn = 'FBA Warehouse Return',
}

export interface Inward {
  id: string;
  companyId: string;
  productId: string;
  sku: string;
  ean?: string;
  batchNo: string;
  quantity: number;
  mfgDate: Date;
  expDate: Date;
  costPrice: number;
  warehouseId: string;
  source: InwardSource | string;
  documentNo?: string; // Invoice number for bulk inward
  documentDate?: Date; // Invoice date
  transactionDate?: Date; // For filtering
  type?: 'purchase' | 'return'; // Return scanning vs factory inward
  referenceOrderId?: string; // For returns
  notes?: string;
  attachmentUrl?: string;
  createdBy: string; // userId
  createdAt: Date;
}

export enum OutwardDestination {
  AmazonFba = 'Amazon FBA',
  Flipkart = 'Flipkart',
  Meesho = 'Meesho',
  Myntra = 'Myntra',
  OfflineStore = 'Offline Store',
  RetailerB2B = 'Retailer (B2B)',
  ReturnToFactory = 'Return to Factory',
}

export interface Outward {
  id: string;
  companyId: string;
  productId: string;
  sku: string;
  ean?: string;
  quantity: number;
  shipmentRef?: string;
  courierPartner?: string;
  warehouseId: string;
  destination: OutwardDestination | string;
  channel?: string; // amazon, flipkart, offline, etc
  orderId?: string; // B2C order reference
  source?: 'order' | 'FBA_SHIPMENT' | 'manual'; // Track origin
  referenceId?: string; // fbaShipmentId or orderId
  documentDate?: Date;
  transactionDate?: Date;
  notes?: string;
  attachmentUrl?: string;
  batchNo?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  costPrice?: number;
  createdBy: string; // userId
  createdAt: Date;
}

export interface Order {
  id: string;
  companyId: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  channel: string;
  orderRef?: string;
  customerName?: string;
  warehouseId: string;
  timestamp: Date;
  createdBy: string;
  createdAt: Date;
}

export enum AdjustmentType {
  Damage = 'Damage',
  QCFail = 'QC Fail',
  Expired = 'Expired',
  AuditCorrection = 'Audit Correction',
}

export interface Adjustment {
  id: string;
  companyId: string;
  productId: string;
  sku: string;
  quantity: number; // can be negative
  type: AdjustmentType;
  warehouseId: string;
  notes: string;
  requiresApproval: boolean;
  approved: boolean;
  createdBy: string; // userId
  createdAt: Date;
}

export enum ActivityType {
  UserCreated = 'User Created',
  UserUpdated = 'User Updated',
  ProductCreated = 'Product Created',
  ProductUpdated = 'Product Updated',
  InwardCreated = 'Inward Created',
  OutwardCreated = 'Outward Created',
  AdjustmentCreated = 'Adjustment Created',
  WarehouseCreated = 'Warehouse Created',
  WarehouseUpdated = 'Warehouse Updated',
  Login = 'User Login',
}

export interface ActivityLog {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  type: ActivityType;
  referenceId: string;
  details: string; // e.g., "Updated product name from 'Old' to 'New'"
  ipAddress?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Audit Log for compliance
export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  userEmail: string;
  action: string;
  module: string;
  targetId?: string;
  targetType?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Notification Types
export enum NotificationType {
  LowStock = 'low_stock',
  ExpiryAlert = 'expiry_alert',
  DailySummary = 'daily_summary',
  UserInvite = 'user_invite',
  SubscriptionExpiry = 'subscription_expiry',
}

export interface Notification {
  id: string;
  companyId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// FBA Shipment Types
export enum ShipmentStatus {
  Created = 'created',
  Deducted = 'deducted',
  Cancelled = 'cancelled',
}

export interface FbaShipmentItem {
  sku: string;
  ean?: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  costPrice?: number;
}

export interface FbaShipment {
  id: string;
  companyId: string;
  shipmentName: string;
  trackingId?: string;
  awb?: string;
  carrier?: string;
  status: ShipmentStatus;
  items: FbaShipmentItem[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
  deductedAt?: Date;
  deductedBy?: string;
  updatedAt: Date;
}

// EAN Mapping
export interface EanMap {
  id: string; // EAN code
  companyId: string;
  ean: string;
  sku: string;
  productId: string;
  productName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Custom Entities for dropdowns
export interface Channel {
  id: string;
  companyId: string;
  name: string;
  type: 'marketplace' | 'offline' | 'b2b';
  isActive: boolean;
  createdAt: Date;
}

export interface Destination {
  id: string;
  companyId: string;
  name: string;
  type: 'warehouse' | 'marketplace' | 'store' | 'customer';
  isActive: boolean;
  createdAt: Date;
}

// Bulk Inward Document
export interface BulkInwardDocument {
  id: string;
  companyId: string;
  documentNo: string;
  invoiceNumber?: string;
  supplierName?: string;
  documentDate: Date;
  warehouseId: string;
  items: {
    sku: string;
    ean?: string;
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    batchNo?: string;
    mfgDate?: Date;
    expDate?: Date;
  }[];
  totalAmount?: number;
  attachmentUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

// Plan Limits
export const PLAN_LIMITS = {
  [SubscriptionPlan.Free]: {
    maxUsers: 1,
    maxWarehouses: 1,
    maxProducts: 50,
    features: ['Basic Inventory', 'Reports'],
  },
  [SubscriptionPlan.Starter]: {
    maxUsers: 3,
    maxWarehouses: 1,
    maxProducts: 500,
    features: ['Basic Inventory', 'Reports', 'Bulk Upload', 'Email Alerts'],
  },
  [SubscriptionPlan.Pro]: {
    maxUsers: 10,
    maxWarehouses: 3,
    maxProducts: 5000,
    features: ['All Starter Features', 'WhatsApp Alerts', 'Advanced Analytics', 'API Access'],
  },
  [SubscriptionPlan.Business]: {
    maxUsers: -1, // unlimited
    maxWarehouses: -1,
    maxProducts: -1,
    features: ['All Pro Features', 'Priority Support', 'Custom Integrations', 'Dedicated Account Manager'],
  },
};

// Super Admin Types
export interface SuperAdminStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  totalUsers: number;
}

export interface CreateCompanyRequest {
  name: string;
  email: string;
  phone?: string;
  plan: SubscriptionPlan;
  ownerName: string;
  ownerEmail: string;
  maxUsers?: number;
  maxWarehouses?: number;
  maxProducts?: number;
  validFrom?: Date;
  validTo?: Date;
}
