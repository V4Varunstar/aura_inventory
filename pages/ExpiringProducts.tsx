import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import { ArrowLeft, Download, Clock } from 'lucide-react';
import { Inward, Product, Warehouse } from '../types';
import { downloadExcel } from '../utils/excelHelper';
import { getProducts, getWarehouses } from '../services/firebaseService';
import { useWarehouse } from '../context/WarehouseContext';

interface ExpiringItem {
    sku: string;
    productName: string;
    batchNo: string;
    expiryDate: string;
    monthsToExpiry: number;
    quantity: number;
    warehouse: string;
    mfgDate?: string;
}

const ExpiringProducts: React.FC = () => {
    const navigate = useNavigate();
    const { selectedWarehouse } = useWarehouse();
    const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpiringProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWarehouse?.id]);

    const fetchExpiringProducts = async () => {
        try {
            // Get data from localStorage
            const allInwardRecords: Inward[] = JSON.parse(localStorage.getItem('aura_inventory_inward') || '[]');
            // Get products and warehouses from service (includes defaults)
            const products: Product[] = await getProducts();
            const warehouses: Warehouse[] = await getWarehouses();

            // Scope everything to selected warehouse (when set)
            const inwardRecords: Inward[] = selectedWarehouse
                ? allInwardRecords.filter(r => r.warehouseId === selectedWarehouse.id)
                : allInwardRecords;

            console.log('Expiring Products Debug:');
            console.log('Total inward records:', inwardRecords.length);
            console.log('Products:', products.length);
            console.log('Warehouses:', warehouses.length);
            
            if (products.length > 0) {
                console.log('Sample product:', products[0]);
            }
            if (warehouses.length > 0) {
                console.log('Sample warehouse:', warehouses[0]);
            }

            // Create maps for quick lookup
            const productMap = new Map(products.map(p => [p.sku, p]));
            const warehouseMap = new Map(warehouses.map(w => [w.id, w]));
            
            console.log('Product SKUs in map:', Array.from(productMap.keys()));
            console.log('Warehouse IDs in map:', Array.from(warehouseMap.keys()));

            // Helper function to normalize batch number
            const normalizeBatch = (batchNo: any) => {
                return (batchNo && batchNo.trim() !== '') ? batchNo.trim() : 'NO_BATCH';
            };

            // Calculate stock by SKU, warehouse, and batch
            const stockByBatch = new Map<string, number>();
            
            inwardRecords.forEach(record => {
                const key = `${record.sku}|${record.warehouseId}|${normalizeBatch(record.batchNo)}`;
                stockByBatch.set(key, (stockByBatch.get(key) || 0) + record.quantity);
            });

            // Get outward records
            const allOutwardRecords = JSON.parse(localStorage.getItem('aura_inventory_outward') || '[]');
            const outwardRecords = selectedWarehouse
                ? allOutwardRecords.filter((r: any) => r.warehouseId === selectedWarehouse.id)
                : allOutwardRecords;
            outwardRecords.forEach((record: any) => {
                const key = `${record.sku}|${record.warehouseId}|${normalizeBatch(record.batchNo)}`;
                stockByBatch.set(key, (stockByBatch.get(key) || 0) - record.quantity);
            });

            // Get adjustments
            const allAdjustments = JSON.parse(localStorage.getItem('aura_inventory_adjustments') || '[]');
            const adjustments = selectedWarehouse
                ? allAdjustments.filter((r: any) => r.warehouseId === selectedWarehouse.id)
                : allAdjustments;
            adjustments.forEach((record: any) => {
                const key = `${record.sku}|${record.warehouseId}|${normalizeBatch(record.batchNo)}`;
                stockByBatch.set(key, record.adjustedQuantity);
            });

            console.log('Stock by batch entries:', stockByBatch.size);

            // Calculate expiring items (within 6 months)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
            sixMonthsFromNow.setHours(23, 59, 59, 999);

            console.log('ExpiringProducts Page - Date Range:');
            console.log('Today:', today.toLocaleDateString());
            console.log('Six months from now:', sixMonthsFromNow.toLocaleDateString());

            const items: ExpiringItem[] = [];
            const processedBatches = new Set<string>();
            
            // First, group by batch and find the earliest expiry date for each batch
            const batchExpiryMap = new Map<string, { expDate: Date, mfgDate?: Date, record: Inward }>();
            
            inwardRecords.forEach(record => {
                if (record.expDate) {
                    const batchKey = `${record.sku}|${record.warehouseId}|${normalizeBatch(record.batchNo)}`;
                    const expDate = new Date(record.expDate);
                    expDate.setHours(0, 0, 0, 0);
                    
                    // Keep the earliest expiry date for this batch
                    const existing = batchExpiryMap.get(batchKey);
                    if (!existing || expDate < existing.expDate) {
                        batchExpiryMap.set(batchKey, {
                            expDate,
                            mfgDate: record.mfgDate ? new Date(record.mfgDate) : undefined,
                            record
                        });
                    }
                }
            });
            
            console.log('Unique batches with expiry:', batchExpiryMap.size);
            
            // Now process each unique batch
            batchExpiryMap.forEach((batchInfo, batchKey) => {
                const record = batchInfo.record;
                const expDate = batchInfo.expDate;
                const stock = stockByBatch.get(batchKey) || 0;
                
                console.log('Checking batch:', {
                    sku: record.sku,
                    ean: record.ean,
                    batchNo: record.batchNo || 'NO_BATCH',
                    batchKey,
                    stock,
                    expDate: expDate.toLocaleDateString(),
                    isAfterToday: expDate > today,
                    isBeforeSixMonths: expDate <= sixMonthsFromNow,
                });
                
                // Check if expiring within 6 months and not expired
                if (expDate <= sixMonthsFromNow && expDate > today && stock > 0) {
                    console.log('  ✓ Adding to expiring items list');
                    const product = productMap.get(record.sku);
                    const warehouse = warehouseMap.get(record.warehouseId);
                    
                    console.log('  Looking up - SKU:', record.sku, 'Found:', product ? 'YES' : 'NO');
                    console.log('  Looking up - Warehouse ID:', record.warehouseId, 'Found:', warehouse ? 'YES' : 'NO');
                    
                    // Calculate months to expiry
                    const timeDiff = expDate.getTime() - today.getTime();
                    const daysToExpiry = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const monthsToExpiry = Math.floor(daysToExpiry / 30);

                    items.push({
                        sku: record.sku,
                        productName: product?.name || 'Unknown Product',
                        batchNo: record.batchNo && record.batchNo.trim() !== '' ? record.batchNo : 'N/A',
                        expiryDate: expDate.toLocaleDateString('en-GB'),
                        monthsToExpiry,
                        quantity: stock,
                        warehouse: warehouse?.name || 'Unknown',
                        mfgDate: batchInfo.mfgDate ? batchInfo.mfgDate.toLocaleDateString('en-GB') : undefined,
                    });
                } else {
                    if (stock <= 0) {
                        console.log('  ⊘ Skipped - stock is 0 or negative:', stock);
                    } else {
                        console.log('  ⊘ Skipped - not in date range');
                    }
                }
            });

            // Sort by months to expiry (earliest first)
            items.sort((a, b) => a.monthsToExpiry - b.monthsToExpiry);

            console.log('Final expiring items:', items.length);
            console.log('Items:', items);
            console.log('Stock by batch map:', Array.from(stockByBatch.entries()));

            setExpiringItems(items);
        } catch (error) {
            console.error('Error fetching expiring products:', error);
            alert('Error loading expiring products: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const exportData = expiringItems.map(item => ({
            'SKU': item.sku,
            'Product Name': item.productName,
            'Batch No': item.batchNo,
            'Warehouse': item.warehouse,
            'Quantity': item.quantity,
            'Mfg Date': item.mfgDate || 'N/A',
            'Expiry Date': item.expiryDate,
            'Months to Expiry': item.monthsToExpiry,
        }));

        downloadExcel(exportData, 'Expiring_Products_Report');
    };

    const columns = [
        { header: 'SKU', accessor: 'sku' as keyof ExpiringItem },
        { header: 'Product Name', accessor: 'productName' as keyof ExpiringItem },
        { header: 'Batch No', accessor: 'batchNo' as keyof ExpiringItem },
        { header: 'Warehouse', accessor: 'warehouse' as keyof ExpiringItem },
        { header: 'Quantity', accessor: 'quantity' as keyof ExpiringItem },
        { 
            header: 'Mfg Date', 
            accessor: 'mfgDate' as keyof ExpiringItem,
            render: (item: ExpiringItem) => item.mfgDate || 'N/A'
        },
        { header: 'Expiry Date', accessor: 'expiryDate' as keyof ExpiringItem },
        { 
            header: 'Months to Expiry', 
            accessor: 'monthsToExpiry' as keyof ExpiringItem,
            render: (item: ExpiringItem) => {
                const color = item.monthsToExpiry <= 3 ? 'text-red-600 font-semibold' : 
                             item.monthsToExpiry <= 6 ? 'text-orange-600 font-semibold' : 
                             'text-gray-800 dark:text-gray-200';
                return <span className={color}>{item.monthsToExpiry} month{item.monthsToExpiry !== 1 ? 's' : ''}</span>;
            }
        },
    ];

    if (loading) {
        return <div className="text-center p-8">Loading expiring products...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Button onClick={() => navigate('/dashboard')} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        Expiring Products (Next 6 Months)
                    </h1>
                </div>
                <Button onClick={handleDownload} variant="primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                </Button>
            </div>

            <Card>
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {expiringItems.length} SKU{expiringItems.length !== 1 ? 's' : ''} with batches expiring within 6 months
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-600 rounded mr-2"></div>
                                <span>≤ 3 months</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-orange-600 rounded mr-2"></div>
                                <span>4-6 months</span>
                            </div>
                        </div>
                    </div>
                </div>

                {expiringItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No products expiring within the next 6 months</p>
                    </div>
                ) : (
                    <Table columns={columns} data={expiringItems} />
                )}
            </Card>
        </div>
    );
};

export default ExpiringProducts;
