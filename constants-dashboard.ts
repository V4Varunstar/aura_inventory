import { Company, CompanyStatus, KPI, PlanType } from './types-dashboard';

export const INITIAL_KPIS: KPI[] = [
  {
    label: 'Total Companies',
    value: '1,240',
    trend: '+12% vs last month',
    trendUp: true,
    icon: '🏢',
    iconColor: 'text-primary'
  },
  {
    label: 'Active',
    value: '1,100',
    trend: '+5% vs last week',
    trendUp: true,
    icon: '✅',
    iconColor: 'text-emerald-400'
  },
  {
    label: 'Suspended',
    value: '45',
    trend: '+2% action needed',
    trendUp: false,
    icon: '🚫',
    iconColor: 'text-red-500',
    borderColor: 'hover:border-red-500/50'
  },
  {
    label: 'Expiring Soon',
    value: '15',
    trend: '-5% renewal rate',
    trendUp: false,
    icon: '⏰',
    iconColor: 'text-orange-500',
    borderColor: 'hover:border-orange-500/50'
  },
  {
    label: 'Total Users',
    value: '8,500',
    trend: '+8% organic growth',
    trendUp: true,
    icon: '👥',
    iconColor: 'text-blue-400'
  }
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Alphabet Inc.',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNu7p5LO61IXH2LdtjqVlu2NfouTiz30cltdijyeVvaBbANWpTtEagUHb2d014p1RYno7BqvWuM4GOSqyJVACVjHRTVRdD7lHFWQiBzzYugFA6ly5EeYci4ggalRZ11CTtXy-VW2E2oYfTIkllkGEiehC4_aycSbbX0vmlJ4lChED5ntYvUSvWKosx8WWFmbxaBwEdiG2jpV-mDEEH_71qou4t59HwS_aBbRe5TyvUlSUgU93VFnMDfuBTOLeKnmmwb07_ozRLCIc',
    planType: PlanType.ENTERPRISE,
    validity: 'Oct 24, 2024',
    status: CompanyStatus.ACTIVE
  },
  {
    id: '2',
    name: 'Slack Tech',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuSJ1rqePbat4eJKIn2XAJXd7sIVjI5Gup-GVCX5yZCPZ4-5o28FtMsGVp03i8Lhf20jGdDdYcv6WZ66PYhtEcY2c58XmIfVguSac0kzRupCZEp55LFs0gE1cdA0XlHTygfzdz9ErCnIPNpP58vyjcgmd-uQt6n63C11M8wyJdVE5ifqhTFSygIIbuqhrFzH6eOtxg-pNmzZxjSLaf0wZpScuKLEWl8BSIhEPekQe8fTvcDiMfB_30uAS8J8QZDSQpz67g6dDFHcE',
    planType: PlanType.PRO_YEARLY,
    validity: 'Dec 12, 2024',
    status: CompanyStatus.ACTIVE
  },
  {
    id: '3',
    name: 'Acme Corp',
    logo: 'AC',
    planType: PlanType.TRIAL,
    validity: 'Nov 05, 2024',
    status: CompanyStatus.OFFLINE
  },
  {
    id: '4',
    name: 'Notion Labs',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYhWz7y88mpRYuF6plKy6pTOOJ1VXj8RLWbHIsDcSdfoAo3eS9JCNtU6dQwA26fg6Z4k1GRMixm-qogf6HaZ6bCu_wV2ufELk7NN7FC8454Ey6xK0RTg8sbEyZ2m_fTFzAOKy0nMMcRnIlYrLOBZ032SZE_Yn8JL0hl5wP1ZqKiJiGSdOkWBUfFpYkBbS6YJslLemq2aG5CUtJu9pa2HkIoWH__khiu7jt_jAR7LFAZjNEZRrOnEYfTXGyzgjwX8Aao5XtauxOIBU',
    planType: PlanType.PRO_YEARLY,
    validity: 'Aug 18, 2025',
    status: CompanyStatus.ACTIVE
  },
  {
    id: '5',
    name: 'Xylophone Zen',
    logo: 'XZ',
    planType: PlanType.BASIC,
    validity: 'Feb 10, 2024',
    status: CompanyStatus.SUSPENDED
  }
];

export const PLAN_CHART_DATA = [
  { name: 'Monthly', value: 312, total: 1000, color: '#4ade80' },
  { name: 'Yearly', value: 856, total: 1000, color: '#36e27b' },
  { name: 'Trial', value: 72, total: 1000, color: '#fb923c' },
];
