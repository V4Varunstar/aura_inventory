import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-20 flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-border-dark bg-white/50 dark:bg-[#112117]/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-gray-500 dark:text-gray-300">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>
      </div>

      <div className="hidden lg:flex flex-col">
        <h2 className="text-2xl font-bold dark:text-white tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, here's what's happening today.</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
            search
          </span>
          <input 
            className="pl-10 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-surface-highlight border-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary w-64 lg:w-80 transition-all focus:outline-none" 
            placeholder="Search companies, users..." 
            type="text" 
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-highlight transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;