import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InwardStockForm } from './components/InwardStockForm';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen w-full flex bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col border-r border-gray-200 dark:border-border-dark bg-white dark:bg-[#0f172a]">
          <SidebarContent /> 
        </div>
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header toggleSidebar={toggleSidebar} />
        <InwardStockForm />
      </main>
    </div>
  );
};

// Extracted for reuse in mobile/desktop
const SidebarContent = () => (
  <>
      <div className="p-6 flex items-center gap-3">
        <div className="size-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
          T
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900 dark:text-white">TechFlow</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Company Portal</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto py-4">
        <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-2">Main</p>
        
        <a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-highlight hover:text-gray-900 dark:hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:fill-1 text-[22px]">dashboard</span>
          <span className="font-medium text-sm">Dashboard</span>
        </a>
        
        <div className="relative">
          <a className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-primary/10 text-primary dark:text-indigo-400 transition-colors" href="#">
            <span className="material-symbols-outlined fill-1 text-[22px]">move_to_inbox</span>
            <span className="font-medium text-sm">Inward Stock</span>
          </a>
        </div>
        
        <a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-highlight hover:text-gray-900 dark:hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:fill-1 text-[22px]">outbox</span>
          <span className="font-medium text-sm">Outward Stock</span>
        </a>
        
        <a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-highlight hover:text-gray-900 dark:hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:fill-1 text-[22px]">inventory_2</span>
          <span className="font-medium text-sm">Inventory</span>
        </a>
        
        <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-6">Management</p>
        
        <a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-highlight hover:text-gray-900 dark:hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:fill-1 text-[22px]">description</span>
          <span className="font-medium text-sm">Reports</span>
        </a>
        
        <a className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-highlight hover:text-gray-900 dark:hover:text-white transition-colors group" href="#">
          <span className="material-symbols-outlined group-hover:fill-1 text-[22px]">settings</span>
          <span className="font-medium text-sm">Settings</span>
        </a>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-border-dark">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-highlight transition-colors cursor-pointer">
          <div className="size-9 rounded-full bg-cover bg-center ring-2 ring-gray-100 dark:ring-surface-highlight" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB1CNXyVRpTAwJb6mIXooQVTULMcNE-UA1zhZfBBVSYSLPWIyZt5v_fAd1W4CBpNs15Ons4Cq-SrMDfLu2q2te-Oru01ygChzn1KQc63m391Gic64edRk7Fb_O_BcsRPC--btMRdIPZdhimGevYYFAUmzBlLPeXhGwivafMYw7tVt9ZKUuoQfr_HJ40phcKanQyFu2q_Uc2i40_QT6magUq5URtZHPYLc2WpO9FL0hy70xlSdjODFzLHMPY7Kl6e6l2BnrQ85eDbOM')" }}></div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold truncate text-gray-900 dark:text-white">Sarah Jenkins</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Logistics Manager</p>
          </div>
        </div>
      </div>
  </>
)

export default App;