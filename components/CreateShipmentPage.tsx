import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { FbaShipmentItem, Product, Warehouse } from '../types';
import { createPlatformShipment, getPlatformDisplayName, Platform } from '../services/platformShipmentService';
import { getProducts, getWarehouses } from '../services/firebaseService';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';

interface CreateShipmentPageProps {
  platform: Platform;
  listRoute: string;
}

const CreateShipmentPage: React.FC<CreateShipmentPageProps> = ({ platform, listRoute }) => {
  const navigate = useNavigate();
  const { company } = useCompany();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    shipmentName: '',
    trackingId: '',
    awb: '',
    carrier: '',
    notes: '',
  });
  
  const [items, setItems] = useState<FbaShipmentItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load products and warehouses
  useEffect(() => {
    Promise.all([getProducts(), getWarehouses()]).then(([p, w]) => {
      setProducts(p);
      setWarehouses(w);
    });
  }, []);
  
  const addItem = () => {
    setItems([...items, { 
      sku: '', 
      ean: '', 
      productId: '', 
      productName: '', 
      quantity: 1, 
      warehouseId: '' 
    }]);
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, field: keyof FbaShipmentItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-fill product details when product selected
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].sku = product.sku;
        updated[index].ean = product.ean || '';
        updated[index].productName = product.name;
        updated[index].costPrice = product.costPrice;
      }
    }
    
    setItems(updated);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shipmentName.trim()) {
      addToast('Shipment name is required', 'error');
      return;
    }
    
    if (items.length === 0) {
      addToast('Add at least one item', 'error');
      return;
    }
    
    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId) {
        addToast(`Item ${i + 1}: Please select a product`, 'error');
        return;
      }
      if (!item.warehouseId) {
        addToast(`Item ${i + 1}: Please select a warehouse`, 'error');
        return;
      }
      if (item.quantity <= 0) {
        addToast(`Item ${i + 1}: Quantity must be greater than 0`, 'error');
        return;
      }
    }
    
    setLoading(true);
    try {
      await createPlatformShipment(company!.id, platform, { 
        ...formData, 
        items 
      });
      addToast('Shipment created successfully', 'success');
      navigate(listRoute);
    } catch (error: any) {
      addToast(error.message || 'Failed to create shipment', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const platformName = getPlatformDisplayName(platform);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => navigate(listRoute)}
            leftIcon={<ArrowLeft size={20} />}
          >
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Create {platformName} Shipment
          </h1>
        </div>
      </div>
      
      <Card title="Shipment Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Shipment Name *" 
            value={formData.shipmentName} 
            onChange={e => setFormData({...formData, shipmentName: e.target.value})}
            required
            placeholder="e.g., SHIP-2025-001"
          />
          <Input 
            label="Tracking / AWB Number" 
            value={formData.trackingId} 
            onChange={e => setFormData({...formData, trackingId: e.target.value, awb: e.target.value})}
            placeholder="Tracking or AWB number"
          />
          <Input 
            label="Carrier" 
            value={formData.carrier} 
            onChange={e => setFormData({...formData, carrier: e.target.value})}
            placeholder="e.g., Delhivery, Bluedart"
          />
          <div className="md:col-span-2">
            <Input 
              label="Notes" 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes (optional)"
            />
          </div>
        </div>
      </Card>
      
      <Card title="Shipment Items">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-2">
                  <Input 
                    label={index === 0 ? "EAN / Barcode" : ""}
                    placeholder="Scan EAN" 
                    value={item.ean || ''} 
                    onChange={e => {
                      const eanInput = e.target.value;
                      const eanTrimmed = eanInput.trim();
                      const updated = [...items];
                      updated[index] = { ...updated[index], ean: eanInput };
                      
                      // Auto-select product if EAN matches (use trimmed version for comparison)
                      if (eanTrimmed) {
                        const product = products.find(p => p.ean && p.ean.toLowerCase() === eanTrimmed.toLowerCase());
                        if (product) {
                          updated[index].productId = product.id;
                          updated[index].sku = product.sku;
                          updated[index].productName = product.name;
                          updated[index].costPrice = product.costPrice;
                        } else {
                          // Clear product selection if EAN doesn't match
                          updated[index].productId = '';
                          updated[index].sku = '';
                          updated[index].productName = '';
                          updated[index].costPrice = undefined;
                        }
                      } else {
                        // Clear product selection if EAN is empty
                        updated[index].productId = '';
                        updated[index].sku = '';
                        updated[index].productName = '';
                        updated[index].costPrice = undefined;
                      }
                      
                      setItems(updated);
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <Select 
                    label={index === 0 ? "Product *" : ""}
                    value={item.productId} 
                    onChange={e => updateItem(index, 'productId', e.target.value)}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input 
                    label={index === 0 ? "Quantity *" : ""}
                    type="number" 
                    min="1"
                    placeholder="Qty" 
                    value={item.quantity || ''} 
                    onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="col-span-3">
                  <Select 
                    label={index === 0 ? "Warehouse *" : ""}
                    value={item.warehouseId} 
                    onChange={e => updateItem(index, 'warehouseId', e.target.value)}
                    required
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              {item.productName && (
                <div className="pl-2 py-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Product Name: </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{item.productName}</span>
                  {item.sku && <span className="text-gray-400 ml-2">({item.sku})</span>}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          type="button" 
          onClick={addItem} 
          leftIcon={<PlusCircle />}
          variant="secondary"
          className="mt-4"
        >
          Add Item
        </Button>
      </Card>
      
      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => navigate(listRoute)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Shipment'}
        </Button>
      </div>
    </form>
  );
};

export default CreateShipmentPage;
