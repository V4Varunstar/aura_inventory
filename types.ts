
export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  WarehouseStaff = 'Warehouse Staff',
  Viewer = 'Viewer',
}

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  isEnabled: boolean;
  createdAt: Date;
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

export interface Product {
  id: string;
  sku: string;
  name: string;
  imageUrl: string;
  category: ProductCategory;
  unit: ProductUnit;
  mrp: number;
  costPrice: number;
  batchTracking: boolean;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  createdAt: Date;
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
  productId: string;
  sku: string;
  batchNo: string;
  quantity: number;
  mfgDate: Date;
  expDate: Date;
  costPrice: number;
  source: InwardSource;
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
  productId: string;
  sku: string;
  quantity: number;
  shipmentRef?: string;
  warehouseId: string;
  destination: OutwardDestination;
  notes?: string;
  attachmentUrl?: string;
  createdBy: string; // userId
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
  userId: string;
  userName: string;
  type: ActivityType;
  referenceId: string;
  details: string; // e.g., "Updated product name from 'Old' to 'New'"
  ipAddress?: string;
  createdAt: Date;
}
