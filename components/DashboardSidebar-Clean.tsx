import React from 'react';
import { CURRENT_USER } from '../constants-clean';

interface DashboardSidebarProps {}

const DashboardSidebar: React.FC<DashboardSidebarProps> = () => {
  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', active: true },
    { icon: 'apartment', label: 'Companies', active: false },
    { icon: 'people', label: 'Users', active: false },
    { icon: 'receipt_long', label: 'Reports', active: false },
    { icon: 'settings', label: 'Settings', active: false }
  ];

  return (
    <aside className="w-72 hidden lg:flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full flex-shrink-0">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl">
          I
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none tracking-tight text-gray-900 dark:text-white">
            Inventory SaaS
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Super Admin Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto py-4">
        {navItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors cursor-pointer ${
              item.active
                ? 'bg-green-100 text-green-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className={`material-symbols-outlined ${item.active ? 'fill-1' : ''}`}>
              {item.icon}
            </span>
            <span className="font-medium text-sm">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <div className="size-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
            {CURRENT_USER?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <p className="text-sm font-bold truncate text-gray-900 dark:text-white">
              {CURRENT_USER?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {CURRENT_USER?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;