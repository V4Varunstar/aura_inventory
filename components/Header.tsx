import React from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="h-18 min-h-[4.5rem] flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-border-dark bg-white dark:bg-[#0f172a] sticky top-0 z-20">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-gray-500 dark:text-gray-300" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-lg font-bold dark:text-white">Inward Stock</h1>
      </div>
      
      <div className="hidden lg:flex items-center gap-4">
        <h2 className="text-xl font-bold dark:text-white tracking-tight">Inward Inventory Form</h2>
        <div className="h-6 w-px bg-gray-200 dark:bg-border-dark"></div>
        <div className="relative group">
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-indigo-400 transition-colors">
            <span className="material-symbols-outlined text-[20px]">warehouse</span>
            Main Warehouse - NY
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
          <input 
            className="pl-9 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-surface-highlight border-none text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary w-64 transition-all outline-none" 
            placeholder="Search orders, SKUs..." 
            type="text"
          />
        </div>
        <button className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-highlight transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
        </button>
      </div>
    </header>
  );
};