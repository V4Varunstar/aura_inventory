import { KPIData, ChartData, Company, User, Role } from './types';
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings as SettingsIcon,
  FileText,
  Users,
  Warehouse as WarehouseIcon,
  BarChart3,
  Shuffle,
  Barcode,
  TrendingUp,
  UserCircle
} from 'lucide-react';

export const APP_NAME = 'Aura Inventory';

// Navigation Items
export const NAV_ITEMS = [
  { label: 'Dashboard', isHeader: true, roles: [Role.Admin, Role.Manager, Role.Employee, Role.Viewer] },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [Role.Admin, Role.Manager, Role.Employee, Role.Viewer] },
  
  { label: 'Inventory', isHeader: true, roles: [Role.Admin, Role.Manager, Role.Employee, Role.Viewer] },
  { label: 'Products', href: '/products', icon: Package, roles: [Role.Admin, Role.Manager, Role.Employee, Role.Viewer] },
  { label: 'Inward Stock', href: '/inward', icon: ArrowDownToLine, roles: [Role.Admin, Role.Manager, Role.Employee] },
  { label: 'Outward Stock', href: '/outward', icon: ArrowUpFromLine, roles: [Role.Admin, Role.Manager, Role.Employee] },
  { label: 'Adjustments', href: '/adjustments', icon: Shuffle, roles: [Role.Admin, Role.Manager] },
  { label: 'Stock Adjustment', href: '/stock-adjustment', icon: Shuffle, roles: [Role.Admin, Role.Manager] },
  { label: 'Audit', href: '/audit', icon: FileText, roles: [Role.Admin, Role.Manager, Role.Viewer] },
  
  { label: 'Platform Management', isHeader: true, roles: [Role.Admin, Role.Manager, Role.Employee] },
  { label: 'Amazon FBA', href: '/amazon-fba', icon: Package, roles: [Role.Admin, Role.Manager, Role.Employee] },
  { label: 'Flipkart FBF', href: '/flipkart-fbf', icon: Package, roles: [Role.Admin, Role.Manager, Role.Employee] },
  { label: 'Myntra SJIT', href: '/myntra-sjit', icon: Package, roles: [Role.Admin, Role.Manager, Role.Employee] },
  { label: 'Zepto PO', href: '/zepto-po', icon: Package, roles: [Role.Admin, Role.Manager, Role.Employee] },
  { label: 'Nykaa PO', href: '/nykaa-po', icon: Package, roles: [Role.Admin, Role.Manager, Role.Employee] },
  
  { label: 'Master Data', isHeader: true, roles: [Role.Admin, Role.Manager, Role.Viewer] },
  { label: 'Warehouses', href: '/warehouses', icon: WarehouseIcon, roles: [Role.Admin, Role.Manager] },
  { label: 'Parties', href: '/parties', icon: UserCircle, roles: [Role.Admin, Role.Manager] },
  { label: 'Sources & Destinations', href: '/settings/sources', icon: Shuffle, roles: [Role.Admin, Role.Manager] },
  { label: 'EAN / Barcode Mapping', href: '/product-mapping', icon: Barcode, roles: [Role.Admin, Role.Manager] },
  { label: 'Expiring Items', href: '/expiring-products', icon: TrendingUp, roles: [Role.Admin, Role.Manager, Role.Viewer] },
  { label: 'Reports', href: '/reports', icon: BarChart3, roles: [Role.Admin, Role.Manager, Role.Viewer] },
  
  { label: 'Administration', isHeader: true, roles: [Role.Admin] },
  { label: 'User Management', href: '/users', icon: Users, roles: [Role.Admin] },
  { label: 'Settings', href: '/settings', icon: SettingsIcon, roles: [Role.Admin] },
];

export const CURRENT_USER: User = {
  name: "Alex Morgan",
  email: "alex@inventory.com",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1CNXyVRpTAwJb6mIXooQVTULMcNE-UA1zhZfBBVSYSLPWIyZt5v_fAd1W4CBpNs15Ons4Cq-SrMDfLu2q2te-Oru01ygChzn1KQc63m391Gic64edRk7Fb_O_BcsRPC--btMRdIPZdhimGevYYFAUmzBlLPeXhGwivafMYw7tVt9ZKUuoQfr_HJ40phcKanQyFu2q_Uc2i40_QT6magUq5URtZHPYLc2WpO9FL0hy70xlSdjODFzLHMPY7Kl6e6l2BnrQ85eDbOM"
};

