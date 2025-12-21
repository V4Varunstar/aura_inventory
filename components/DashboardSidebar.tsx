import React from 'react';
import { CURRENT_USER } from '../constants';

export const DashboardSidebar: React.FC = () => {
  return (
    <aside className="w-72 hidden lg:flex flex-col border-r border-gray-200 dark:border-border-dark bg-white dark:bg-[#0d1812] h-full flex-shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-emerald-800 flex items-center justify-center text-background-dark font-bold text-xl">
          I
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none tracking-tight">Inventory SaaS</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Super Admin Panel</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto py-4">
        <NavItem icon="dashboard" label="Dashboard" active />
        <NavItem icon="apartment" label="Companies" />
        <NavItem icon="group" label="Users" />
        <NavItem icon="credit_card" label="Subscriptions" />
        <NavItem icon="receipt_long" label="Activity Logs" />
        <NavItem icon="settings" label="Settings" />
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-border-dark">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-surface-highlight hover:bg-gray-200 dark:hover:bg-surface-highlight/80 transition-colors cursor-pointer">
          <div className="size-10 rounded-full bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${CURRENT_USER.avatar}')` }}></div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{CURRENT_USER.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{CURRENT_USER.email}</p>
          </div>
          <button className="ml-auto text-gray-500 hover:text-gray-900 dark:hover:text-white">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active }) => {
  const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-full transition-colors group cursor-pointer";
  const activeClasses = "bg-primary/10 text-primary";
  const inactiveClasses = "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-highlight hover:text-gray-900 dark:hover:text-white";

  return (
    <a href="#" className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
      <span className={`material-symbols-outlined ${!active ? 'group-hover:fill-1' : 'fill-1'}`}>{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </a>
  );
};