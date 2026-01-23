import React from 'react';
import { Warehouse as WarehouseIcon } from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

const WarehouseSelector: React.FC = () => {
  const { selectedWarehouse, warehouses, loading, selectWarehouse } = useWarehouse();

  if (loading) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse">
        <WarehouseIcon size={18} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-500">Loading…</span>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="flex items-center gap-2 h-10 px-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
        <WarehouseIcon size={18} className="text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">No warehouse</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={selectedWarehouse?.id || ''}
        onChange={(e) => selectWarehouse(e.target.value)}
        className="h-10 min-w-[140px] px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-primary-50 dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
      >
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WarehouseSelector;
