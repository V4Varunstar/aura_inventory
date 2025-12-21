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
  batchTracking?: boolean;
  lowStockThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
  companyId?: string;
  orgId?: string;
}

// Warehouse type
export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  createdAt: Date;
  updatedAt?: Date;
  companyId?: string;
  orgId?: string;
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
  productName?: string;
  batchNo?: string;
  quantity: number;
  mfgDate?: Date;
  expDate?: Date;
  costPrice: number;
  source: string;
  notes?: string;
  attachmentUrl?: string;
  warehouseId: string;
  warehouseName?: string;
  createdBy: string;
  createdAt: Date;
  companyId?: string;
  orgId?: string;
}

export interface Outward {
  id: string;
  productId: string;
  sku: string;
  productName?: string;
  quantity: number;
  shipmentRef?: string;
  warehouseId: string;
  warehouseName?: string;
  destination: string;
  notes?: string;
  attachmentUrl?: string;
  createdBy: string;
  createdAt: Date;
  companyId?: string;
  orgId?: string;
}

export interface Adjustment {
  id: string;
  productId: string;
  sku: string;
  productName?: string;
  quantity: number;
  type: string;
  warehouseId: string;
  warehouseName?: string;
  notes?: string;
  requiresApproval?: boolean;
  approved: boolean;
  createdBy: string;
  createdAt: Date;
  companyId?: string;
  orgId?: string;
}

export enum AdjustmentType {
  Damage = 'Damage',
  QCFail = 'QC Fail',
  Expired = 'Expired',
  Lost = 'Lost',
  Found = 'Found',
  AuditCorrection = 'Audit Correction',
  Other = 'Other'
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