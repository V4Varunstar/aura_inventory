export enum PlanType {
  ENTERPRISE = 'Enterprise',
  PRO_YEARLY = 'Pro (Yearly)',
  TRIAL = 'Trial',
  BASIC = 'Basic'
}

export enum CompanyStatus {
  ACTIVE = 'Active',
  OFFLINE = 'Offline',
  SUSPENDED = 'Suspended'
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  planType: PlanType;
  validity: string;
  status: CompanyStatus;
}

export interface KPI {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: string;
  iconColor: string;
  borderColor?: string;
}

export interface PlanData {
  name: string;
  value: number;
  total: number;
  color: string;
}
