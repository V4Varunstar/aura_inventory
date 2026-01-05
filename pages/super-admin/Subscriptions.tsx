import React from 'react';
import Card from '../../components/ui/Card';

const SuperAdminSubscriptions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Subscriptions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Plan management and subscription health.</p>
      </div>

      <Card className="border border-gray-200/70 dark:border-gray-800 dark:bg-gray-900">
        <div className="text-sm text-gray-600 dark:text-gray-300">Coming soon. (No payment system will be added.)</div>
      </Card>
    </div>
  );
};

export default SuperAdminSubscriptions;
