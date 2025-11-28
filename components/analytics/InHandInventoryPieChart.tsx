import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '../ui/Card';

interface ProductInventory {
  name: string;
  inHandQty: number;
}

interface InHandInventoryPieChartProps {
  products: ProductInventory[];
}

// Generate vibrant colors for pie chart slices
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#F43F5E', // Rose
];

const InHandInventoryPieChart: React.FC<InHandInventoryPieChartProps> = ({ products }) => {
  console.log('InHandInventoryPieChart - RENDERING');
  console.log('InHandInventoryPieChart - products:', products);
  console.log('InHandInventoryPieChart - products length:', products?.length);
  
  if (!products || products.length === 0) {
    console.log('InHandInventoryPieChart - No products, showing empty state');
    return (
      <Card className="h-full">
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            In-Hand Inventory by Products
          </h3>
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No inventory data available
          </div>
        </div>
      </Card>
    );
  }
  
  // Filter out products with zero inventory
  const filteredProducts = products.filter(p => p.inHandQty > 0);
  
  console.log('InHandInventoryPieChart - filteredProducts:', filteredProducts);

  if (filteredProducts.length === 0) {
    console.log('InHandInventoryPieChart - All products have 0 quantity');
    return (
      <Card className="h-full">
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            In-Hand Inventory by Products
          </h3>
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No inventory data available
          </div>
        </div>
      </Card>
    );
  }

  // Format data for recharts
  const chartData = filteredProducts.map(product => ({
    name: product.name,
    value: product.inHandQty,
  }));

  // Custom label to show percentage and quantity
  const renderLabel = (entry: any) => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}% (${entry.value})`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Quantity: <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  console.log('InHandInventoryPieChart - chartData:', chartData);

  return (
    <Card className="h-full">
      <div className="flex flex-col h-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          In-Hand Inventory by Products
        </h3>
        <div style={{ height: '450px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="40%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                iconType="circle"
                wrapperStyle={{
                  paddingLeft: '30px',
                  fontSize: '16px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default InHandInventoryPieChart;
