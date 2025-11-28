
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../context/ToastContext';
import { useCompany } from '../context/CompanyContext';
import { Product, Source } from '../types';
import { getProducts, addInward, getWarehouses } from '../services/firebaseService';
import { getSources } from '../services/sourceService';
import EanInput from '../components/inventory/EanInput';
import ProductSearchSelect from '../components/inventory/ProductSearchSelect';
import SourceSelector from '../components/inventory/SourceSelector';
import BulkInwardUpload from '../components/inventory/BulkInwardUpload';
import { Upload } from 'lucide-react';

interface InwardItem {
    id: string;
    sku: string;
    ean: string;
    productId: string;
    productName: string;
    quantity: number;
    batchNo: string;
    mfgDate: string;
    expDate: string;
    costPrice: number;
}

interface InwardForm {
    invoiceNo: string;
}

const Inward: React.FC = () => {
    const { company } = useCompany();
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [inwardSources, setInwardSources] = useState<Source[]>([]);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [warehouseId, setWarehouseId] = useState('');
    const [source, setSource] = useState('');
    const [invoiceNo, setInvoiceNo] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<InwardItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            if (!company) return;
            const [productsData, warehousesData, sourcesData] = await Promise.all([
                getProducts(),
                getWarehouses(),
                getSources(company.id, 'inward')
            ]);
            setProducts(productsData);
            setWarehouses(warehousesData);
            setInwardSources(sourcesData);
            if (sourcesData.length > 0) setSource(sourcesData[0].id);
        };
        fetchData();
    }, [company]);

    const handleSourceCreated = async () => {
        if (!company) return;
        const sourcesData = await getSources(company.id, 'inward');
        setInwardSources(sourcesData);
    };

    const addItem = () => {
        setItems([...items, {
            id: `temp_${Date.now()}`,
            sku: '',
            ean: '',
            productId: '',
            productName: '',
            quantity: 1,
            batchNo: '',
            mfgDate: '',
            expDate: '',
            costPrice: 0
        }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof InwardItem, value: any) => {
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
                        updatedItem.costPrice = product.costPrice;
                    }
                } else if (field === 'ean' && value) {
                    const product = products.find(p => p.ean?.toLowerCase() === value.toLowerCase());
                    if (product) {
                        updatedItem.productId = product.id;
                        updatedItem.productName = product.name;
                        updatedItem.sku = product.sku;
                        updatedItem.costPrice = product.costPrice;
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
        setWarehouseId('');
        setSource(inwardSources[0]?.id || '');
        setInvoiceNo('');
        setNotes('');
        setItems([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!warehouseId) {
            addToast('Please select a warehouse.', 'error');
            return;
        }

        if (!invoiceNo.trim()) {
            addToast('Please enter Invoice/Reference Number.', 'error');
            return;
        }

        if (items.length === 0) {
            addToast('Please add at least one item.', 'error');
            return;
        }

        // Validate all items
        for (const item of items) {
            if (!item.productId || !item.quantity || !item.mfgDate || !item.expDate) {
                addToast('Please fill all required fields for all items.', 'error');
                return;
            }
        }

        setIsLoading(true);

        try {
            // Get the source name from the source ID
            const sourceSource = inwardSources.find(s => s.id === source);
            const sourceName = sourceSource ? sourceSource.name : source;
            
            // Process each item
            for (const item of items) {
                await addInward({
                    companyId: company.id,
                    productId: item.productId,
                    sku: item.sku,
                    ean: item.ean,
                    quantity: item.quantity,
                    batchNo: item.batchNo,
                    mfgDate: new Date(item.mfgDate),
                    expDate: new Date(item.expDate),
                    costPrice: item.costPrice,
                    warehouseId,
                    source: sourceName, // Use the name instead of ID
                    documentNo: invoiceNo,
                    notes,
                    transactionDate: new Date(transactionDate),
                });
            }
            addToast(`Successfully recorded ${items.length} inward item(s)!`, 'success');
            resetForm();
        } catch (error) {
            addToast('Failed to record inward stock.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Inward Inventory</h1>
                <Button
                    onClick={() => setShowBulkUpload(true)}
                    leftIcon={<Upload />}
                    variant="secondary"
                >
                    Bulk Upload Excel
                </Button>
            </div>
            <Card title="Add New Inward Stock">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Input 
                            label="Transaction Date *" 
                            type="date" 
                            value={transactionDate} 
                            onChange={e => setTransactionDate(e.target.value)} 
                            required 
                        />
                        <Select label="To Warehouse *" value={warehouseId} onChange={e => setWarehouseId(e.target.value)} required>
                            <option value="">Select warehouse</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </Select>
                        <SourceSelector
                            label="Source *"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            type="inward"
                            sources={inwardSources}
                            onSourceCreated={handleSourceCreated}
                            required
                        />
                        <Input 
                            label="Invoice / Reference No. *" 
                            value={invoiceNo} 
                            onChange={e => setInvoiceNo(e.target.value)} 
                            placeholder="Enter invoice or reference number"
                            required 
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
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                                            <Input
                                                label="Batch No."
                                                value={item.batchNo}
                                                onChange={e => updateItem(item.id, 'batchNo', e.target.value)}
                                                placeholder="Optional"
                                            />
                                            <Input
                                                label="Quantity *"
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                required
                                            />
                                            <Input
                                                label="Mfg Date *"
                                                type="date"
                                                value={item.mfgDate}
                                                onChange={e => updateItem(item.id, 'mfgDate', e.target.value)}
                                                required
                                            />
                                            <Input
                                                label="Exp Date *"
                                                type="date"
                                                value={item.expDate}
                                                onChange={e => updateItem(item.id, 'expDate', e.target.value)}
                                                required
                                            />
                                            <Input
                                                label="Cost Price (₹) *"
                                                type="number"
                                                step="0.01"
                                                value={item.costPrice}
                                                onChange={e => updateItem(item.id, 'costPrice', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                            {item.productName && (
                                                <div className="col-span-1 flex items-end pb-2">
                                                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                                        {item.productName}
                                                    </span>
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
                            placeholder="Additional notes for this inward transaction"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading} disabled={items.length === 0}>
                            Record Inward ({items.length} item{items.length !== 1 ? 's' : ''})
                        </Button>
                    </div>
                </form>
            </Card>
            <BulkInwardUpload
                isOpen={showBulkUpload}
                onClose={() => setShowBulkUpload(false)}
                onSuccess={() => {
                    setShowBulkUpload(false);
                    addToast('Bulk inward upload completed successfully!', 'success');
                }}
            />
        </div>
    );
};

export default Inward;
