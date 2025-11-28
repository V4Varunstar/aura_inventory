
import { Role } from './types';
import {
  LayoutDashboard,
  Box,
  ArrowRight,
  ArrowLeft,
  Settings,
  Warehouse,
  Users,
  FileText,
  PackagePlus,
  PackageMinus,
  PackageX,
  Package,
  ClipboardList,
  PieChart,
} from 'lucide-react';


export const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: [Role.Admin, Role.Manager, Role.Employee, Role.Viewer],
  },
  {
    label: 'Inventory',
    isHeader: true,
    roles: [Role.Admin, Role.Manager, Role.Employee, Role.Viewer],
  },
  {
    href: '/products',
    label: 'Products',
    icon: Box,
    roles: [Role.Admin, Role.Manager, Role.Viewer],
  },
  {
    href: '/inward',
    label: 'Inward Stock',
    icon: PackagePlus,
    roles: [Role.Admin, Role.Manager, Role.Employee],
  },
  {
    href: '/outward',
    label: 'Outward Stock',
    icon: PackageMinus,
    roles: [Role.Admin, Role.Manager, Role.Employee],
  },
  {
    href: '/adjustments',
    label: 'Adjustments',
    icon: PackageX,
    roles: [Role.Admin, Role.Manager, Role.Employee],
  },
  {
    href: '/audit',
    label: 'Audit',
    icon: ClipboardList,
    roles: [Role.Admin, Role.Manager, Role.Viewer],
  },
  {
    label: 'Platform Management',
    isHeader: true,
    roles: [Role.Admin, Role.Manager],
  },
  {
    href: '/amazon-fba',
    label: 'Amazon FBA',
    icon: Package,
    roles: [Role.Admin, Role.Manager],
  },
  {
    href: '/flipkart-fbf',
    label: 'Flipkart FBF',
    icon: Package,
    roles: [Role.Admin, Role.Manager],
  },
  {
    href: '/myntra-sjit',
    label: 'Myntra SJIT',
    icon: Package,
    roles: [Role.Admin, Role.Manager],
  },
  {
    href: '/zepto-po',
    label: 'Zepto PO',
    icon: Package,
    roles: [Role.Admin, Role.Manager],
  },
  {
    href: '/nykaa-po',
    label: 'Nykaa PO',
    icon: Package,
    roles: [Role.Admin, Role.Manager],
  },
  {
    label: 'Master Data',
    isHeader: true,
    roles: [Role.Admin, Role.Manager, Role.Viewer],
  },
   {
    href: '/warehouses',
    label: 'Warehouses',
    icon: Warehouse,
    roles: [Role.Admin, Role.Manager],
  },
  {
    href: '/settings/sources',
    label: 'Sources & Destinations',
    icon: PackagePlus,
    roles: [Role.Admin, Role.Manager],
  },
   {
    href: '/product-mapping',
    label: 'EAN / Barcode Mapping',
    icon: Box,
    roles: [Role.Admin, Role.Manager],
  },
   {
    href: '/reports',
    label: 'Reports',
    icon: FileText,
    roles: [Role.Admin, Role.Manager, Role.Viewer],
  },
  {
    href: '/category-sales',
    label: 'Category Sales Analytics',
    icon: PieChart,
    roles: [Role.Admin, Role.Manager, Role.Viewer],
  },
  {
    label: 'Administration',
    isHeader: true,
    roles: [Role.Admin],
  },
  {
    href: '/users',
    label: 'User Management',
    icon: Users,
    roles: [Role.Admin],
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    roles: [Role.Admin],
  },
];

export const APP_NAME = "Aura Inventory";
