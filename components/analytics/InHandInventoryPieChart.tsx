import React, { useState, useEffect, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  TooltipItem
} from 'chart.js';
import { useCompany } from '../../context/CompanyContext';
import { getProducts, getAllProductStocks, getWarehouses } from '../../services/firebaseService';
import { Product, Warehouse } from '../../types';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ProductInventoryData {
  productName: string;
  productSku: string;
  category: string;
  totalStock: number;
  percentage: number;
  color: string;
  warehouseStocks: { warehouseId: string; warehouseName: string; quantity: number }[];
}

interface InHandInventoryPieChartProps {
  selectedWarehouse?: string; // Filter by warehouse
  height?: number;
}

// Product color mapping - vibrant colors
const PRODUCT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#A55EEA', '#26C6DA', '#42A5F5', '#66BB6A', '#FFEE58',
  '#FF8A65', '#8D6E63', '#78909C', '#F06292', '#7986CB'
];

const InHandInventoryPieChart: React.FC<InHandInventoryPieChartProps> = ({
  selectedWarehouse = 'all',
  height = 400
}) => {
  const { company } = useCompany();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productStocks, setProductStocks] = useState<any>({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!company) return;
      
      setLoading(true);
      try {
        const [productsData, stocksData, warehousesData] = await Promise.all([
          getProducts(),
          getAllProductStocks(),
          getWarehouses()
        ]);

        setProducts(productsData.filter(p => p.companyId === company.id));
        setProductStocks(stocksData);
        setWarehouses(warehousesData.filter(w => w.companyId === company.id));
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [company]);

  // Calculate stock data using the same method as Products page
  const inventoryData = useMemo(() => {
    const productInventory: ProductInventoryData[] = [];
    
    products.forEach((product, index) => {
      const stockData = productStocks[product.id];
      if (!stockData) return;
      
      const totalStock = stockData.total || 0;
      
      if (totalStock > 0) {
        const warehouseStocks: { warehouseId: string; warehouseName: string; quantity: number }[] = [];
        
        // Get warehouse breakdown
        if (stockData.byWarehouse) {
          Object.entries(stockData.byWarehouse).forEach(([warehouseId, quantity]: [string, any]) => {
            const warehouse = warehouses.find(w => w.id === warehouseId);
            if (warehouse && quantity > 0) {
              warehouseStocks.push({
                warehouseId: warehouse.id,
                warehouseName: warehouse.name,
                quantity: quantity
              });
            }
          });
        }
        
        productInventory.push({
          productName: product.name,
          productSku: product.sku,
          category: product.category,
          totalStock: totalStock,
          percentage: 0, // Will be calculated below
          color: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
          warehouseStocks: warehouseStocks
        });
      }
    });

    // Calculate percentages
    const totalInventory = productInventory.reduce((sum, item) => sum + item.totalStock, 0);
    productInventory.forEach(item => {
      item.percentage = totalInventory > 0 ? (item.totalStock / totalInventory) * 100 : 0;
    });

    // Sort by stock quantity (descending)
    return productInventory.sort((a, b) => b.totalStock - a.totalStock);
  }, [products, warehouses, productStocks, selectedWarehouse, company]);

  // Chart.js configuration
  const chartData = {
    labels: inventoryData.map(item => item.productName),
    datasets: [
      {
        data: inventoryData.map(item => item.totalStock),
        backgroundColor: inventoryData.map(item => item.color),
        borderColor: '#1E1E1E',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 10
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // We'll create custom legend
      },
      tooltip: {
        backgroundColor: '#2D2D2D',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#444444',
        borderWidth: 1,
        callbacks: {
          title: (context: TooltipItem<'pie'>[]) => {
            const index = context[0].dataIndex;
            return inventoryData[index].productName;
          },
          label: (context: TooltipItem<'pie'>) => {
            const index = context.dataIndex;
            const product = inventoryData[index];
            return [
              `SKU: ${product.productSku}`,
              `Category: ${product.category}`,
              `Total Stock: ${product.totalStock}`,
              `Percentage: ${product.percentage.toFixed(1)}%`,
              '',
              'Warehouse Distribution:'
            ];
          },
          afterLabel: (context: TooltipItem<'pie'>) => {
            const index = context.dataIndex;
            const product = inventoryData[index];
            return product.warehouseStocks.map(wh => `• ${wh.warehouseName}: ${wh.quantity} units`);
          }
        }
      }
    },
    elements: {
      arc: {
        borderJoinStyle: 'round' as const
      }
    },
    layout: {
      padding: 20
    }
  };

  const totalStock = inventoryData.reduce((sum, item) => sum + item.totalStock, 0);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  if (inventoryData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">In-Hand Inventory by Products</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400 text-center">
            <div className="text-lg mb-2">No inventory data available</div>
            <div className="text-sm">No products have stock in inventory</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">In-Hand Inventory by Products</h3>
        <div className="text-sm text-gray-400">
          Total Products: {inventoryData.length}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie Chart */}
        <div className="flex-1 relative" style={{ height: `${height}px` }}>
          <Pie data={chartData} options={chartOptions} />
          
          {/* Custom total display in center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalStock}</div>
              <div className="text-sm text-gray-400">Total Units</div>
            </div>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="lg:w-80">
          <div className="space-y-3">
            {inventoryData.slice(0, 10).map((product, index) => (
              <div
                key={product.productSku}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: product.color }}
                  />
                  <div>
                    <div className="font-medium text-white">{product.productName}</div>
                    <div className="text-xs text-gray-400">
                      SKU: {product.productSku} • {product.category}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {product.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    ({product.totalStock} units)
                  </div>
                </div>
              </div>
            ))}
            
            {inventoryData.length > 10 && (
              <div className="text-center text-sm text-gray-400 py-2">
                ... and {inventoryData.length - 10} more products
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-sm font-medium text-gray-300 mb-2">Inventory Summary</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Products:</span>
                <span className="text-white">{inventoryData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Stock:</span>
                <span className="text-white">{totalStock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Highest Stock:</span>
                <span className="text-white">
                  {inventoryData[0]?.productName || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Top Stock Count:</span>
                <span className="text-white">
                  {inventoryData[0]?.totalStock || 0} units
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InHandInventoryPieChart;
