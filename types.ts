// Dashboard UI Types

// Role enum for user permissions
export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  Employee = 'Employee',
  Viewer = 'Viewer',
  Owner = 'Owner',
  SuperAdmin = 'SuperAdmin'
}

// Product-related types
export enum ProductCategory {
  HairCare = 'Hair Care',
  SkinCare = 'Skin Care',
  FaceCare = 'Face Care',
  BodyCare = 'Body Care'
}

export enum ProductUnit {
  Pieces = 'pcs',
  Milliliters = 'ml',
  Grams = 'g',
  Kilograms = 'kg',
  Liters = 'l'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  imageUrl?: string;
  category: string;
  unit: string;
  mrp: number;
  costPrice: number;
  sellingPrice?: number; // NEW: Selling price for analytics
  gstPercentage?: number; // NEW: GST percentage
  ean?: string; // NEW: EAN/Barcode - mandatory and unique
  batchTracking?: boolean;
  lowStockThreshold?: number; // Minimum stock threshold for alerts
  minStockThreshold?: number; // Alias for lowStockThreshold
  warehouseIds?: string[]; // NEW: Warehouses where product is available
  createdAt: Date;
  updatedAt: Date;
  companyId?: string;
  orgId?: string;
  isDeleted?: boolean; // NEW: Soft delete flag
}

// Warehouse type
export interface Warehouse {
  id: string;
  name: string;
  code?: string; // NEW: Warehouse code
  location?: string;
  address?: string; // NEW: Full address
  status?: 'Active' | 'Inactive'; // NEW: Warehouse status
  createdAt: Date;
  updatedAt?: Date;
  companyId?: string;
  orgId?: string;
  isDeleted?: boolean; // NEW: Soft delete flag
}

// Inward/Outward Sources
export enum InwardSource {
  Factory = 'Factory',
  AmazonReturn = 'Amazon Return',
  FlipkartReturn = 'Flipkart Return',
  MeeshoReturn = 'Meesho Return',
  CustomerReturn = 'Customer Return',
  Supplier = 'Supplier',
  Transfer = 'Transfer',
  Other = 'Other'
}

export enum OutwardDestination {
  AmazonFBA = 'Amazon FBA',
  Flipkart = 'Flipkart',
  FlipkartFBF = 'Flipkart FBF',
  Meesho = 'Meesho',
  Myntra = 'Myntra',
  MyntraSJIT = 'Myntra SJIT',
  Zepto = 'Zepto',
  ZeptoPO = 'Zepto PO',
  Nykaa = 'Nykaa',
  NykaaPO = 'Nykaa PO',
  OfflineStore = 'Offline Store',
  Customer = 'Customer',
  Transfer = 'Transfer',
  Other = 'Other'
}

// Stock transactions
export interface Inward {
  id: string;
  productId: string;
  sku: string;
  ean?: string; // EAN / Barcode
  productName?: string;
  batchNo?: string;
  quantity: number;
  mfgDate?: Date;
  expDate?: Date;
  costPrice: number;
  source: string;
  partyId?: string; // NEW: Party ID reference
  partyName?: string; // NEW: Party name
  awbNumber?: string; // NEW: AWB/Reference number
  documentType?: string; // NEW: Document type
  documentNo?: string; // NEW: Invoice/Document number
  notes?: string;
  attachmentUrl?: string;
  warehouseId: string;
  warehouseName?: string;
  createdBy: string;
  createdAt: Date;
  transactionDate?: Date; // NEW: Transaction date
  companyId?: string;
  orgId?: string;
  isDeleted?: boolean; // NEW: Soft delete
}

export interface Outward {
  id: string;
  productId: string;
  sku: string;
  ean?: string; // EAN / Barcode
  productName?: string;
  quantity: number;
  shipmentRef?: string;
  awbNumber?: string; // NEW: AWB/Order/Reference number
  orderNumber?: string; // NEW: Order number
  documentType?: string; // NEW: Document type
  platform?: string; // NEW: Platform/Channel (Amazon, Flipkart, etc.)
  warehouseId: string;
  warehouseName?: string;
  destination: string; // Platform/Channel
  partyId?: string; // NEW: Party ID for custom parties
  partyName?: string; // NEW: Party name
  notes?: string;
  attachmentUrl?: string;
  courierPartner?: string;
  batchNo?: string;
  manufacturingDate?: Date;
  expiryDate?: Date;
  costPrice?: number;
  createdBy: string;
  createdAt: Date;
  companyId?: string;
  orgId?: string;
  transactionDate?: Date;
  isDeleted?: boolean; // NEW: Soft delete
}

export interface Adjustment {
  id: string;
  productId: string;
  sku: string;
  productName?: string;
  quantity: number;
  type: string;
  adjustmentType?: 'Increase' | 'Decrease'; // NEW: Increase or Decrease
  reason: string; // NEW: Mandatory reason
  warehouseId: string;
  warehouseName?: string;
  notes?: string;
  requiresApproval?: boolean;
  approved: boolean;
  createdBy: string;
  createdAt: Date;
  companyId?: string;
  orgId?: string;
  isDeleted?: boolean; // NEW: Soft delete
}

