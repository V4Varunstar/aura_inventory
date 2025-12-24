import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import EANScanner from '../components/ean/EANScanner';
import { useToast } from '../context/ToastContext';
import { useWarehouse } from '../context/WarehouseContext';
import { useAuth } from '../context/AuthContext';
import { Adjustment, Product } from '../types';
import { getProducts } from '../services/firebaseService';
import { TrendingUp, TrendingDown, Package } from 'lucide-react';

const StockAdjustmentForm: React.FC<{
  onSave: (adjustment: Partial<Adjustment>) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Adjustment>>({
    adjustmentType: 'Increase',
    quantity: 0,
    reason: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEANScanner, setShowEANScanner] = useState(false);
  const { selectedWarehouse } = useWarehouse();
  const { addToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      addToast('Failed to fetch products', 'error');
    }
  };

  const handleEANScan = (ean: string) => {
    const product = products.find(p => p.ean === ean);
    if (product) {
      setSelectedProduct(product);
      addToast(`Product found: ${product.name}`, 'success');
      setShowEANScanner(false);
    } else {
      addToast('Product not found with this EAN', 'error');
    }
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const product = products.find(p => p.id === e.target.value);
    setSelectedProduct(product || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      addToast('Please select a product', 'error');
      return;
    }

    if (!selectedWarehouse) {
      addToast('Please select a warehouse', 'error');
      return;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      addToast('Please enter a valid quantity', 'error');
      return;
    }

    if (!formData.reason?.trim()) {
      addToast('Please enter a reason for adjustment', 'error');
      return;
    }

    const adjustment: Partial<Adjustment> = {
      productId: selectedProduct.id,
      sku: selectedProduct.sku,
      productName: selectedProduct.name,
      quantity: formData.quantity,
      adjustmentType: formData.adjustmentType,
      type: formData.adjustmentType === 'Increase' ? 'Found' : 'Damage',
      reason: formData.reason,
      warehouseId: selectedWarehouse.id,
      warehouseName: selectedWarehouse.name,
      notes: formData.notes,
    };

    onSave(adjustment);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ean?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Warehouse:</strong> {selectedWarehouse?.name || 'None Selected'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Product *
        </label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowEANScanner(!showEANScanner)}
          >
            {showEANScanner ? 'Hide' : 'Scan EAN'}
          </Button>
        </div>
        
        {showEANScanner && (
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <EANScanner onScan={handleEANScan} />
          </div>
        )}

        {selectedProduct ? (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="font-medium text-green-800 dark:text-green-200">
              {selectedProduct.name}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              SKU: {selectedProduct.sku} {selectedProduct.ean && `• EAN: ${selectedProduct.ean}`}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProduct(null)}
              className="mt-2"
            >
              Change Product
            </Button>
          </div>
        ) : (
          <>
            <Input
              placeholder="Search by name, SKU, or EAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              onChange={handleProductSelect}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a product</option>
              {filteredProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.sku} {product.ean && `(EAN: ${product.ean})`}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <Select
        name="adjustmentType"
        label="Adjustment Type"
        value={formData.adjustmentType}
        onChange={(e) => setFormData(prev => ({ ...prev, adjustmentType: e.target.value as 'Increase' | 'Decrease' }))}
        required
      >
        <option value="Increase">Increase Stock</option>
        <option value="Decrease">Decrease Stock</option>
      </Select>

      <Input
        name="quantity"
        label="Quantity"
        type="number"
        min="1"
        value={formData.quantity || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
        required
        placeholder="Enter quantity"
      />

      <Input
        name="reason"
        label="Reason for Adjustment"
        value={formData.reason || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
        required
        placeholder="Enter reason (mandatory)"
      />

      <Input
        name="notes"
        label="Additional Notes"
        value={formData.notes || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        placeholder="Optional notes"
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Adjustment</Button>
      </div>
    </form>
  );
};

const StockAdjustmentPage: React.FC = () => {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedWarehouse } = useWarehouse();
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchAdjustments();
  }, [selectedWarehouse]);

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      // TODO: Implement getAdjustments from firebaseService
      const adjustmentsStr = localStorage.getItem('aura_inventory_adjustments');
      const allAdjustments: Adjustment[] = adjustmentsStr ? JSON.parse(adjustmentsStr) : [];
      
      const filtered = selectedWarehouse
        ? allAdjustments.filter(a => a.warehouseId === selectedWarehouse.id && !a.isDeleted)
        : allAdjustments.filter(a => !a.isDeleted);
      
      setAdjustments(filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      addToast('Failed to fetch adjustments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdjustment = async (adjustmentData: Partial<Adjustment>) => {
    try {
      const newAdjustment: Adjustment = {
        id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...adjustmentData as Adjustment,
        approved: true, // Auto-approve for now
        createdBy: user?.id || 'unknown',
        createdAt: new Date(),
        companyId: user?.companyId,
        orgId: user?.orgId,
        isDeleted: false,
      };

      const adjustmentsStr = localStorage.getItem('aura_inventory_adjustments');
      const allAdjustments: Adjustment[] = adjustmentsStr ? JSON.parse(adjustmentsStr) : [];
      allAdjustments.push(newAdjustment);
      localStorage.setItem('aura_inventory_adjustments', JSON.stringify(allAdjustments));

      addToast('Stock adjustment saved successfully', 'success');
      setIsModalOpen(false);
      fetchAdjustments();
    } catch (error) {
      addToast('Failed to save adjustment', 'error');
    }
  };

  const columns = [
    { 
      header: 'Date', 
      accessor: 'createdAt' as keyof Adjustment, 
      render: (item: Adjustment) => new Date(item.createdAt).toLocaleDateString()
    },
    { header: 'SKU', accessor: 'sku' as keyof Adjustment },
    { header: 'Product', accessor: 'productName' as keyof Adjustment },
    {
      header: 'Type',
      accessor: 'adjustmentType' as keyof Adjustment,
      render: (item: Adjustment) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
          item.adjustmentType === 'Increase' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {item.adjustmentType === 'Increase' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {item.adjustmentType}
        </span>
      )
    },
    { header: 'Quantity', accessor: 'quantity' as keyof Adjustment },
    { header: 'Reason', accessor: 'reason' as keyof Adjustment },
    { header: 'Warehouse', accessor: 'warehouseName' as keyof Adjustment },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Package className="text-primary-600 dark:text-primary-400" size={32} />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Stock Adjustments
          </h1>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          leftIcon={<Package />}
          disabled={!selectedWarehouse}
        >
          New Adjustment
        </Button>
      </div>

      {!selectedWarehouse && (
        <Card>
          <div className="text-center py-8">
            <p className="text-yellow-600 dark:text-yellow-400">
              Please select a warehouse to view and create adjustments
            </p>
          </div>
        </Card>
      )}

      {selectedWarehouse && (
        <Card>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading adjustments...</p>
          ) : adjustments.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No adjustments found</p>
            </div>
          ) : (
            <Table columns={columns} data={adjustments} />
          )}
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Stock Adjustment"
      >
        <StockAdjustmentForm
          onSave={handleSaveAdjustment}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default StockAdjustmentPage;
