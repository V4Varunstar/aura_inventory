import React from 'react';

const Sidebar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  return (
    <aside className="w-72 hidden lg:flex flex-col border-r border-gray-200 dark:border-border-dark bg-white dark:bg-[#0d1812] h-full flex-shrink-0 transition-colors">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-800 flex items-center justify-center text-background-dark font-bold text-xl">
          I
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none tracking-tight">Inventory SaaS</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Super Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto py-4">
        <button className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors bg-primary/10 text-primary">
          <span className="text-xl">📊</span>
          <span className="font-medium text-sm">Dashboard</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-highlight">
          <span className="text-xl">🏢</span>
          <span className="font-medium text-sm">Companies</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-highlight">
          <span className="text-xl">👥</span>
          <span className="font-medium text-sm">Users</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-border-dark">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-surface-highlight">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
            AM
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-sm font-bold truncate text-gray-900 dark:text-white">Alex Morgan</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">alex@inventory.com</p>
          </div>
          <button 
            onClick={onLogout}
            className="ml-auto text-gray-500 hover:text-gray-900 dark:hover:text-white"
            title="Logout"
          >
            <span className="text-xl">🚪</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