export const KPI_STATS: KPIData[] = [
  {
    title: "Total Companies",
    value: "1,240",
    change: "+12%",
    changeType: "positive",
    icon: "apartment",
    iconColorClass: "text-primary/80",
    iconBgClass: "bg-primary/10",
    changeLabel: "vs last month"
  },
  {
    title: "Active",
    value: "1,100",
    change: "+5%",
    changeType: "positive",
    icon: "check_circle",
    iconColorClass: "text-emerald-400",
    iconBgClass: "bg-emerald-400/10",
    changeLabel: "vs last week"
  },
  {
    title: "Suspended",
    value: "45",
    change: "+2%",
    changeType: "negative",
    icon: "block",
    iconColorClass: "text-red-500",
    iconBgClass: "bg-red-500/10",
    changeLabel: "action needed"
  },
  {
    title: "Expiring Soon",
    value: "15",
    change: "-5%",
    changeType: "neutral",
    icon: "schedule",
    iconColorClass: "text-orange-500",
    iconBgClass: "bg-orange-500/10",
    changeLabel: "renewal rate"
  },
  {
    title: "Total Users",
    value: "8,500",
    change: "+8%",
    changeType: "positive",
    icon: "group",
    iconColorClass: "text-blue-400",
    iconBgClass: "bg-blue-400/10",
    changeLabel: "organic growth"
  }
];

export const CHART_DATA: ChartData[] = [
  { name: 'Monthly', value: 312, fill: '#34d399' }, // emerald-400
  { name: 'Yearly', value: 856, fill: '#36e27b' }, // primary
  { name: 'Trial', value: 72, fill: '#fb923c' },   // orange-400
];

export const RECENT_COMPANIES: Company[] = [
  {
    id: "1",
    name: "Alphabet Inc.",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNu7p5LO61IXH2LdtjqVlu2NfouTiz30cltdijyeVvaBbANWpTtEagUHb2d014p1RYno7BqvWuM4GOSqyJVACVjHRTVRdD7lHFWQiBzzYugFA6ly5EeYci4ggalRZ11CTtXy-VW2E2oYfTIkllkGEiehC4_aycSbbX0vmlJ4lChED5ntYvUSvWKosx8WWFmbxaBwEdiG2jpV-mDEEH_71qou4t59HwS_aBbRe5TyvUlSUgU93VFnMDfuBTOLeKnmmwb07_ozRLCIc",
    logoAlt: "Google Logo",
    plan: "Enterprise",
    planType: "Enterprise",
    planColorClass: "bg-primary/10 text-primary border-primary/20",
    validity: "Oct 24, 2024",
    status: "Active",
    statusColorClass: "bg-emerald-500"
  },
  {
    id: "2",
    name: "Slack Tech",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuSJ1rqePbat4eJKIn2XAJXd7sIVjI5Gup-GVCX5yZCPZ4-5o28FtMsGVp03i8Lhf20jGdDdYcv6WZ66PYhtEcY2c58XmIfVguSac0kzRupCZEp55LFs0gE1cdA0XlHTygfzdz9ErCnIPNpP58vyjcgmd-uQt6n63C11M8wyJdVE5ifqhTFSygIIbuqhrFzH6eOtxg-pNmzZxjSLaf0wZpScuKLEWl8BSIhEPekQe8fTvcDiMfB_30uAS8J8QZDSQpz67g6dDFHcE",
    logoAlt: "Slack Logo",
    plan: "Pro (Yearly)",
    planType: "Pro (Yearly)",
    planColorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    validity: "Dec 12, 2024",
    status: "Active",
    statusColorClass: "bg-emerald-500"
  },
  {
    id: "3",
    name: "Acme Corp",
    logo: "",
    logoAlt: "",
    logoText: "AC",
    plan: "Trial",
    planType: "Trial",
    planColorClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    validity: "Nov 05, 2024",
    status: "Offline",
    statusColorClass: "bg-gray-400"
  },
  {
    id: "4",
    name: "Notion Labs",
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYhWz7y88mpRYuF6plKy6pTOOJ1VXj8RLWbHIsDcSdfoAo3eS9JCNtU6dQwA26fg6Z4k1GRMixm-qogf6HaZ6bCu_wV2ufELk7NN7FC8454Ey6xK0RTg8sbEyZ2m_fTFzAOKy0nMMcRnIlYrLOBZ032SZE_Yn8JL0hl5wP1ZqKiJiGSdOkWBUfFpYkBbS6YJslLemq2aG5CUtJu9pa2HkIoWH__khiu7jt_jAR7LFAZjNEZRrOnEYfTXGyzgjwX8Aao5XtauxOIBU",
    logoAlt: "Notion Logo",
    plan: "Pro (Yearly)",
    planType: "Pro (Yearly)",
    planColorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    validity: "Aug 18, 2025",
    status: "Active",
    statusColorClass: "bg-emerald-500"
  },
  {
    id: "5",
    name: "Xylophone Zen",
    logo: "",
    logoAlt: "",
    logoText: "XZ",
    plan: "Basic",
    planType: "Basic",
    planColorClass: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    validity: "Feb 10, 2024",
    status: "Suspended",
    statusColorClass: "bg-red-500"
  }
];