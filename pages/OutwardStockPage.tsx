import React from 'react';
import OutwardStockForm from '../components/OutwardStockForm';

const OutwardStockPage: React.FC = () => {
    return (
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 md:px-10 lg:px-20 scroll-smooth">
            <div className="max-w-[1000px] mx-auto flex flex-col gap-6 pb-20">
                {/* Breadcrumbs */}
                <nav className="flex flex-wrap gap-2 text-sm">
                    <a className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors font-medium" href="#/dashboard">
                        Home
                    </a>
                    <span className="text-gray-500 dark:text-gray-500 font-medium">/</span>
                    <a className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors font-medium" href="#/outward">
                        Inventory
                    </a>
                    <span className="text-gray-500 dark:text-gray-500 font-medium">/</span>
                    <span className="text-gray-900 dark:text-white font-medium">Outward Stock</span>
                </nav>
                
                {/* Page Heading */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                        Record Outward Stock
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal">
                        Log outgoing inventory shipments to various destinations and update stock levels.
                    </p>
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
                        // Handle success - could navigate back or show success message
                        console.log('Outward stock recorded successfully');
                    }}
                />
                
                {/* Footer Info */}
                <div className="text-center text-xs text-gray-400 pb-4">
                    <p>InventoryApp Inc. © 2024. All rights reserved.</p>
                </div>
            </div>
        </main>
    );
};

export default OutwardStockPage;