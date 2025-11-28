
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import DeleteWarehouseModal from '../components/DeleteWarehouseModal';
import { Warehouse } from '../types';
import { getWarehouses, addWarehouse, updateWarehouse, deleteWarehouse } from '../services/firebaseService';
import { warehouseHasStock, getWarehouseStock } from '../utils/stockUtils';
import { useToast } from '../context/ToastContext';
import { useCompany } from '../context/CompanyContext';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const WarehouseForm: React.FC<{
  warehouse: Partial<Warehouse> | null;
  onSave: (warehouse: Partial<Warehouse>) => void;
  onCancel: () => void;
}> = ({ warehouse, onSave, onCancel }) => {
  const [formData, setFormData] = useState(warehouse || {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="name" label="Warehouse Name" value={formData.name || ''} onChange={handleChange} required />
      <Input name="location" label="Location" value={formData.location || ''} onChange={handleChange} required />
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{warehouse?.id ? 'Update' : 'Create'} Warehouse</Button>
      </div>
    </form>
  );
};


const Warehouses: React.FC = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Partial<Warehouse> | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        warehouse: Warehouse | null;
        hasStock: boolean;
        stockDetails: { sku: string; quantity: number }[];
    }>({ isOpen: false, warehouse: null, hasStock: false, stockDetails: [] });
    const { addToast } = useToast();
    const { company } = useCompany();

    useEffect(() => {
        const fetchWarehouses = async () => {
            setLoading(true);
            try {
                setWarehouses(await getWarehouses());
            } catch(e) {
                addToast('Failed to fetch warehouses', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchWarehouses();
    }, [addToast]);
    
    const handleOpenModal = (warehouse?: Warehouse) => {
        setEditingWarehouse(warehouse || {});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingWarehouse(null);
        setIsModalOpen(false);
    };
    
    const handleSaveWarehouse = async (data: Partial<Warehouse>) => {
        try {
            if (data.id) {
                const updated = await updateWarehouse(data.id, data);
                setWarehouses(warehouses.map(w => w.id === updated.id ? updated : w));
                addToast('Warehouse updated', 'success');
            } else {
                const created = await addWarehouse(data);
                setWarehouses([...warehouses, created]);
                addToast('Warehouse created', 'success');
            }
            handleCloseModal();
        } catch (e) {
            addToast('Failed to save warehouse', 'error');
        }
    };
    
    const handleDeleteClick = async (warehouse: Warehouse) => {
        try {
            // Check if warehouse has stock
            const hasStock = await warehouseHasStock(company?.id || '', warehouse.id);
            
            let stockDetails: { sku: string; quantity: number }[] = [];
            if (hasStock) {
                // Get detailed stock breakdown
                stockDetails = await getWarehouseStock(company?.id || '', warehouse.id) as any;
            }
            
            setDeleteModal({
                isOpen: true,
                warehouse,
                hasStock,
                stockDetails,
            });
        } catch (error) {
            addToast('Failed to check warehouse status', 'error');
        }
    };
    
    const handleConfirmDelete = async (reason: string) => {
        if (!deleteModal.warehouse) return;
        
        try {
            await deleteWarehouse(deleteModal.warehouse.id, reason);
            setWarehouses(warehouses.filter(w => w.id !== deleteModal.warehouse!.id));
            addToast('Warehouse deleted successfully', 'success');
            setDeleteModal({ isOpen: false, warehouse: null, hasStock: false, stockDetails: [] });
        } catch (error: any) {
            addToast(error.message || 'Failed to delete warehouse', 'error');
            throw error;
        }
    };
    
    const columns = [
        { header: 'Name', accessor: 'name' as keyof Warehouse },
        { header: 'Location', accessor: 'location' as keyof Warehouse },
        { header: 'Created At', accessor: 'createdAt' as keyof Warehouse, render: (item: Warehouse) => new Date(item.createdAt).toLocaleDateString() },
        {
          header: 'Actions',
          accessor: 'id' as keyof Warehouse,
          render: (item: Warehouse) => (
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost" onClick={() => handleOpenModal(item)}><Edit size={16} /></Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteClick(item)}><Trash2 size={16} /></Button>
            </div>
          ),
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Warehouses</h1>
                <Button onClick={() => handleOpenModal()} leftIcon={<PlusCircle />}>Add Warehouse</Button>
            </div>
            <Card>
                {loading ? <p>Loading warehouses...</p> : <Table columns={columns} data={warehouses} />}
            </Card>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingWarehouse?.id ? 'Edit Warehouse' : 'Add New Warehouse'}>
                <WarehouseForm warehouse={editingWarehouse} onSave={handleSaveWarehouse} onCancel={handleCloseModal} />
            </Modal>
            
            <DeleteWarehouseModal
                isOpen={deleteModal.isOpen}
                warehouseName={deleteModal.warehouse?.name || ''}
                warehouseId={deleteModal.warehouse?.id || ''}
                hasStock={deleteModal.hasStock}
                stockDetails={deleteModal.stockDetails}
                onClose={() => setDeleteModal({ isOpen: false, warehouse: null, hasStock: false, stockDetails: [] })}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default Warehouses;
