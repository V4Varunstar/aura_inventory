import React from 'react';
import { useCompany } from '../../context/CompanyContext';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

interface PermissionGateProps {
  permission: keyof typeof PERMISSIONS;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that renders children only if user has the required permission
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { companyUser } = useCompany();

  if (!companyUser || !hasPermission(companyUser.role, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RequirePermissionProps {
  permissions: (keyof typeof PERMISSIONS)[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that requires one or all of the specified permissions
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { companyUser } = useCompany();

  if (!companyUser) {
    return <>{fallback}</>;
  }

  const hasAccess = requireAll
    ? permissions.every(p => hasPermission(companyUser.role, p))
    : permissions.some(p => hasPermission(companyUser.role, p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * HOC to wrap component with permission check
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: keyof typeof PERMISSIONS,
  FallbackComponent?: React.ComponentType
) {
  return function PermissionWrappedComponent(props: P) {
    const { companyUser } = useCompany();

    if (!companyUser || !hasPermission(companyUser.role, permission)) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Access Denied
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              You don't have permission to access this feature.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Hook to check permissions
 */
export const usePermissions = () => {
  const { companyUser } = useCompany();

  const checkPermission = (permission: keyof typeof PERMISSIONS): boolean => {
    if (!companyUser) return false;
    return hasPermission(companyUser.role, permission);
  };

  const checkAnyPermission = (permissions: (keyof typeof PERMISSIONS)[]): boolean => {
    if (!companyUser) return false;
    return permissions.some(p => hasPermission(companyUser.role, p));
  };

  const checkAllPermissions = (permissions: (keyof typeof PERMISSIONS)[]): boolean => {
    if (!companyUser) return false;
    return permissions.every(p => hasPermission(companyUser.role, p));
  };

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    role: companyUser?.role,
  };
};
