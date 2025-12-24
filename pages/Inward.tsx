import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useToast } from '../context/ToastContext';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { useWarehouse } from '../context/WarehouseContext';
import { Product, Party } from '../types';
import { getProducts, addInward, getWarehouses } from '../services/firebaseService';
import { getSources, Source } from '../services/sourceService';
import { getParties } from '../services/partyService';
import SourceSelector from '../components/inventory/SourceSelector';
import BulkInwardUpload from '../components/inventory/BulkInwardUpload';
import EANScanner from '../components/ean/EANScanner';
import InlinePartyModal from '../components/ui/InlinePartyModal';
import { Upload, UserPlus } from 'lucide-react';

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
const Inward: React.FC = () => {
    const { company } = useCompany();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { selectedWarehouse } = useWarehouse();
    
    // Use user.companyId for consistency with Sources page and dashboard
    const companyId = user?.companyId || company?.id || 'default';
    
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [inwardSources, setInwardSources] = useState<Source[]>([]);
    const [parties, setParties] = useState<Party[]>([]);
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [warehouseId, setWarehouseId] = useState('');
    const [source, setSource] = useState('');
    const [partyId, setPartyId] = useState('');
    const [awbNumber, setAwbNumber] = useState('');
    const [documentType, setDocumentType] = useState('Invoice');
    const [invoiceNo, setInvoiceNo] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<InwardItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [showPartyModal, setShowPartyModal] = useState(false);
    const [showEanScanner, setShowEanScanner] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!companyId) return;
            const [productsData, warehousesData, sourcesData, partiesData] = await Promise.all([
                getProducts(),
                getWarehouses(),
                getSources(companyId, 'inward'),
                getParties()
            ]);
            setProducts(productsData);
            setWarehouses(warehousesData);
            setInwardSources(sourcesData);
            setParties(partiesData.filter(p => p.type === 'Supplier' || p.type === 'Both'));
            if (sourcesData.length > 0) setSource(sourcesData[0].id);
        };
        fetchData();
    }, [companyId]);

    // Auto-select warehouse from context
    useEffect(() => {
        if (selectedWarehouse && !warehouseId) {
            setWarehouseId(selectedWarehouse.id);
        }
    }, [selectedWarehouse, warehouseId]);

    const handleSourceCreated = async () => {
        if (!companyId) return;
        console.log('Inward - Refreshing sources after creation...');
        const sourcesData = await getSources(companyId, 'inward');
        setInwardSources(sourcesData);
        console.log('Inward - Sources refreshed:', sourcesData.length, 'sources loaded');
        console.log('Inward - New sources:', sourcesData.map(s => ({ id: s.id, name: s.name })));
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

    const handlePartyCreated = async (party: Party) => {
        const updatedParties = await getParties();
        setParties(updatedParties.filter(p => p.type === 'Supplier' || p.type === 'Both'));
        setPartyId(party.id);
    };

    const handleEanScanned = (itemId: string, ean: string) => {
        const product = products.find(p => p.ean?.toLowerCase() === ean.toLowerCase());
        if (product) {
            updateItem(itemId, 'ean', ean);
            addToast(`Product found: ${product.name}`, 'success');
        } else {
            addToast('Product not found with this EAN', 'error');
        }
        setShowEanScanner(null);
    };

    const resetForm = () => {
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setWarehouseId(selectedWarehouse?.id || '');
        setSource(inwardSources[0]?.id || '');
        setPartyId('');
        setAwbNumber('');
        setDocumentType('Invoice');
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
            addToast('Please enter invoice/document number.', 'error');
            return;
        }

        if (items.length === 0) {
            addToast('Please add at least one item.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // Get the source name and party name
            const sourceSource = inwardSources.find(s => s.id === source);
            const sourceName = sourceSource ? sourceSource.name : source;
            const party = parties.find(p => p.id === partyId);
            const partyName = party ? party.name : '';
            
            // Process each item
            for (const item of items) {
                await addInward({
                    companyId: company.id,
                    productId: item.productId,
                    sku: item.sku,
                    quantity: item.quantity,
                    batchNo: item.batchNo,
                    mfgDate: new Date(item.mfgDate),
                    expDate: new Date(item.expDate),
                    costPrice: item.costPrice,
                    warehouseId,
                    source: sourceName,
                    partyId: partyId || undefined,
                    partyName: partyName || undefined,
                    awbNumber: awbNumber || undefined,
                    documentType,
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
                    Bulk Upload
                </Button>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Party / Supplier
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={partyId}
                                    onChange={(e) => setPartyId(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Select party (optional)</option>
                                    {parties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowPartyModal(true)}
                                    title="Create new party"
                                >
                                    <UserPlus size={16} />
                                </Button>
                            </div>
                        </div>
                        <Input 
                            label="AWB / Reference Number" 
                            value={awbNumber} 
                            onChange={e => setAwbNumber(e.target.value)} 
                            placeholder="Enter AWB or reference number"
                        />
                        <Select 
                            label="Document Type *" 
                            value={documentType} 
                            onChange={e => setDocumentType(e.target.value)} 
                            required
                        >
                            <option value="Invoice">Invoice</option>
                            <option value="Challan">Challan</option>
                            <option value="PO">Purchase Order</option>
                            <option value="GRN">GRN</option>
                            <option value="Other">Other</option>
                        </Select>
                        <Input 
                            label="Invoice / Document No. *" 
                            value={invoiceNo} 
                            onChange={e => setInvoiceNo(e.target.value)} 
                            placeholder="Enter invoice or document number"
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
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    EAN / Barcode
                                                </label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={item.ean}
                                                        onChange={e => updateItem(item.id, 'ean', e.target.value)}
                                                        placeholder="Scan or enter EAN"
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setShowEanScanner(item.id)}
                                                        title="Scan EAN"
                                                    >
                                                        📷
                                                    </Button>
                                                </div>
                                                {showEanScanner === item.id && (
                                                    <div className="mt-2 border rounded-lg p-3 bg-white dark:bg-gray-800">
                                                        <EANScanner
                                                            onScan={(ean) => handleEanScanned(item.id, ean)}
                                                            onClose={() => setShowEanScanner(null)}
                                                            placeholder="Scan EAN"
                                                        />
                                                    </div>
                                                )}
                                            </div>
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

            <InlinePartyModal
                isOpen={showPartyModal}
                onClose={() => setShowPartyModal(false)}
                onPartyCreated={handlePartyCreated}
                defaultType="Supplier"
            />
        </div>
    );
};

export default Inward;
