import React from 'react';

// Simple test constants to avoid import issues
const SIMPLE_USER = {
  name: "Alex Morgan",
  email: "alex@inventory.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format"
};

const SIMPLE_KPI_STATS = [
  {
    title: "Total Companies",
    value: "1,240",
    change: "+12%",
    changeType: "positive",
    icon: "apartment",
    iconColorClass: "text-green-500",
    iconBgClass: "bg-green-100",
    changeLabel: "vs last month"
  },
  {
    title: "Active",
    value: "1,100",
    change: "+5%",
    changeType: "positive",
    icon: "check_circle",
    iconColorClass: "text-emerald-400",
    iconBgClass: "bg-emerald-100",
    changeLabel: "vs last week"
  },
  {
    title: "Suspended",
    value: "45",
    change: "+2%",
    changeType: "negative",
    icon: "block",
    iconColorClass: "text-red-500",
    iconBgClass: "bg-red-100",
    changeLabel: "action needed"
  }
];

// Simple Sidebar Component
const SimpleSidebar: React.FC = () => {
  return (
    <aside className="w-72 hidden lg:flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full flex-shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl">
          I
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none tracking-tight text-gray-900 dark:text-white">Inventory SaaS</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Super Admin Panel</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto py-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-green-100 text-green-600 transition-colors cursor-pointer">
          <span className="material-symbols-outlined fill-1">dashboard</span>
          <span className="font-medium text-sm">Dashboard</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">apartment</span>
          <span className="font-medium text-sm">Companies</span>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <div className="size-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
            AM
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <p className="text-sm font-bold truncate text-gray-900 dark:text-white">{SIMPLE_USER.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{SIMPLE_USER.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Simple Header Component
const SimpleHeader: React.FC = () => {
  return (
    <header className="h-20 flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-20">
      <div className="hidden lg:flex flex-col">
        <h2 className="text-2xl font-bold dark:text-white tracking-tight">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, here's what's happening today.</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input 
            className="pl-10 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 w-64 lg:w-80 transition-all focus:outline-none" 
            placeholder="Search companies, users..." 
            type="text" 
          />
        </div>

        <button className="relative p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 size-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>
      </div>
    </header>
  );
};

// Simple KPI Card Component
const SimpleKPICard: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32 hover:border-green-500/50 transition-colors cursor-default">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{data.title}</p>
        <span className={`material-symbols-outlined ${data.iconColorClass} ${data.iconBgClass} p-1 rounded-lg text-[20px]`}>
          {data.icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.value}</p>
        <p className="text-xs font-medium text-green-500 flex items-center gap-1 mt-1">
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          {data.change} {data.changeLabel}
        </p>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <>
      <SimpleSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
        <SimpleHeader />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {SIMPLE_KPI_STATS.map((kpi, index) => (
              <SimpleKPICard key={index} data={kpi} />
            ))}
          </div>

          {/* Simple Chart Placeholder */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="col-span-1 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full">
              <h3 className="font-bold text-lg dark:text-white mb-4">Companies by Plan</h3>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Chart will be loaded here</p>
              </div>
            </div>
            
            <div className="col-span-1 xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-lg dark:text-white">Recent Companies</h3>
              </div>
              <div className="flex-1 p-6 flex items-center justify-center">
                <p className="text-gray-500">Table will be loaded here</p>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </>
  );
};

export default App;