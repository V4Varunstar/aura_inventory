import React from 'react';
import { useCompany } from '../../context/CompanyContext';
import { AlertCircle, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';
import { calculateUsagePercentage, getPlanDisplayName } from '../../utils/subscription';

interface PlanLimitBannerProps {
  type: 'users' | 'warehouses' | 'products';
  onUpgrade?: () => void;
}

export const PlanLimitBanner: React.FC<PlanLimitBannerProps> = ({ type, onUpgrade }) => {
  const { company } = useCompany();

  if (!company) return null;

  const getUsageData = () => {
    switch (type) {
      case 'users':
        return {
          current: company.usage.users,
          limit: company.limits.maxUsers,
          label: 'Users',
        };
      case 'warehouses':
        return {
          current: company.usage.warehouses,
          limit: company.limits.maxWarehouses,
          label: 'Warehouses',
        };
      case 'products':
        return {
          current: company.usage.products,
          limit: company.limits.maxProducts,
          label: 'Products',
        };
    }
  };

  const { current, limit, label } = getUsageData();
  
  if (limit === -1) return null; // Unlimited

  const percentage = calculateUsagePercentage(current, limit);
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  if (!isNearLimit) return null;

  return (
    <div className={`rounded-lg p-4 mb-4 ${
      isAtLimit ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
      : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
    }`}>
      <div className="flex items-start">
        <AlertCircle className={`h-5 w-5 mt-0.5 ${
          isAtLimit ? 'text-red-600 dark:text-red-400' 
          : 'text-yellow-600 dark:text-yellow-400'
        }`} />
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            isAtLimit ? 'text-red-800 dark:text-red-300' 
            : 'text-yellow-800 dark:text-yellow-300'
          }`}>
            {isAtLimit ? `${label} Limit Reached` : `Approaching ${label} Limit`}
          </h3>
          <p className={`text-sm mt-1 ${
            isAtLimit ? 'text-red-700 dark:text-red-400' 
            : 'text-yellow-700 dark:text-yellow-400'
          }`}>
            You're using {current} of {limit} {label.toLowerCase()} on your{' '}
            <strong>{getPlanDisplayName(company.plan)}</strong> plan.
            {isAtLimit && ' You cannot add more until you upgrade your plan.'}
          </p>
          {onUpgrade && (
            <div className="mt-3">
              <Button
                size="sm"
                onClick={onUpgrade}
                leftIcon={<TrendingUp />}
              >
                Upgrade Plan
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface UsageIndicatorProps {
  current: number;
  limit: number;
  label: string;
  showPercentage?: boolean;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  current,
  limit,
  label,
  showPercentage = true,
}) => {
  if (limit === -1) {
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-green-600 dark:text-green-400">
          {current} / Unlimited
        </span>
      </div>
    );
  }

  const percentage = calculateUsagePercentage(current, limit);
  const colorClass =
    percentage >= 100
      ? 'bg-red-500'
      : percentage >= 80
      ? 'bg-yellow-500'
      : 'bg-green-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {current} / {limit}
          {showPercentage && ` (${percentage.toFixed(0)}%)`}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`${colorClass} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export const PlanUsageSummary: React.FC = () => {
  const { company } = useCompany();

  if (!company) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Plan Usage
        </h3>
        <span className="px-3 py-1 text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
          {getPlanDisplayName(company.plan)}
        </span>
      </div>
      <div className="space-y-4">
        <UsageIndicator
          current={company.usage.users}
          limit={company.limits.maxUsers}
          label="Users"
        />
        <UsageIndicator
          current={company.usage.warehouses}
          limit={company.limits.maxWarehouses}
          label="Warehouses"
        />
        <UsageIndicator
          current={company.usage.products}
          limit={company.limits.maxProducts}
          label="Products"
        />
      </div>
    </div>
  );
};
