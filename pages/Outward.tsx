
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../context/ToastContext';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { Product, Warehouse, Source, Inward } from '../types';
import { getProducts, getWarehouses, addOutward, getProductStock, getCourierPartners, addCourierPartner, getInwardRecords } from '../services/firebaseService';
import { getSources } from '../services/sourceService';
// Removed validateStockAvailability - validation happens in addOutward service
import EanInput from '../components/inventory/EanInput';
import ProductSearchSelect from '../components/inventory/ProductSearchSelect';
import SourceSelector from '../components/inventory/SourceSelector';
import BulkOutwardUpload from '../components/inventory/BulkOutwardUpload';
import { Upload } from 'lucide-react';

interface OutwardItem {
    id: string;
    sku: string;
    ean: string;
    productId: string;
    productName: string;
    quantity: number;
    warehouseId: string;
    availableStock: number;
    batchId?: string; // Selected batch ID
    batchNo?: string; // Auto-filled from batch
    manufacturingDate?: string; // Auto-filled from batch (read-only)
    expiryDate?: string; // Auto-filled from batch (read-only)
    costPrice?: number; // Auto-filled from batch (read-only)
    availableBatches: Inward[]; // Available batches for this product
}

const Outward: React.FC = () => {
    const { company } = useCompany();
    const { user } = useAuth();
    const { addToast } = useToast();
    
    // Use user.companyId for consistency with Sources page and dashboard
    const companyId = user?.companyId || company?.id || 'default';
    
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [outwardDestinations, setOutwardDestinations] = useState<Source[]>([]);
    const [courierPartners, setCourierPartners] = useState<string[]>([]);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [destination, setDestination] = useState('');
    const [courierPartner, setCourierPartner] = useState('');
    const [shipmentRef, setShipmentRef] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<OutwardItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddCourier, setShowAddCourier] = useState(false);
    const [newCourier, setNewCourier] = useState('');
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [allBatches, setAllBatches] = useState<Inward[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!companyId) return;
            const [productsData, warehousesData, destinationsData, couriersData, batchesData] = await Promise.all([
                getProducts(),
                getWarehouses(),
                getSources(companyId, 'outward'),
                getCourierPartners(),
                getInwardRecords()
            ]);
            setProducts(productsData);
            setWarehouses(warehousesData);
            setOutwardDestinations(destinationsData);
            setCourierPartners(couriersData);
            setAllBatches(batchesData);
            if (destinationsData.length > 0) setDestination(destinationsData[0].id);
            if (couriersData.length > 0) setCourierPartner(couriersData[0]);
        };
        fetchData();
    }, [companyId]);

    const handleDestinationCreated = async () => {
        if (!companyId) return;
        console.log('Outward - Refreshing destinations after creation...');
        const destinationsData = await getSources(companyId, 'outward');
        setOutwardDestinations(destinationsData);
        console.log('Outward - Destinations refreshed:', destinationsData.length, 'destinations loaded');
        console.log('Outward - New destinations:', destinationsData.map(s => ({ id: s.id, name: s.name })));
    };

    // Fetch batch details by batch ID and auto-fill form
    const fetchBatchById = (batchId: string): Inward | null => {
        return allBatches.find(batch => batch.id === batchId) || null;
    };

    // Get available batches for a specific product and warehouse
    const getAvailableBatches = (productId: string, warehouseId: string): Inward[] => {
        return allBatches.filter(batch => 
            batch.productId === productId && 
            batch.warehouseId === warehouseId &&
            batch.batchNo // Only batches with batch numbers
        );
    };

    const addItem = () => {
        setItems([...items, {
            id: `temp_${Date.now()}`,
            sku: '',
            ean: '',
            productId: '',
            productName: '',
            quantity: 1,
            warehouseId: '',
            availableStock: 0,
            batchId: '',
            batchNo: '',
            manufacturingDate: '',
            expiryDate: '',
            costPrice: undefined,
            availableBatches: []
        }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof OutwardItem, value: any) => {
        const updated = items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                
                // Auto-fill product details when SKU/EAN changes
                if (field === 'sku') {
                    const product = products.find(p => p.sku === value);
                    if (product) {
                        updatedItem.productId = product.id;
                        updatedItem.productName = product.name;
                        updatedItem.ean = product.ean || '';
                    }
                } else if (field === 'ean' && value) {
                    const product = products.find(p => p.ean?.toLowerCase() === value.toLowerCase());
                    if (product) {
                        updatedItem.productId = product.id;
                        updatedItem.productName = product.name;
                        updatedItem.sku = product.sku;
                    }
                }
                
                // Update available stock and batches when product or warehouse changes
                if ((field === 'productId' || field === 'warehouseId') && updatedItem.productId && updatedItem.warehouseId && company) {
                    try {
                        const stock = getProductStock(updatedItem.productId, updatedItem.warehouseId, company.id);
                        updatedItem.availableStock = stock;
                        // Update available batches
                        updatedItem.availableBatches = getAvailableBatches(updatedItem.productId, updatedItem.warehouseId);
                        // Clear batch selection when product/warehouse changes
                        updatedItem.batchId = '';
                        updatedItem.batchNo = '';
                        updatedItem.manufacturingDate = '';
                        updatedItem.expiryDate = '';
                        updatedItem.costPrice = undefined;
                    } catch (error) {
                        updatedItem.availableStock = 0;
                        updatedItem.availableBatches = [];
                    }
                }

                // Auto-fill batch details when batch is selected
                if (field === 'batchId' && value) {
                    const batch = fetchBatchById(value);
                    if (batch) {
                        updatedItem.batchNo = batch.batchNo;
                        updatedItem.manufacturingDate = batch.mfgDate ? new Date(batch.mfgDate).toISOString().split('T')[0] : '';
                        updatedItem.expiryDate = batch.expDate ? new Date(batch.expDate).toISOString().split('T')[0] : '';
                        updatedItem.costPrice = batch.costPrice;
                    } else {
                        addToast('Batch not found', 'error');
                        // Clear batch fields if batch not found
                        updatedItem.batchNo = '';
                        updatedItem.manufacturingDate = '';
                        updatedItem.expiryDate = '';
                        updatedItem.costPrice = undefined;
                    }
                }
                
                return updatedItem;
            }
            return item;
        });
        setItems(updated);
    };

    const resetForm = () => {
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setDestination(outwardDestinations[0]?.id || '');
        setCourierPartner(courierPartners[0] || '');
        setShipmentRef('');
        setNotes('');
        setItems([]);
        setShowAddCourier(false);
        setNewCourier('');
    };

    const handleAddCourier = async () => {
        if (newCourier.trim()) {
            try {
                const updated = await addCourierPartner(newCourier.trim());
                setCourierPartners(updated);
                setCourierPartner(newCourier.trim());
                setNewCourier('');
                setShowAddCourier(false);
                addToast('Courier partner added successfully!', 'success');
            } catch (error) {
                addToast('Failed to add courier partner', 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            addToast('Please add at least one item.', 'error');
            return;
        }

        // Validate all items
        for (const item of items) {
            if (!item.productId || !item.quantity || !item.warehouseId) {
                addToast('Please fill all required fields for all items.', 'error');
                return;
            }
            if (item.quantity > item.availableStock) {
                addToast(`Insufficient stock for ${item.productName}. Available: ${item.availableStock}`, 'error');
                return;
            }
        }

        setIsLoading(true);

        try {
            // Get the destination name from the source ID
            const destinationSource = outwardDestinations.find(s => s.id === destination);
            const destinationName = destinationSource ? destinationSource.name : destination;
            
            // Process each item
            for (const item of items) {
                await addOutward({
                    companyId: company.id,
                    productId: item.productId,
                    sku: item.sku,
                    ean: item.ean,
                    quantity: item.quantity,
                    warehouseId: item.warehouseId,
                    destination: destinationName, // Use the name instead of ID
                    courierPartner,
                    shipmentRef,
                    notes,
                    transactionDate: new Date(transactionDate),
                    batchNo: item.batchNo,
                    manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate) : undefined,
                    expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
                    costPrice: item.costPrice,
                });
            }
            addToast(`Successfully recorded ${items.length} outward item(s)!`, 'success');
            resetForm();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to record outward stock.";
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Outward Inventory</h1>
                <Button
                    onClick={() => setShowBulkUpload(true)}
                    leftIcon={<Upload />}
                    variant="secondary"
                >
                    Bulk Upload Excel
                </Button>
            </div>
            <Card title="Create New Outward Shipment">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Input 
                            label="Transaction Date *" 
                            type="date" 
                            value={transactionDate} 
                            onChange={e => setTransactionDate(e.target.value)} 
                            required 
                        />
                        <SourceSelector
                            label="Destination / Channel *"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            type="outward"
                            sources={outwardDestinations}
                            onSourceCreated={handleDestinationCreated}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Courier Partner
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={courierPartner}
                                    onChange={(e) => setCourierPartner(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select courier</option>
                                    {courierPartners.map((partner) => (
                                        <option key={partner} value={partner}>
                                            {partner}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    onClick={() => setShowAddCourier(!showAddCourier)}
                                    variant="secondary"
                                    size="sm"
                                    className="px-3"
                                >
                                    +
                                </Button>
                            </div>
                            {showAddCourier && (
                                <div className="mt-2 flex gap-2">
                                    <Input
                                        value={newCourier}
                                        onChange={(e) => setNewCourier(e.target.value)}
                                        placeholder="New courier partner name"
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddCourier}
                                        variant="primary"
                                        size="sm"
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setShowAddCourier(false);
                                            setNewCourier('');
                                        }}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Input 
                            label="Shipment Reference / AWB" 
                            value={shipmentRef} 
                            onChange={e => setShipmentRef(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>

                    <div className="border-t pt-4 mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Items</h3>
                            <Button type="button" onClick={addItem} variant="secondary" size="sm">
                                + Add Item
                            </Button>
                        </div>

                        {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Click "Add Item" to start adding products
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-semibold">Item {index + 1}</span>
                                            <Button 
                                                type="button" 
                                                onClick={() => removeItem(item.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            <Input
                                                label="EAN / Barcode"
                                                value={item.ean}
                                                onChange={e => updateItem(item.id, 'ean', e.target.value)}
                                                placeholder="Scan EAN"
                                            />
                                            <Select 
                                                label="Product (SKU) *"
                                                value={item.sku}
                                                onChange={e => updateItem(item.id, 'sku', e.target.value)}
                                                required
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.sku}>{p.sku} - {p.name}</option>
                                                ))}
                                            </Select>
                                            <Select 
                                                label="From Warehouse *"
                                                value={item.warehouseId}
                                                onChange={e => updateItem(item.id, 'warehouseId', e.target.value)}
                                                required
                                            >
                                                <option value="">Select Warehouse</option>
                                                {warehouses.map(w => (
                                                    <option key={w.id} value={w.id}>{w.name}</option>
                                                ))}
                                            </Select>
                                            <Input
                                                label="Quantity *"
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                placeholder={item.availableStock > 0 ? `Available: ${item.availableStock}` : "0"}
                                                required
                                            />
                                            <Select
                                                label="Batch ID"
                                                value={item.batchId || ''}
                                                onChange={e => updateItem(item.id, 'batchId', e.target.value)}
                                            >
                                                <option value="">Select Batch (Optional)</option>
                                                {item.availableBatches.map(batch => (
                                                    <option key={batch.id} value={batch.id}>
                                                        {batch.batchNo} (Qty: {batch.quantity}, Exp: {batch.expDate ? new Date(batch.expDate).toLocaleDateString() : 'N/A'})
                                                    </option>
                                                ))}
                                            </Select>
                                            <Input
                                                label="Batch No. (Auto-filled)"
                                                value={item.batchNo || ''}
                                                readOnly
                                                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                                placeholder="Select batch to auto-fill"
                                            />
                                            <Input
                                                label="Manufacturing Date (Auto-filled)"
                                                type="date"
                                                value={item.manufacturingDate || ''}
                                                readOnly
                                                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                            />
                                            <Input
                                                label="Expiry Date (Auto-filled)"
                                                type="date"
                                                value={item.expiryDate || ''}
                                                readOnly
                                                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                            />
                                            {item.costPrice !== undefined && (
                                                <Input
                                                    label="Cost Price (Auto-filled)"
                                                    type="number"
                                                    value={item.costPrice}
                                                    readOnly
                                                    className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                                    placeholder="₹0.00"
                                                />
                                            )}
                                            {item.productName && (
                                                <div className="col-span-full flex items-end pb-2">
                                                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                                        {item.productName}
                                                    </span>
                                                    {item.availableStock > 0 && (
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            (Stock: {item.availableStock})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                        <textarea 
                            id="notes" 
                            rows={3} 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300"
                            placeholder="Additional notes for this outward transaction"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading} disabled={items.length === 0}>
                            Record Outward ({items.length} item{items.length !== 1 ? 's' : ''})
                        </Button>
                    </div>
                </form>
            </Card>
            <BulkOutwardUpload
                isOpen={showBulkUpload}
                onClose={() => setShowBulkUpload(false)}
                onSuccess={() => {
                    setShowBulkUpload(false);
                    addToast('Bulk outward upload completed successfully!', 'success');
                }}
            />
        </div>
    );
};

export default Outward;
