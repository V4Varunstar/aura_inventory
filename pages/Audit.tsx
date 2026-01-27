import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import { Product, Inward, Outward, Warehouse } from '../types';
import { getProducts, getInwardRecords, getOutwardRecords, getProductStock, getWarehouses } from '../services/firebaseService';
import { getSources } from '../services/sourceService';
import { useCompany } from '../context/CompanyContext';
import { useWarehouse } from '../context/WarehouseContext';
import { Search, Package, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface AuditTransaction {
  id: string;
  date: Date;
  type: 'Inward' | 'Outward';
  quantity: number;
  warehouse: string;
  source?: string;
  destination?: string;
  batchNo?: string;
  reference?: string;
  notes?: string;
}

const Audit: React.FC = () => {
  const { company } = useCompany();
  const { selectedWarehouse } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'sku' | 'ean'>('sku');
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [transactions, setTransactions] = useState<AuditTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inwardRecords, setInwardRecords] = useState<Inward[]>([]);
  const [outwardRecords, setOutwardRecords] = useState<Outward[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inwardSources, setInwardSources] = useState<any[]>([]);
  const [outwardSources, setOutwardSources] = useState<any[]>([]);
  const [currentStock, setCurrentStock] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const companyId = company?.id || 'default';
      const [productsData, inwardsData, outwardsData, warehousesData, inwardSourcesData, outwardSourcesData] = await Promise.all([
        getProducts(),
        getInwardRecords({ companyId: company?.id, warehouseId: selectedWarehouse?.id }),
        getOutwardRecords({ companyId: company?.id, warehouseId: selectedWarehouse?.id }),
        getWarehouses(),
        getSources(companyId, 'inward'),
        getSources(companyId, 'outward'),
      ]);
      
      // Filter by company if available
      const filteredProducts = company?.id 
        ? productsData.filter(p => !p.companyId || p.companyId === company.id)
        : productsData;
      const filteredInwards = inwardsData;
      const filteredOutwards = outwardsData;
      
      setProducts(filteredProducts);
      setInwardRecords(filteredInwards);
      setOutwardRecords(filteredOutwards);
      setWarehouses(warehousesData);
      setInwardSources(inwardSourcesData);
      setOutwardSources(outwardSourcesData);
    };
    fetchData();
  }, [company?.id, selectedWarehouse?.id]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    
    console.log('Audit Search - inwardSources:', inwardSources);
    console.log('Audit Search - outwardSources:', outwardSources);
    
    const searchValue = searchTerm.trim().toLowerCase();
    
    // Find product by SKU or EAN
    let product: Product | undefined;
    if (searchType === 'sku') {
      product = products.find(p => p.sku.toLowerCase() === searchValue);
    } else {
      product = products.find(p => p.ean && p.ean.toLowerCase() === searchValue);
    }

    if (!product) {
      setSelectedProduct(null);
      setTransactions([]);
      setCurrentStock(0);
      setLoading(false);
      return;
    }

    setSelectedProduct(product);

    // Calculate current stock
    const stock = getProductStock(product.id, selectedWarehouse?.id, company?.id);
    setCurrentStock(stock);

    // Get all transactions for this product
    const allTransactions: AuditTransaction[] = [];

    // Add inward transactions
    inwardRecords
      .filter(record => record.productId === product.id)
      .filter(record => !selectedWarehouse || record.warehouseId === selectedWarehouse.id)
      .forEach(record => {
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        const source = inwardSources.find(s => s.id === record.source);
        allTransactions.push({
          id: record.id,
          date: record.createdAt,
          type: 'Inward',
          quantity: record.quantity,
          warehouse: warehouse?.name || record.warehouseId,
          source: source?.name || record.source,
          batchNo: record.batchNo,
          reference: record.documentNo,
          notes: record.notes,
        });
      });

    // Add outward transactions
    outwardRecords
      .filter(record => record.productId === product.id)
      .filter(record => !selectedWarehouse || record.warehouseId === selectedWarehouse.id)
      .forEach(record => {
        const warehouse = warehouses.find(w => w.id === record.warehouseId);
        const destination = outwardSources.find(s => s.id === record.destination);
        console.log('Audit - Processing outward:', {
          recordDestination: record.destination,
          outwardSources,
          foundDestination: destination,
          destinationName: destination?.name || record.destination
        });
        allTransactions.push({
          id: record.id,
          date: record.createdAt,
          type: 'Outward',
          quantity: record.quantity,
          warehouse: warehouse?.name || record.warehouseId,
          destination: destination?.name || record.destination,
          reference: record.shipmentRef,
          notes: record.notes,
        });
      });

    // Sort by date (most recent first)
    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTransactions(allTransactions);
    setLoading(false);
  };

  const totalInward = transactions
    .filter(t => t.type === 'Inward')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalOutward = transactions
    .filter(t => t.type === 'Outward')
    .reduce((sum, t) => sum + t.quantity, 0);

  const columns = [
    {
      header: 'Date',
      accessor: 'date' as keyof AuditTransaction,
      render: (item: AuditTransaction) => new Date(item.date).toLocaleDateString('en-IN'),
    },
    {
      header: 'Type',
      accessor: 'type' as keyof AuditTransaction,
      render: (item: AuditTransaction) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.type === 'Inward' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {item.type}
        </span>
      ),
    },
    {
      header: 'Quantity',
      accessor: 'quantity' as keyof AuditTransaction,
      render: (item: AuditTransaction) => (
        <span className={`font-semibold ${item.type === 'Inward' ? 'text-green-600' : 'text-red-600'}`}>
          {item.type === 'Inward' ? '+' : '-'}{item.quantity}
        </span>
      ),
    },
    {
      header: 'Warehouse',
      accessor: 'warehouse' as keyof AuditTransaction,
    },
    {
      header: 'Source / Destination',
      accessor: 'source' as keyof AuditTransaction,
      render: (item: AuditTransaction) => item.source || item.destination || '-',
    },
    {
      header: 'Batch No',
      accessor: 'batchNo' as keyof AuditTransaction,
      render: (item: AuditTransaction) => item.batchNo || '-',
    },
    {
      header: 'Reference',
      accessor: 'reference' as keyof AuditTransaction,
      render: (item: AuditTransaction) => item.reference || '-',
    },
    {
      header: 'Notes',
      accessor: 'notes' as keyof AuditTransaction,
      render: (item: AuditTransaction) => item.notes || '-',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Product Audit Trail</h1>

      {/* Search Section */}
      <Card title="Search Product">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search By
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="sku"
                  checked={searchType === 'sku'}
                  onChange={(e) => setSearchType(e.target.value as 'sku' | 'ean')}
                  className="mr-2"
                />
                SKU
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ean"
                  checked={searchType === 'ean'}
                  onChange={(e) => setSearchType(e.target.value as 'sku' | 'ean')}
                  className="mr-2"
                />
                EAN
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <Input
              label={searchType === 'sku' ? 'Enter SKU' : 'Enter EAN / Barcode'}
              placeholder={searchType === 'sku' ? 'e.g., AS-HS-50ML' : 'e.g., 8906158841965'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || loading}
              leftIcon={<Search />}
              className="w-full"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Product Summary */}
      {selectedProduct && (
        <>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Package className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Product</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                      {selectedProduct.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      SKU: {selectedProduct.sku}
                    </p>
                    {selectedProduct.ean && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        EAN: {selectedProduct.ean}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Inward</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalInward}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {transactions.filter(t => t.type === 'Inward').length} transactions
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Outward</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {totalOutward}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {transactions.filter(t => t.type === 'Outward').length} transactions
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <AlertCircle className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Stock</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {currentStock}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Available units
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Transaction History */}
          <Card title={`Transaction History (${transactions.length} records)`}>
            {transactions.length > 0 ? (
              <Table columns={columns} data={transactions} />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No transactions found for this product
              </div>
            )}
          </Card>
        </>
      )}

      {/* No Product Found */}
      {!selectedProduct && searchTerm && !loading && (
        <Card>
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">
              No product found with {searchType === 'sku' ? 'SKU' : 'EAN'}: <strong>{searchTerm}</strong>
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Please check the {searchType === 'sku' ? 'SKU' : 'EAN'} and try again
            </p>
          </div>
        </Card>
      )}

      {/* Instructions */}
      {!selectedProduct && !searchTerm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-2">How to use Product Audit:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Select search type: SKU or EAN/Barcode</li>
                <li>Enter the product identifier and click Search</li>
                <li>View complete transaction history with dates, quantities, and references</li>
                <li>See total inward, outward, and current available stock</li>
                <li>Track product movement across all warehouses</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audit;
