import { AuditLog } from '../types';

/**
 * Create an audit log entry
 */
export const createAuditLog = async (
  companyId: string,
  userId: string,
  userEmail: string,
  action: string,
  module: string,
  targetId?: string,
  targetType?: string,
  changes?: { before?: any; after?: any }
): Promise<void> => {
  const auditLog: Omit<AuditLog, 'id'> = {
    companyId,
    userId,
    userEmail,
    action,
    module,
    targetId,
    targetType,
    changes,
    ipAddress: await getClientIP(),
    userAgent: navigator.userAgent,
    timestamp: new Date(),
  };

  // In production, this would write to Firestore
  // For now, we'll log it
  console.log('Audit Log:', auditLog);
  
  // TODO: Implement Firestore write
  // await addDoc(collection(db, `companies/${companyId}/auditLogs`), auditLog);
};

/**
 * Get client IP address
 */
const getClientIP = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return undefined;
  }
};

/**
 * Audit log actions
 */
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  
  // User Management
  USER_INVITE: 'user_invite',
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_ENABLE: 'user_enable',
  USER_DISABLE: 'user_disable',
  ROLE_CHANGE: 'role_change',
  
  // Product Management
  PRODUCT_CREATE: 'product_create',
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_DELETE: 'product_delete',
  PRODUCT_BULK_IMPORT: 'product_bulk_import',
  
  // Warehouse
  WAREHOUSE_CREATE: 'warehouse_create',
  WAREHOUSE_UPDATE: 'warehouse_update',
  WAREHOUSE_DELETE: 'warehouse_delete',
  
  // Stock Operations
  STOCK_INWARD: 'stock_inward',
  STOCK_OUTWARD: 'stock_outward',
  STOCK_ADJUSTMENT: 'stock_adjustment',
  
  // Settings
  SETTINGS_UPDATE: 'settings_update',
  SUBSCRIPTION_CHANGE: 'subscription_change',
  
  // Data Export
  DATA_EXPORT: 'data_export',
};

/**
 * Audit log modules
 */
export const AUDIT_MODULES = {
  AUTH: 'authentication',
  USER: 'user_management',
  PRODUCT: 'product',
  WAREHOUSE: 'warehouse',
  STOCK: 'stock',
  SETTINGS: 'settings',
  REPORT: 'report',
  BILLING: 'billing',
};

/**
 * Format audit log for display
 */
export const formatAuditLog = (log: AuditLog): string => {
  const actionDescriptions: Record<string, string> = {
    [AUDIT_ACTIONS.LOGIN]: 'logged in',
    [AUDIT_ACTIONS.LOGOUT]: 'logged out',
    [AUDIT_ACTIONS.PRODUCT_CREATE]: 'created a product',
    [AUDIT_ACTIONS.PRODUCT_UPDATE]: 'updated a product',
    [AUDIT_ACTIONS.PRODUCT_DELETE]: 'deleted a product',
    [AUDIT_ACTIONS.USER_INVITE]: 'invited a user',
    [AUDIT_ACTIONS.STOCK_INWARD]: 'added stock (inward)',
    [AUDIT_ACTIONS.STOCK_OUTWARD]: 'removed stock (outward)',
  };

  const description = actionDescriptions[log.action] || log.action;
  return `${log.userEmail} ${description}${log.targetId ? ` (ID: ${log.targetId})` : ''}`;
};
