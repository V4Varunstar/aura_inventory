import React from 'react';
import { RECENT_COMPANIES } from '../constants';
import { Company } from '../types';

const RecentCompaniesTable: React.FC = () => {
  return (
    <div className="col-span-1 xl:col-span-2 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-border-dark shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 dark:border-border-dark flex items-center justify-between">
        <h3 className="font-bold text-lg dark:text-white">Recent Companies</h3>
        <button className="text-sm font-medium text-primary hover:text-green-400 transition-colors">View All</button>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-border-dark">
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Company Name</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Plan Type</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Validity</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-border-dark">
            {RECENT_COMPANIES.map((company) => (
              <TableRow key={company.id} company={company} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-border-dark flex justify-center">
        <button className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
          Show more <span className="material-symbols-outlined text-[16px]">expand_more</span>
        </button>
      </div>
    </div>
  );
};

const TableRow: React.FC<{ company: Company }> = ({ company }) => {
  return (
    <tr className="group hover:bg-gray-50 dark:hover:bg-surface-highlight/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-white dark:bg-white/10 p-1 flex items-center justify-center">
            {company.logo ? (
              <img 
                src={company.logo} 
                alt={company.logoAlt} 
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 size-full flex items-center justify-center rounded-full">
                {company.logoText}
              </span>
            )}
          </div>
          <span className="font-medium text-sm dark:text-white">{company.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${company.planColorClass}`}>
          {company.planType === 'Enterprise' && <span className="material-symbols-outlined text-[14px]">star</span>}
          {company.plan}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
        {company.validity}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${company.statusColorClass} ${company.status === 'Active' ? 'animate-pulse' : ''}`}></span>
          <span className="text-sm text-gray-700 dark:text-gray-200">{company.status}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors">
          Manage
        </button>
      </td>
    </tr>
  );
};

export default RecentCompaniesTable;