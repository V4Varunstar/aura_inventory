import React from 'react';

const DashboardHTML: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-darker border-r border-gray-800 flex flex-col shrink-0 transition-all duration-300">
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-800">
          <div className="bg-primary/20 p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-primary text-2xl">inventory_2</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold leading-none tracking-tight">Acme Corp</h1>
            <p className="text-text-secondary text-xs font-normal mt-1">IMS Portal</p>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          {/* Active Item */}
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white group transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 group transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">package_2</span>
            <span className="text-sm font-medium">Products</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 group transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">call_received</span>
            <span className="text-sm font-medium">Inward</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 group transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">call_made</span>
            <span className="text-sm font-medium">Outward</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 group transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">balance</span>
            <span className="text-sm font-medium">Stock Adjustment</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 group transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">warehouse</span>
            <span className="text-sm font-medium">Warehouses</span>
          </a>
          <div className="my-2 border-t border-gray-800"></div>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 group transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">description</span>
            <span className="text-sm font-medium">Reports</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/5 group transition-colors" href="#">
            <span className="material-symbols-outlined text-xl">analytics</span>
            <span className="text-sm font-medium">Analytics</span>
          </a>
        </nav>
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-text-secondary hover:text-white hover:bg-white/5 transition-colors text-left">
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 bg-surface-darker/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-20">
          {/* Left: Breadcrumbs / Title */}
          <div className="flex items-center gap-4">
            <button className="md:hidden text-text-secondary hover:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-white text-lg font-semibold tracking-tight">Overview</h2>
          </div>
          {/* Right: Actions */}
          <div className="flex items-center gap-6">
            {/* Warehouse Selector */}
            <div className="relative hidden sm:flex items-center">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">store</span>
              </span>
              <select className="bg-surface-dark border border-gray-700 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-48 pl-10 p-2 appearance-none cursor-pointer hover:bg-gray-800 transition-colors">
                <option>Main Warehouse (NY)</option>
                <option>West Coast Hub (LA)</option>
                <option>European Center (Berlin)</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </span>
            </div>
            {/* Notifications */}
            <button className="relative text-text-secondary hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full border border-surface-darker"></span>
            </button>
            {/* Profile */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-800">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">Alex Morgan</p>
                <p className="text-xs text-text-secondary">Logistics Manager</p>
              </div>
              <button className="relative">
                <div className="w-9 h-9 rounded-full bg-cover bg-center border border-gray-700" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBHiJJDifA7898WsMrwgorXjDvLODJ0TtilMwj6F3GvE7urujsABDMcxXIzp6IRcCyW0xTFCyre2oq9uAGhKT68WtObNkEBUrV2kTWHHLq0kNa8Kk206Xncr2saEeY_IyYjkxKxNKyyuVdlDDoYNDsFN0QQQiK_HZ4ZHpzleIxRwbCOU0aeYrjGL8EjrVWisqbOtwqof2E3mw7Zg3oCDawNdRNhamKZOYeoFJbjWBBRGSzm_PI5uipH9htjUYP1AO1NbWVfjYB0hxk)'}}></div>
              </button>
            </div>
          </div>
        </header>
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1 */}
              <div className="bg-surface-dark rounded-xl p-5 border border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-primary">paid</span>
                </div>
                <p className="text-text-secondary text-sm font-medium mb-1">Total Stock Value</p>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">$1,204,500</h3>
                <div className="flex items-center gap-1 text-accent-green text-sm font-medium">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span>+5.2%</span>
                  <span className="text-text-secondary font-normal ml-1">vs last month</span>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-surface-dark rounded-xl p-5 border border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-white">inventory_2</span>
                </div>
                <p className="text-text-secondary text-sm font-medium mb-1">Units in Stock</p>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">45,200</h3>
                <div className="flex items-center gap-1 text-accent-green text-sm font-medium">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span>+1.2%</span>
                  <span className="text-text-secondary font-normal ml-1">vs last month</span>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-surface-dark rounded-xl p-5 border border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-accent-blue">input</span>
                </div>
                <p className="text-text-secondary text-sm font-medium mb-1">Today's Inward</p>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">120</h3>
                <div className="flex items-center gap-1 text-accent-green text-sm font-medium">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span>+8%</span>
                  <span className="text-text-secondary font-normal ml-1">vs yesterday</span>
                </div>
              </div>
              {/* Card 4 */}
              <div className="bg-surface-dark rounded-xl p-5 border border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-accent-purple">output</span>
                </div>
                <p className="text-text-secondary text-sm font-medium mb-1">Today's Outward</p>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">340</h3>
                <div className="flex items-center gap-1 text-accent-green text-sm font-medium">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  <span>+15%</span>
                  <span className="text-text-secondary font-normal ml-1">vs yesterday</span>
                </div>
              </div>
              {/* Card 5 (Alert) */}
              <div className="bg-surface-dark rounded-xl p-5 border border-gray-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-6xl text-accent-red">warning</span>
                </div>
                <p className="text-text-secondary text-sm font-medium mb-1">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">12</h3>
                <div className="flex items-center gap-1 text-accent-red text-sm font-medium">
                  <span className="material-symbols-outlined text-base">priority_high</span>
                  <span>Action Needed</span>
                </div>
              </div>
            </div>
            {/* Main Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Trend Chart */}
              <div className="lg:col-span-2 bg-surface-dark rounded-xl border border-gray-800 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Inward vs Outward Trend</h3>
                    <p className="text-sm text-text-secondary">Movement over the last 30 days</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-blue"></span> Inward
                    </span>
                    <span className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-purple"></span> Outward
                    </span>
                  </div>
                </div>
                {/* Chart Visualization Placeholder */}
                <div className="flex-1 min-h-[300px] w-full relative">
                  {/* SVG Chart */}
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 300">
                    {/* Grid Lines */}
                    <line stroke="#374151" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="250" y2="250"></line>
                    <line stroke="#374151" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="190" y2="190"></line>
                    <line stroke="#374151" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="130" y2="130"></line>
                    <line stroke="#374151" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="800" y1="70" y2="70"></line>
                    {/* Area Gradients */}
                    <defs>
                      <linearGradient id="gradBlue" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" style={{stopColor:'#3b82f6',stopOpacity:0.2}}></stop>
                        <stop offset="100%" style={{stopColor:'#3b82f6',stopOpacity:0}}></stop>
                      </linearGradient>
                      <linearGradient id="gradPurple" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" style={{stopColor:'#8b5cf6',stopOpacity:0.2}}></stop>
                        <stop offset="100%" style={{stopColor:'#8b5cf6',stopOpacity:0}}></stop>
                      </linearGradient>
                    </defs>
                    {/* Data Line 1 (Inward - Blue) */}
                    <path d="M0 200 C 100 180, 200 220, 300 150 S 500 100, 600 120 S 700 80, 800 100 V 300 H 0 Z" fill="url(#gradBlue)"></path>
                    <path d="M0 200 C 100 180, 200 220, 300 150 S 500 100, 600 120 S 700 80, 800 100" fill="none" stroke="#3b82f6" strokeWidth="3"></path>
                    {/* Data Line 2 (Outward - Purple) */}
                    <path d="M0 240 C 100 230, 200 180, 300 200 S 500 160, 600 140 S 700 40, 800 60 V 300 H 0 Z" fill="url(#gradPurple)"></path>
                    <path d="M0 240 C 100 230, 200 180, 300 200 S 500 160, 600 140 S 700 40, 800 60" fill="none" stroke="#8b5cf6" strokeWidth="3"></path>
                  </svg>
                  {/* X Axis Labels */}
                  <div className="absolute bottom-0 w-full flex justify-between text-xs text-text-secondary px-2 mt-2">
                    <span>Day 1</span>
                    <span>Day 5</span>
                    <span>Day 10</span>
                    <span>Day 15</span>
                    <span>Day 20</span>
                    <span>Day 25</span>
                    <span>Day 30</span>
                  </div>
                </div>
              </div>
              {/* Category Pie Chart */}
              <div className="bg-surface-dark rounded-xl border border-gray-800 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-1">Category Sales</h3>
                <p className="text-sm text-text-secondary mb-6">Sales distribution by category</p>
                <div className="flex-1 flex items-center justify-center relative">
                  {/* Donut Chart SVG */}
                  <svg height="200" viewBox="0 0 100 100" width="200">
                    <circle cx="50" cy="50" fill="none" r="40" stroke="#1f2937" strokeWidth="12"></circle>
                    {/* Segments: Circumference = 2 * pi * 40 = ~251 */}
                    {/* Segment 1: 40% (Electronics) - Blue */}
                    <circle cx="50" cy="50" fill="none" r="40" stroke="#3b82f6" strokeDasharray="100 151" strokeDashoffset="0" strokeWidth="12" transform="rotate(-90 50 50)"></circle>
                    {/* Segment 2: 30% (Home) - Purple */}
                    <circle cx="50" cy="50" fill="none" r="40" stroke="#8b5cf6" strokeDasharray="75 176" strokeDashoffset="-100" strokeWidth="12" transform="rotate(-90 50 50)"></circle>
                    {/* Segment 3: 30% (Apparel) - Teal */}
                    <circle cx="50" cy="50" fill="none" r="40" stroke="#14b8a6" strokeDasharray="76 175" strokeDashoffset="-175" strokeWidth="12" transform="rotate(-90 50 50)"></circle>
                    <text className="fill-white text-[12px] font-bold" dy="0.3em" textAnchor="middle" x="50" y="50">Total</text>
                  </svg>
                </div>
                {/* Legend */}
                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-accent-blue"></span>
                      <span className="text-text-secondary">Electronics</span>
                    </div>
                    <span className="font-medium text-white">40%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-accent-purple"></span>
                      <span className="text-text-secondary">Home &amp; Living</span>
                    </div>
                    <span className="font-medium text-white">30%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                      <span className="text-text-secondary">Apparel</span>
                    </div>
                    <span className="font-medium text-white">30%</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Secondary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
              {/* Channel Wise Outward */}
              <div className="bg-surface-dark rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Channel Outward</h3>
                    <p className="text-sm text-text-secondary">Distribution by sales channel</p>
                  </div>
                  <button className="text-text-secondary hover:text-white">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
                <div className="space-y-5">
                  {/* Amazon */}
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-white font-medium">Amazon</span>
                      <span className="text-text-secondary">45%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                  {/* Flipkart */}
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-white font-medium">Flipkart</span>
                      <span className="text-text-secondary">30%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                  {/* Offline */}
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-white font-medium">Offline Retail</span>
                      <span className="text-text-secondary">25%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div className="bg-accent-green h-2.5 rounded-full" style={{width: '25%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Fast vs Slow Moving SKUs */}
              <div className="bg-surface-dark rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Inventory Velocity</h3>
                    <p className="text-sm text-text-secondary">Top movers &amp; stagnant items</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {/* Fast Moving */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-accent-green uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">fast_forward</span>
                      Fast Moving
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-800 bg-cover bg-center" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDk9RxGaXPsCRBrfKKSCkW07HVWw-MdimcBahtfyYVY9j0UXb3MIHONwFjK3HZjbQqlgwONu8zGsbW_VblJRke1u059X5wOVpX7aH7la5FCjBDDWqCQoRi_hJvBKhJvG4TT0Opi-mIa7twK6v4_1BSbn5wJlQTKGiCwLLKx1fzeUMapH2uWaCW3JYku1NuxaCcl8yMXxdu83U9bXJoM4LJzlhY7LvMH2vSez2bLa5yOBFX3gCOwhyTM8gz36ancdfHoo7KSCP2xt5U)'}}></div>
                        <div>
                          <p className="text-sm font-medium text-white">Smart Watch V2</p>
                          <p className="text-xs text-text-secondary">240 units/week</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-800 bg-cover bg-center" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDi89Tyv4TdWI0OUEKngvzoqY7jYWLni-Zt-qs7xv3lHSYfvjDKOIUnOnkKFdee_06vuR6cl7WHup24ww1WSYCNdcts9R1x4jhrwb7Uid21ptUtYM8Dco8KQJnvmbeDwaC-O4Ky_vTRBI-bQK3XheNdQwZAWK5ucjK2cysOaRh5JjAzvV4xrI6fSGivOM4DLHTvJpW4g-l4Z-oCUiHlxnMJ8_W0KWvjXKF_pXkke-FdLPJ9w0Dj574euG38gDnbzFOcMZLSxotcC0I)'}}></div>
                        <div>
                          <p className="text-sm font-medium text-white">Wireless Buds</p>
                          <p className="text-xs text-text-secondary">185 units/week</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-800 bg-cover bg-center" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBAuQ9gu8g42KvxJBqFgkHYgDXIqPYsDtuTa0n5bonrcJnFP0oe_7DUAwXA9CcHsIqw6TwYr6QD4-3sKcqBKmU4DnZ7cv242t7sXxsncgLxKEUPPAnu6egilfU1vfzLvCo2qg3Xr-40nZ-g3iICNzKEH50ET5e3ZFLrXZA5D64zsE6Mjcx4Q2Rhk4dTMD9-h_sWr64_eEUIALNalAQsFMn2U09LxpyarDC8ceMH_O0a5soajegmc23uEc13YyvE_M5pjx_putVYxc)'}}></div>
                        <div>
                          <p className="text-sm font-medium text-white">Sport Runner</p>
                          <p className="text-xs text-text-secondary">150 units/week</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  {/* Slow Moving */}
                  <div className="space-y-4 pl-6 border-l border-gray-700">
                    <h4 className="text-xs font-bold text-accent-red uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                      Slow Moving
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-800 bg-cover bg-center" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuDmTw0XFwowX4uAjKiJnO2lIrHmsFhG4G0ht-5YaovmTm3SkOfcIlD4AKcRYtgptAf-6eC5sHUCYRmm5aqabABFWdbViZ_IBCoqO0YDuOKSkVkkWrIHiBefzCSEQ0ylYCf07z3LYLxRgCUMlCOCqW0JirJbIUIF51vGFzbyBW-KCOI6hwBVsqjFY2R998LJ_VMImhHdTM-hsygUKikjJHfQXI1oLKznhykhe54z4DBGD6dM_0WeEzzk0hHVnw8oawWlmrUP16ijyhk)'}}></div>
                        <div>
                          <p className="text-sm font-medium text-white">Legacy Audio</p>
                          <p className="text-xs text-text-secondary">2 units/week</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-800 bg-cover bg-center" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCBCCIcHfbc3Bc0hjhQ-Va7lRolcK6XPpPsuTq-lkZsKhLgk1YY0U9XE00PP8sQEBYDZo7eczuN1pGA_as9O7_qKWT-NnuVXBUSWlkVneIbYDrZcyF2np14nAPTRLwS6mRSDOYYEHYIdGtPBor5uyhqzJ99f0De8aldbJ5c8R4Bn9HwGS0s-TPRzH7CZj8xkae4URwgf83SCWvuEKjspGX2YwP0PF76H0USh7X1H_Nkufadwv-NDIjCda2HCintd2CgTqdq4BvShbk)'}}></div>
                        <div>
                          <p className="text-sm font-medium text-white">Cam Pro X1</p>
                          <p className="text-xs text-text-secondary">0 units/week</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-800 bg-cover bg-center" style={{backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBcJaUM9rMcX3OzcgWd53CosOHEYpa78EZ6NdxIsZVR3I42iwsjRoPIcYcTYl1R5N1zacIIfJPuM-ksjYLfXm4iDf29Qj1Km5xbhxv6fyQqnCl9-sGnjhojp8Fb-i6Bt5EwFMFI2z79VjWSM1yy0UpIRhLVkdho0skwVoCp0zXrH8TOE88VtMg9FVUJfL-vI1tmlP3O8IEGG-wRSHecIOIA8QAW98iJvMwf5lHi8pq-yc9nhpvlrYiSr3s1_-gS6nGC7BjXmuhZXCw)'}}></div>
                        <div>
                          <p className="text-sm font-medium text-white">Summer Shades</p>
                          <p className="text-xs text-text-secondary">5 units/week</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardHTML;