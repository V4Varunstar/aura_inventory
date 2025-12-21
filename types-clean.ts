// Base interfaces
export interface KPIData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: string;
  iconColorClass: string;
  iconBgClass: string;
  changeLabel: string;
}

export interface ChartData {
  plan: string;
  companies: number;
  color: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  joinedDate: string;
  users: number;
  revenue: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  role: string;
}