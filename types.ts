// Dashboard UI Types
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

export interface Company {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
  logoText?: string;
  plan: string;
  planType: 'Enterprise' | 'Pro (Yearly)' | 'Trial' | 'Basic';
  planColorClass: string;
  validity: string;
  status: 'Active' | 'Offline' | 'Suspended';
  statusColorClass: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
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