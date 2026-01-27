import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useCompany } from '../context/CompanyContext';
import { useAuth } from '../context/AuthContext';
import { useWarehouse } from '../context/WarehouseContext';
import { Product, Warehouse, Inward } from '../types';
import { getProducts, getWarehouses, addOutward, getProductStock, getCourierPartners, addCourierPartner, getInwardRecords } from '../services/firebaseService';
import { getSources, Source } from '../services/sourceService';

interface OutwardFormItem {
    id: string;
    sku: string;
    ean: string;
    productId: string;
    productName: string;
    quantity: number;
    warehouseId: string;
    availableStock: number;
    batchId?: string;
    batchNo?: string;
    manufacturingDate?: string;
    expiryDate?: string;
    costPrice?: number;
    availableBatches: Inward[];
}

interface OutwardStockFormProps {
    onSuccess?: () => void;
}

const OutwardStockForm: React.FC<OutwardStockFormProps> = ({ onSuccess }) => {
    const { company } = useCompany();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { selectedWarehouse } = useWarehouse();
    
    const companyId = user?.companyId || company?.id || 'default';
    
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [outwardDestinations, setOutwardDestinations] = useState<Source[]>([]);
    const [allBatches, setAllBatches] = useState<Inward[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [destinationChannel, setDestinationChannel] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [availableStock, setAvailableStock] = useState(0);
    const [availableBatches, setAvailableBatches] = useState<Inward[]>([]);
    const [autoFilledData, setAutoFilledData] = useState({
        manufacturingDate: '',
        expiryDate: ''
    });
    
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!companyId) return;
            
            try {
                const [productsData, warehousesData, destinationsData, batchesData] = await Promise.all([
                    getProducts(),
                    getWarehouses(),
                    getSources(companyId, 'outward'),
                    getInwardRecords({
                        companyId: company?.id,
                        warehouseId: selectedWarehouse?.id,
                    })
                ]);
                
                setProducts(productsData);
                setWarehouses(warehousesData);
                setOutwardDestinations(destinationsData);
                setAllBatches(batchesData);
                
                if (destinationsData.length > 0) {
                    setDestinationChannel(destinationsData[0].id);
                }
            } catch (error) {
                addToast('Failed to load data', 'error');
            }
        };
        
        fetchData();
    }, [companyId, company?.id, selectedWarehouse?.id]);

    // Filter products based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredProducts([]);
            setShowProductDropdown(false);
            return;
        }
        
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.ean && product.ean.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        setFilteredProducts(filtered);
        setShowProductDropdown(true);
    }, [searchTerm, products]);

    // Update available batches when product is selected
    useEffect(() => {
        if (selectedProduct) {
            const warehouseId = selectedWarehouse?.id || warehouses[0]?.id;
            if (warehouseId) {
                const batches = allBatches.filter(batch => 
                    batch.productId === selectedProduct.id && 
                    batch.warehouseId === warehouseId &&
                    batch.batchNo
                );
                setAvailableBatches(batches);
                
                // Update available stock
                try {
                    const stock = getProductStock(selectedProduct.id, warehouseId, companyId);
                    setAvailableStock(stock);
                } catch (error) {
                    setAvailableStock(0);
                }
            }
        } else {
            setAvailableBatches([]);
            setAvailableStock(0);
        }
    }, [selectedProduct, selectedWarehouse?.id, warehouses, allBatches, companyId]);

    // Auto-fill data when batch is selected
    useEffect(() => {
        if (selectedBatch) {
            const batch = allBatches.find(b => b.id === selectedBatch);
            if (batch) {
                setAutoFilledData({
                    manufacturingDate: batch.mfgDate ? new Date(batch.mfgDate).toLocaleDateString() : '--/--/----',
                    expiryDate: batch.expDate ? new Date(batch.expDate).toLocaleDateString() : '--/--/----'
                });
            }
        } else {
            setAutoFilledData({
                manufacturingDate: '--/--/----',
                expiryDate: '--/--/----'
            });
        }
    }, [selectedBatch, allBatches]);

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setSearchTerm(product.name);
        setShowProductDropdown(false);
        setSelectedBatch(''); // Reset batch selection
        setQuantity('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedProduct || !quantity || !destinationChannel || !referenceNumber) {
            addToast('Please fill all required fields', 'error');
            return;
        }
        
        if (Number(quantity) > availableStock) {
            addToast(`Insufficient stock. Available: ${availableStock} units`, 'error');
            return;
        }
        
        setIsLoading(true);
        
        try {
            const destinationSource = outwardDestinations.find(s => s.id === destinationChannel);
            const destinationName = destinationSource ? destinationSource.name : destinationChannel;
            const warehouseId = selectedWarehouse?.id || warehouses[0]?.id;
            
            if (!warehouseId) {
                throw new Error('No warehouse available');
            }
            
            const batch = selectedBatch ? allBatches.find(b => b.id === selectedBatch) : null;
            
            await addOutward({
                companyId: companyId,
                productId: selectedProduct.id,
                sku: selectedProduct.sku,
                ean: selectedProduct.ean || '',
                quantity: Number(quantity),
                warehouseId: warehouseId,
                destination: destinationName,
                courierPartner: '', // Can be added later
                shipmentRef: referenceNumber,
                notes: '',
                transactionDate: new Date(),
                batchNo: batch?.batchNo,
                manufacturingDate: batch?.mfgDate ? new Date(batch.mfgDate) : undefined,
                expiryDate: batch?.expDate ? new Date(batch.expDate) : undefined,
                costPrice: batch?.costPrice,
            });
            
            addToast('Outward stock recorded successfully!', 'success');
            
            // Reset form
            setDestinationChannel(outwardDestinations[0]?.id || '');
            setReferenceNumber('');
            setSearchTerm('');
            setSelectedProduct(null);
            setSelectedBatch('');
            setQuantity('');
            setAutoFilledData({ manufacturingDate: '--/--/----', expiryDate: '--/--/----' });
            
            if (onSuccess) {
                onSuccess();
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to record outward stock';
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setDestinationChannel(outwardDestinations[0]?.id || '');
        setReferenceNumber('');
        setSearchTerm('');
        setSelectedProduct(null);
        setSelectedBatch('');
        setQuantity('');
        setAutoFilledData({ manufacturingDate: '--/--/----', expiryDate: '--/--/----' });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col gap-8">
                <form onSubmit={handleSubmit}>
                    {/* Section 1: Shipment Info */}
                    <section className="flex flex-col gap-5">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Shipment Details</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Destination Channel */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-300">
                                    Destination Channel <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={destinationChannel}
                                        onChange={(e) => setDestinationChannel(e.target.value)}
                                        className="w-full h-11 px-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all"
                                        required
                                    >
                                        <option value="" disabled>Select destination...</option>
                                        {outwardDestinations.map((dest) => (
                                            <option key={dest.id} value={dest.id}>
                                                {dest.name}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500 pointer-events-none text-[20px]">storefront</span>
                                    <span className="material-symbols-outlined absolute right-3 top-3 text-gray-500 pointer-events-none text-[20px]">expand_more</span>
                                </div>
                            </div>
                            
                            {/* Reference Number */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-300">
                                    Reference / Invoice No. <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={referenceNumber}
                                        onChange={(e) => setReferenceNumber(e.target.value)}
                                        className="w-full h-11 px-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400 transition-all"
                                        placeholder="e.g. INV-2024-001"
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500 pointer-events-none text-[20px]">receipt_long</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Product & Stock Info */}
                    <section className="flex flex-col gap-5">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                            <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined text-[18px]">inventory</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Product & Stock</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {/* Product Search */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-900 dark:text-gray-300">
                                    Select Product <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full h-11 px-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400 transition-all"
                                        placeholder="Search by SKU, Name or Barcode..."
                                        required
                                    />
                                    <span className="material-symbols-outlined absolute left-3 top-3 text-gray-500 group-focus-within:text-blue-500 transition-colors text-[20px]">search</span>
                                    
                                    {/* Product Dropdown */}
                                    {showProductDropdown && filteredProducts.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredProducts.map((product) => (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() => handleProductSelect(product)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0"
                                                >
                                                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Batch Selection */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-900 dark:text-gray-300">
                                        Batch ID <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedBatch}
                                            onChange={(e) => setSelectedBatch(e.target.value)}
                                            className="w-full h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all"
                                            disabled={!selectedProduct}
                                        >
                                            <option value="">Select Batch...</option>
                                            {availableBatches.map((batch) => (
                                                <option key={batch.id} value={batch.id}>
                                                    {batch.batchNo} (Exp: {batch.expDate ? new Date(batch.expDate).toLocaleDateString() : 'N/A'})
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-3 text-gray-500 pointer-events-none text-[20px]">expand_more</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Select a batch to auto-fill dates.</p>
                                </div>
                                
                                {/* Quantity */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-900 dark:text-gray-300">
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full h-11 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium text-right pr-12"
                                            placeholder="0"
                                            required
                                        />
                                        <span className="absolute right-3 top-3 text-gray-400 text-sm font-medium pointer-events-none">Units</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        {quantity && Number(quantity) > availableStock && (
                                            <p className="text-xs text-red-500">Exceeds available stock</p>
                                        )}
                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium ml-auto">
                                            Available: {availableStock} units
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Auto-filled Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600/50">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Manufacturing Date
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
                                        <span className="material-symbols-outlined text-[18px] text-gray-400">calendar_today</span>
                                        <span>{autoFilledData.manufacturingDate}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Expiry Date
                                    </label>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
                                        <span className="material-symbols-outlined text-[18px] text-gray-400">event_busy</span>
                                        <span>{autoFilledData.expiryDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="h-10 px-6 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !selectedProduct || !quantity || Number(quantity) > availableStock}
                            className="h-10 px-6 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{isLoading ? 'Recording...' : 'Record Outward Stock'}</span>
                            {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OutwardStockForm;