export enum AdjustmentType {
  Damage = 'Damage',
  QCFail = 'QC Fail',
  Expired = 'Expired',
  Lost = 'Lost',
  Found = 'Found',
  AuditCorrection = 'Audit Correction',
  Increase = 'Increase',
  Decrease = 'Decrease',
  Other = 'Other'
}

// NEW: Party/Customer Management
export interface Party {
  id: string;
  name: string;
  type: 'Customer' | 'Supplier' | 'Both'; // Party type
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  companyId?: string;
  orgId?: string;
  isDeleted?: boolean; // Soft delete
}

// NEW: Password Reset Log
export interface PasswordResetLog {
  id: string;
  userId: string;
  userName: string;
  resetBy: string; // 'self' or admin user ID
  resetAt: Date;
  companyId?: string;
  orgId?: string;
}

// NEW: Warehouse Selection Context
export interface WarehouseContextType {
  selectedWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  loading: boolean;
  selectWarehouse: (warehouseId: string) => void;
  refreshWarehouses: () => Promise<void>;
}

// NEW: Warehouse Inventory (for stock tracking per warehouse)
export interface WarehouseInventory {
  id: string;
  warehouseId: string;
  warehouseName: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  costValue: number; // quantity * cost price
  lastUpdated: Date;
  companyId?: string;
  orgId?: string;
}

// Activity logging
export enum ActivityType {
  ProductCreated = 'ProductCreated',
  ProductUpdated = 'ProductUpdated',
  ProductDeleted = 'ProductDeleted',
  UserCreated = 'UserCreated',
  UserUpdated = 'UserUpdated',
  UserDeleted = 'UserDeleted',
  InwardCreated = 'InwardCreated',
  OutwardCreated = 'OutwardCreated',
  AdjustmentCreated = 'AdjustmentCreated',
  WarehouseCreated = 'WarehouseCreated',
  WarehouseUpdated = 'WarehouseUpdated',
  WarehouseDeleted = 'WarehouseDeleted',
  PartyCreated = 'PartyCreated', // NEW
  PartyUpdated = 'PartyUpdated', // NEW
  PartyDeleted = 'PartyDeleted', // NEW
  PasswordReset = 'PasswordReset', // NEW
  Login = 'Login',
  Logout = 'Logout',
  SettingsChanged = 'SettingsChanged'
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  type: ActivityType;
  referenceId?: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
  companyId?: string;
  orgId?: string;
}

// Platform Shipment types
export enum ShipmentStatus {
  Created = 'Created',
  Deducted = 'Deducted',
  Cancelled = 'Cancelled'
}

export interface FbaShipmentItem {
  sku: string;
  ean: string;
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
  updatedAt: Date;
  deductedAt?: Date;
  deductedBy?: string;
}

export interface KPIData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string; // Material symbol name
  iconColorClass: string;
  iconBgClass: string;
  changeLabel: string;
}

export interface ChartData {
  name: string;
  value: number;
  fill: string;
}

// Subscription types
export enum SubscriptionPlan {
  Free = 'Free',
  Starter = 'Starter',
  Pro = 'Pro',
  Business = 'Business'
}

export enum SubscriptionStatus {
  Active = 'active',
  Inactive = 'inactive',
  Trialing = 'trialing',
  Expired = 'expired',
  Suspended = 'suspended'
}

export const PLAN_LIMITS = {
  [SubscriptionPlan.Free]: {
    maxUsers: 5,
    maxWarehouses: 2,
    maxProducts: 50,
    features: ['Basic Inventory', 'Single Warehouse', 'Up to 5 Users']
  },
  [SubscriptionPlan.Starter]: {
    maxUsers: 25,
    maxWarehouses: 5,
    maxProducts: 500,
    features: ['Multiple Warehouses', 'Up to 25 Users', 'Basic Reports', 'Email Support']
  },
  [SubscriptionPlan.Pro]: {
    maxUsers: 100,
    maxWarehouses: 20,
    maxProducts: 5000,
    features: ['Unlimited Warehouses', 'Up to 100 Users', 'Advanced Analytics', 'Priority Support', 'API Access']
  },
  [SubscriptionPlan.Business]: {
    maxUsers: -1,
    maxWarehouses: -1,
    maxProducts: -1,
    features: ['Unlimited Everything', 'Unlimited Users', 'Custom Integrations', 'Dedicated Support', '99.9% SLA']
  }
};

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  orgId: string;
  isActive: boolean;
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
  validFrom?: Date;
  validTo?: Date;
  loginAllowed?: boolean;
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields for backward compatibility
  logo?: string;
  logoAlt?: string;
  logoText?: string;
  planType?: 'Enterprise' | 'Pro (Yearly)' | 'Trial' | 'Basic';
  planColorClass?: string;
  validity?: string;
  status?: 'Active' | 'Offline' | 'Suspended';
  statusColorClass?: string;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: Role;
  isEnabled: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  orgId?: string;
  companyId?: string;
  password?: string;
}

// Inward Stock System Types
export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface InwardStockFormData {
  sourceType: string;
  reference: string;
  productSearch: string;
  batchId: string;
  quantity: number | '';
  costPrice: number | '';
  mfgDate: string;
  expiryDate: string;
  notes: string;
}