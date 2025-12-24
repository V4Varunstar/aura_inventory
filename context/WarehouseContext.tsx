import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { Warehouse } from '../types';
import { getWarehouses } from '../services/firebaseService';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';

interface WarehouseContextType {
  selectedWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  loading: boolean;
  selectWarehouse: (warehouseId: string) => void;
  refreshWarehouses: () => Promise<void>;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { company } = useCompany();

  const refreshWarehouses = useCallback(async () => {
    if (!user || !company) {
      setWarehouses([]);
      setSelectedWarehouse(null);
      setLoading(false);
      return;
    }

    try {
      const fetchedWarehouses = await getWarehouses();
      const activeWarehouses = fetchedWarehouses.filter(w => !w.isDeleted);
      setWarehouses(activeWarehouses);

      // Auto-select first warehouse if none selected or current selection is invalid
      const savedWarehouseId = localStorage.getItem(`selected_warehouse_${company.id}`);
      
      if (savedWarehouseId) {
        const savedWarehouse = activeWarehouses.find(w => w.id === savedWarehouseId);
        if (savedWarehouse) {
          setSelectedWarehouse(savedWarehouse);
        } else if (activeWarehouses.length > 0) {
          setSelectedWarehouse(activeWarehouses[0]);
          localStorage.setItem(`selected_warehouse_${company.id}`, activeWarehouses[0].id);
        }
      } else if (activeWarehouses.length > 0) {
        setSelectedWarehouse(activeWarehouses[0]);
        localStorage.setItem(`selected_warehouse_${company.id}`, activeWarehouses[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  useEffect(() => {
    refreshWarehouses();
  }, [refreshWarehouses]);

  const selectWarehouse = useCallback((warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (warehouse && company) {
      setSelectedWarehouse(warehouse);
      localStorage.setItem(`selected_warehouse_${company.id}`, warehouseId);
      console.log('✅ Warehouse selected:', warehouse.name);
    }
  }, [warehouses, company]);

  const value = {
    selectedWarehouse,
    warehouses,
    loading,
    selectWarehouse,
    refreshWarehouses,
  };

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};
