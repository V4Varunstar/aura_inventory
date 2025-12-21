import React from 'react';
import OutwardStockForm from '../components/OutwardStockForm';

const OutwardInventoryPage: React.FC = () => {
    return (
        <div className="flex h-screen w-full">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between p-4 hidden md:flex">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-3 px-2 mb-4">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <span className="material-symbols-outlined text-2xl">inventory_2</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-gray-900 dark:text-white text-base font-bold leading-normal">InventoryApp</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">SaaS Platform</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group" href="#/dashboard">
                            <span className="material-symbols-outlined text-[24px] group-hover:text-blue-600 transition-colors">dashboard</span>
                            <p className="text-sm font-medium leading-normal">Dashboard</p>
                        </a>
                        
                        {/* Active State */}
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600" href="#/inventory">
                            <span className="material-symbols-outlined text-[24px] fill-1">inventory_2</span>
                            <p className="text-sm font-bold leading-normal">Inventory</p>
                        </a>
                        
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group" href="#/orders">
                            <span className="material-symbols-outlined text-[24px] group-hover:text-blue-600 transition-colors">shopping_cart</span>
                            <p className="text-sm font-medium leading-normal">Orders</p>
                        </a>
                        
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group" href="#/reports">
                            <span className="material-symbols-outlined text-[24px] group-hover:text-blue-600 transition-colors">bar_chart</span>
                            <p className="text-sm font-medium leading-normal">Reports</p>
                        </a>
                        
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group" href="#/settings">
                            <span className="material-symbols-outlined text-[24px] group-hover:text-blue-600 transition-colors">settings</span>
                            <p className="text-sm font-medium leading-normal">Settings</p>
                        </a>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 px-3 py-2 mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div 
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8" 
                        style={{
                            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAhnImgxwv0-Uy0MMe_zIRvPE-hpRgRWUQ7O5p_xtSAEpcIheO_ZJvEeByeXRKEXXmItSKMPRGdleSaW0tVJHYhnY198ocAlgyb4uLFqftAjr85vcXJ79L_hP5wXgoWtloDEbZdQJ6xgdHo4vTdtP0IvdceWatBaq7WMFiAWMHfA-Gb3x3_6eLz7j1KRY8dWglt8YFSNAYYZEmCgzbmn6O6o6MeW0m8hYhQyffudv5VqwAx8S9e9oN_jm44yytp_NIftywS1XADp_k")`
                        }}
                    />
                    <div className="flex flex-col">
                        <p className="text-gray-900 dark:text-white text-sm font-medium leading-normal">Alex Morgan</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-normal leading-normal">Warehouse Manager</p>
                    </div>
                </div>
            </aside>
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Navigation */}
                <header className="flex items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-white dark:bg-gray-800 flex-shrink-0 z-20">
                    <div className="flex items-center gap-4 text-gray-900 dark:text-white md:hidden">
                        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-lg font-bold leading-tight">InventoryApp</h2>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-4 text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-transparent focus-within:border-blue-500/50 transition-colors">
                            <span className="material-symbols-outlined text-gray-500 text-[20px]">warehouse</span>
                            <select className="bg-transparent border-none text-sm font-medium focus:ring-0 p-0 pr-6 text-gray-900 dark:text-white cursor-pointer">
                                <option>Main Warehouse (NYC)</option>
                                <option>West Coast Hub (LA)</option>
                                <option>European Center (Berlin)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex flex-1 justify-end gap-4 items-center">
                        <div className="flex gap-2">
                            <button className="flex items-center justify-center rounded-lg size-10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                                <span className="material-symbols-outlined text-[20px]">notifications</span>
                                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                            </button>
                            <button className="flex items-center justify-center rounded-lg size-10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">help</span>
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 md:px-10 lg:px-20 scroll-smooth">
                    <div className="max-w-[1000px] mx-auto flex flex-col gap-6 pb-20">
                        {/* Breadcrumbs */}
                        <nav className="flex flex-wrap gap-2 text-sm">
                            <a className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors font-medium" href="#/dashboard">Home</a>
                            <span className="text-gray-500 dark:text-gray-500 font-medium">/</span>
                            <a className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors font-medium" href="#/inventory">Inventory</a>
                            <span className="text-gray-500 dark:text-gray-500 font-medium">/</span>
                            <span className="text-gray-900 dark:text-white font-medium">Outward Stock</span>
                        </nav>
                        
                        {/* Page Heading */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">Record Outward Stock</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-base font-normal">Log outgoing inventory shipments to various destinations and update stock levels.</p>
                        </div>
                        
                        {/* Alert / Notification Placeholder */}
                        {/* Uncomment to show notifications */}
                        {/* <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg flex items-start gap-3">
                            <span className="material-symbols-outlined text-[20px] mt-0.5">info</span>
                            <div className="text-sm">
                                <p className="font-bold">Weekly Audit Reminder</p>
                                <p>Please ensure all pending offline shipments are recorded before Friday 5 PM.</p>
                            </div>
                        </div> */}
                        
                        {/* Main Form Card */}
                        <OutwardStockForm 
                            onSuccess={() => {
                                console.log('Outward stock recorded successfully');
                            }}
                        />
                        
                        {/* Footer Info */}
                        <div className="text-center text-xs text-gray-400 pb-4">
                            <p>InventoryApp Inc. © 2024. All rights reserved.</p>
                        </div>
                    </div>
                </main>
            </div>
            
            {/* Success Toast Notification (Hidden by default) */}
            {/* <div className="absolute bottom-8 right-8 z-50 animate-bounce-in hidden">
                <div className="flex items-center w-full max-w-xs p-4 space-x-3 text-gray-500 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-l-4 border-green-500" role="alert">
                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200 rounded-lg">
                        <span className="material-symbols-outlined text-[20px]">check</span>
                    </div>
                    <div className="ml-3 text-sm font-normal text-gray-800 dark:text-gray-200">
                        <span className="font-semibold block">Success!</span>
                        Shipment recorded successfully.
                    </div>
                    <button aria-label="Close" className="ml-auto -mx-1.5 -my-1.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8" type="button">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            </div> */}
        </div>
    );
};

export default OutwardInventoryPage;