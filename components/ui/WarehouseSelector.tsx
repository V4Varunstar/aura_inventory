import React from 'react';
import { Warehouse as WarehouseIcon, ChevronDown } from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

const WarehouseSelector: React.FC = () => {
  const { selectedWarehouse, warehouses, loading, selectWarehouse } = useWarehouse();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse shadow-sm">
        <WarehouseIcon size={20} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-500">Loading warehouses…</span>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <WarehouseIcon size={20} className="text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">No warehouse</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block w-full">
      <div className="group relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800 border-2 border-primary-200 dark:border-primary-700 rounded-xl shadow-md hover:shadow-lg hover:border-primary-400 dark:hover:border-primary-500 transition-all focus-within:ring-2 focus-within:ring-primary-500/30">
        <WarehouseIcon size={20} className="text-primary-700 dark:text-primary-300" />
        <span className="hidden sm:inline text-[11px] font-bold tracking-wider uppercase text-primary-700/80 dark:text-primary-200/80">
          Warehouse
        </span>
        <select
          value={selectedWarehouse?.id || ''}
          onChange={(e) => selectWarehouse(e.target.value)}
          className="bg-transparent w-full min-w-0 text-base font-semibold text-gray-900 dark:text-gray-100 border-none outline-none cursor-pointer pr-10 appearance-none"
        >
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name} {warehouse.code ? `(${warehouse.code})` : ''}
            </option>
          ))}
        </select>
        <ChevronDown size={18} className="text-primary-700/70 dark:text-primary-200/70 absolute right-4 pointer-events-none" />
      </div>
    </div>
  );
};

export default WarehouseSelector;
