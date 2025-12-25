import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Warehouse } from '../types';
import { useAuth } from './AuthContext';
import { useSafeCompany } from './SafeCompanyContext';

interface SafeWarehouseContextType {
  selectedWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
  selectWarehouse: (warehouseId: string) => void;
}

const SafeWarehouseContext = createContext<SafeWarehouseContextType>({
  selectedWarehouse: null,
  warehouses: [],
  loading: false,
  error: null,
  selectWarehouse: () => {}
});

export const SafeWarehouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { company } = useSafeCompany();

  useEffect(() => {
    if (!user || !company) {
      setWarehouses([]);
      setSelectedWarehouse(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      // Get warehouses from localStorage or create default
      const storedWarehouses = localStorage.getItem(`warehouses_${company.orgId}`);
      
      if (storedWarehouses) {
        const parsed = JSON.parse(storedWarehouses);
        const active = parsed.filter((w: Warehouse) => !w.isDeleted);
        setWarehouses(active);
        
        // Auto-select first warehouse
        if (active.length > 0 && !selectedWarehouse) {
          setSelectedWarehouse(active[0]);
        }
      } else {
        // Create default warehouse
        const defaultWarehouse: Warehouse = {
          id: 'default-warehouse',
          name: 'Main Warehouse',
          location: 'Default Location',
          orgId: company.orgId,
          createdAt: new Date().toISOString(),
          isDeleted: false
        };
        
        setWarehouses([defaultWarehouse]);
        setSelectedWarehouse(defaultWarehouse);
        
        // Save to localStorage
        localStorage.setItem(`warehouses_${company.orgId}`, JSON.stringify([defaultWarehouse]));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading warehouses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  }, [user, company]);

  const selectWarehouse = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (warehouse) {
      setSelectedWarehouse(warehouse);
      if (company) {
        localStorage.setItem(`selected_warehouse_${company.orgId}`, warehouseId);
      }
    }
  };

  const value = {
    selectedWarehouse,
    warehouses,
    loading,
    error,
    selectWarehouse
  };

  return (
    <SafeWarehouseContext.Provider value={value}>
      {children}
    </SafeWarehouseContext.Provider>
  );
};

export const useSafeWarehouse = () => {
  const context = useContext(SafeWarehouseContext);
  if (context === undefined) {
    throw new Error('useSafeWarehouse must be used within SafeWarehouseProvider');
  }
  return context;
};
