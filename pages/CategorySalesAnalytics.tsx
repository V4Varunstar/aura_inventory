import React, { useState } from 'react';
import CategoryWiseSalesPieChart from '../components/analytics/CategoryWiseSalesPieChart';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import { CalendarDays } from 'lucide-react';

const CategorySalesAnalytics: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Generate month options for the last 12 months
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthValue = date.toISOString().slice(0, 7);
      const monthLabel = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      options.push({ value: monthValue, label: monthLabel });
    }
    
    return options;
  };

  const monthOptions = getMonthOptions();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Category Sales Analytics
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="min-w-48"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <CategoryWiseSalesPieChart 
          selectedMonth={selectedMonth} 
          height={500}
        />
      </div>

      <Card title="How to Use">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Chart Features:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Pie Chart:</strong> Visual representation of sales by category</li>
                <li>• <strong>Percentages:</strong> Each slice shows percentage contribution</li>
                <li>• <strong>Unit Count:</strong> Hover to see total units sold</li>
                <li>• <strong>Product Details:</strong> Tooltip shows products in each category</li>
                <li>• <strong>Interactive:</strong> Hover over slices for detailed information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legend Information:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Color Coding:</strong> Each category has a unique color</li>
                <li>• <strong>Percentage & Units:</strong> Shows exact contribution and quantity</li>
                <li>• <strong>Product Count:</strong> Number of different products per category</li>
                <li>• <strong>Summary Stats:</strong> Total categories, units, and top performer</li>
                <li>• <strong>Sortable:</strong> Categories sorted by sales volume</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CategorySalesAnalytics;