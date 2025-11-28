import { Role } from '../types';

// Permission matrix
export const PERMISSIONS = {
  // Product permissions
  'product:create': [Role.Admin, Role.Manager],
  'product:update': [Role.Admin, Role.Manager, Role.Employee],
  'product:delete': [Role.Admin],
  'product:view': [Role.Admin, Role.Manager, Role.Employee, Role.Viewer],
  
  // Warehouse permissions
  'warehouse:create': [Role.Admin],
  'warehouse:update': [Role.Admin, Role.Manager],
  'warehouse:delete': [Role.Admin],
  'warehouse:view': [Role.Admin, Role.Manager, Role.Employee, Role.Viewer],
  
  // Stock operations
  'stock:inward': [Role.Admin, Role.Manager, Role.Employee],
  'stock:outward': [Role.Admin, Role.Manager, Role.Employee],
  'stock:adjust': [Role.Admin, Role.Manager],
  'stock:view': [Role.Admin, Role.Manager, Role.Employee, Role.Viewer],
  
  // User management
  'user:invite': [Role.Admin],
  'user:update': [Role.Admin],
  'user:delete': [Role.Admin],
  'user:view': [Role.Admin, Role.Manager],
  
  // Reports
  'report:view': [Role.Admin, Role.Manager, Role.Viewer],
  'report:export': [Role.Admin, Role.Manager],
  
  // Settings
  'settings:view': [Role.Admin],
  'settings:update': [Role.Admin],
  
  // Audit logs
  'audit:view': [Role.Admin],
};

/**
 * Check if a user role has a specific permission
 */
export const hasPermission = (userRole: Role, permission: keyof typeof PERMISSIONS): boolean => {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles?.includes(userRole) || false;
};

/**
 * Check if user has any of the specified permissions
 */
export const hasAnyPermission = (userRole: Role, permissions: (keyof typeof PERMISSIONS)[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if user has all of the specified permissions
 */
export const hasAllPermissions = (userRole: Role, permissions: (keyof typeof PERMISSIONS)[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: Role): string[] => {
  return Object.keys(PERMISSIONS).filter(permission =>
    hasPermission(role, permission as keyof typeof PERMISSIONS)
  );
};

/**
 * Check if role is admin or manager
 */
export const isAdminOrManager = (role: Role): boolean => {
  return role === Role.Admin || role === Role.Manager;
};

/**
 * Check if role is admin
 */
export const isAdmin = (role: Role): boolean => {
  return role === Role.Admin;
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role: Role): string => {
  const roleNames = {
    [Role.Admin]: 'Administrator',
    [Role.Manager]: 'Manager',
    [Role.Employee]: 'Employee',
    [Role.Viewer]: 'Viewer',
  };
  return roleNames[role] || role;
};

/**
 * Get role description
 */
export const getRoleDescription = (role: Role): string => {
  const descriptions = {
    [Role.Admin]: 'Full access to all features including user management and billing',
    [Role.Manager]: 'Manage inventory, products, and view reports',
    [Role.Employee]: 'Perform stock operations and manage products',
    [Role.Viewer]: 'Read-only access to inventory and reports',
  };
  return descriptions[role] || '';
};
