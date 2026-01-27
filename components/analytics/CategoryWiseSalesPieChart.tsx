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
import { getOutwardRecords, getProducts } from '../../services/firebaseService';
import { Product, Outward } from '../../types';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface SalesData {
  productName: string;
  category: string;
  unitsSold: number;
  month: string;
}

interface CategoryData {
  category: string;
  totalUnits: number;
  percentage: number;
  products: string[];
  color: string;
}

interface CategoryWiseSalesPieChartProps {
  selectedMonth?: string; // Format: "YYYY-MM"
  warehouseId?: string; // Optional warehouse filter
  height?: number;
}

// Category color mapping
const CATEGORY_COLORS = {
  'Hair Care': '#FF6B6B',
  'Face Care': '#4ECDC4',
  'Body Care': '#45B7D1',
  'Skin Care': '#96CEB4',
  'Eye Care': '#FECA57',
  'Lip Care': '#FF9FF3',
  'Baby Care': '#54A0FF',
  'Men Care': '#5F27CD',
  'Wellness': '#00D2D3',
  'Accessories': '#FF9F43'
};

const CategoryWiseSalesPieChart: React.FC<CategoryWiseSalesPieChartProps> = ({
  selectedMonth = new Date().toISOString().slice(0, 7), // Default to current month
  warehouseId,
  height = 400
}) => {
  const { company } = useCompany();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!company) return;
      
      setLoading(true);
      try {
        const [outwardRecords, productsData] = await Promise.all([
          getOutwardRecords({ companyId: company.id, warehouseId }),
          getProducts()
        ]);

        setProducts(productsData);
        
        // Transform outward records to sales data
        const transformedSalesData: SalesData[] = outwardRecords
          .filter((record: Outward) => {
            if (record.companyId !== company.id) return false;
            if (warehouseId && record.warehouseId !== warehouseId) return false;
            return true;
          })
          .map((record: Outward) => {
            const product = productsData.find(p => p.id === record.productId);
            const transactionDate = new Date(record.transactionDate || record.createdAt);
            const month = transactionDate.toISOString().slice(0, 7);
            
            return {
              productName: product?.name || record.sku,
              category: product?.category || 'Unknown',
              unitsSold: record.quantity,
              month: month
            };
          });

        setSalesData(transformedSalesData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [company, warehouseId]);

  // Process data for selected month
  const categoryData = useMemo(() => {
    // Filter by selected month
    const monthlyData = salesData.filter(item => item.month === selectedMonth);
    
    // Group by category
    const categoryGroups: { [key: string]: { totalUnits: number; products: Set<string> } } = {};
    
    monthlyData.forEach(item => {
      if (!categoryGroups[item.category]) {
        categoryGroups[item.category] = { totalUnits: 0, products: new Set() };
      }
      categoryGroups[item.category].totalUnits += item.unitsSold;
      categoryGroups[item.category].products.add(item.productName);
    });

    // Calculate total units across all categories
    const totalUnits = Object.values(categoryGroups).reduce((sum, group) => sum + group.totalUnits, 0);

    // Convert to category data with percentages
    const result: CategoryData[] = Object.entries(categoryGroups).map(([category, group]) => ({
      category,
      totalUnits: group.totalUnits,
      percentage: totalUnits > 0 ? (group.totalUnits / totalUnits) * 100 : 0,
      products: Array.from(group.products),
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#8B5CF6'
    }));

    // Sort by total units (descending)
    return result.sort((a, b) => b.totalUnits - a.totalUnits);
  }, [salesData, selectedMonth]);

  // Chart.js configuration
  const chartData = {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        data: categoryData.map(item => item.totalUnits),
        backgroundColor: categoryData.map(item => item.color),
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
            return categoryData[index].category;
          },
          label: (context: TooltipItem<'pie'>) => {
            const index = context.dataIndex;
            const category = categoryData[index];
            return [
              `Total Units: ${category.totalUnits}`,
              `Percentage: ${category.percentage.toFixed(1)}%`,
              '',
              'Products in this category:'
            ];
          },
          afterLabel: (context: TooltipItem<'pie'>) => {
            const index = context.dataIndex;
            const category = categoryData[index];
            return category.products.map(product => `• ${product}`);
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

  const totalUnits = categoryData.reduce((sum, item) => sum + item.totalUnits, 0);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading category sales data...</div>
        </div>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Category-Wise Sales</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400 text-center">
            <div className="text-lg mb-2">No sales data available</div>
            <div className="text-sm">for {selectedMonth}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Category-Wise Sales</h3>
        <div className="text-sm text-gray-400">
          Month: {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Pie Chart */}
        <div className="flex-1 relative" style={{ height: `${height}px` }}>
          <Pie data={chartData} options={chartOptions} />
          
          {/* Custom percentage labels overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalUnits}</div>
              <div className="text-sm text-gray-400">Total Units</div>
            </div>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="lg:w-80">
          <div className="space-y-3">
            {categoryData.map((category, index) => (
              <div
                key={category.category}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <div className="font-medium text-white">{category.category}</div>
                    <div className="text-xs text-gray-400">
                      {category.products.length} product{category.products.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {category.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    ({category.totalUnits} units)
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-sm font-medium text-gray-300 mb-2">Summary</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Categories:</span>
                <span className="text-white">{categoryData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Units Sold:</span>
                <span className="text-white">{totalUnits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Top Category:</span>
                <span className="text-white">
                  {categoryData[0]?.category || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryWiseSalesPieChart;