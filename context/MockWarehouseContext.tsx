import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Warehouse } from '../types';
import { useAuth } from './AuthContext';

interface MockWarehouseContextType {
  selectedWarehouse: Warehouse | null;
  warehouses: Warehouse[];
  loading: boolean;
  selectWarehouse: (id: string) => void;
  refreshWarehouses: () => Promise<void>;
}

const MockWarehouseContext = createContext<MockWarehouseContextType | undefined>(undefined);

export const MockWarehouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  useEffect(() => {
    if (user) {
      const mockWarehouse: Warehouse = {
        id: 'mock-warehouse',
        name: 'Main Warehouse',
        location: 'Default Location',
        orgId: user.orgId || 'mock-org',
        createdAt: new Date().toISOString(),
        isDeleted: false
      };
      setWarehouses([mockWarehouse]);
      setSelectedWarehouse(mockWarehouse);
    } else {
      setWarehouses([]);
      setSelectedWarehouse(null);
    }
  }, [user]);

  const value = {
    selectedWarehouse,
    warehouses,
    loading: false,
    selectWarehouse: (id: string) => {
      const wh = warehouses.find(w => w.id === id);
      if (wh) setSelectedWarehouse(wh);
    },
    refreshWarehouses: async () => {}
  };

  return <MockWarehouseContext.Provider value={value}>{children}</MockWarehouseContext.Provider>;
};

export const useWarehouse = () => {
  const context = useContext(MockWarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within MockWarehouseProvider');
  }
  return context;
};
