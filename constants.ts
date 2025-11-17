
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
} from 'lucide-react';


export const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: [Role.Admin, Role.Manager, Role.WarehouseStaff, Role.Viewer],
  },
  {
    label: 'Inventory',
    isHeader: true,
    roles: [Role.Admin, Role.Manager, Role.WarehouseStaff, Role.Viewer],
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
    roles: [Role.Admin, Role.Manager, Role.WarehouseStaff],
  },
  {
    href: '/outward',
    label: 'Outward Stock',
    icon: PackageMinus,
    roles: [Role.Admin, Role.Manager, Role.WarehouseStaff],
  },
  {
    href: '/adjustments',
    label: 'Adjustments',
    icon: PackageX,
    roles: [Role.Admin, Role.Manager, Role.WarehouseStaff],
  },
  {
    label: 'Management',
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
    href: '/reports',
    label: 'Reports',
    icon: FileText,
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
];

export const APP_NAME = "Aura Inventory";
