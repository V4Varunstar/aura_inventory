import React from 'react';
import { Warehouse as WarehouseIcon, ChevronDown } from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

const WarehouseSelector: React.FC = () => {
  const { selectedWarehouse, warehouses, loading, selectWarehouse } = useWarehouse();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
        <WarehouseIcon size={18} className="text-gray-400" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <WarehouseIcon size={18} className="text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm text-yellow-700 dark:text-yellow-300">No Warehouse</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
        <WarehouseIcon size={18} className="text-primary-600 dark:text-primary-400" />
        <select
          value={selectedWarehouse?.id || ''}
          onChange={(e) => selectWarehouse(e.target.value)}
          className="bg-transparent text-sm font-medium text-gray-800 dark:text-gray-200 border-none outline-none cursor-pointer pr-6 appearance-none"
        >
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name} {warehouse.code ? `(${warehouse.code})` : ''}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 absolute right-3 pointer-events-none" />
      </div>
    </div>
  );
};

export default WarehouseSelector;
