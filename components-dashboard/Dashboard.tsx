import React from 'react';
import { INITIAL_KPIS } from '../constants-dashboard';

const Dashboard: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth h-full">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {INITIAL_KPIS.map((kpi) => (
          <div 
            key={kpi.label} 
            className={`p-5 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark shadow-sm flex flex-col justify-between h-32 hover:border-primary/50 transition-colors cursor-default ${kpi.borderColor || ''}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
              <span className={`text-2xl ${kpi.iconColor}`}>{kpi.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              <p className={`text-xs font-medium flex items-center gap-1 mt-1 ${kpi.trendUp ? 'text-emerald-500' : 'text-red-400'}`}>
                {kpi.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Companies Table */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm p-6">
        <h3 className="font-bold text-lg dark:text-white mb-4">Recent Companies</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Dashboard content loaded successfully!
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
