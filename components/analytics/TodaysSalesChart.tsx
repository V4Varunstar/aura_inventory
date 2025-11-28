import React from 'react';
import Card from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TodaysSalesChartProps {
  hourlySalesData: { hour: string; quantity: number }[];
  topSKUs: { sku: string; name: string; quantity: number }[];
  channelBreakdown: { name: string; value: number }[];
}

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f97316', '#8b5cf6', '#ec4899'];

const TodaysSalesChart: React.FC<TodaysSalesChartProps> = ({ hourlySalesData, topSKUs, channelBreakdown }) => {
  console.log('TodaysSalesChart - Hourly Data:', hourlySalesData);
  console.log('TodaysSalesChart - Top SKUs:', topSKUs);
  console.log('TodaysSalesChart - Channel Breakdown:', channelBreakdown);
  
  return (
    <div className="space-y-6">
      {/* Hourly Sales Chart */}
      <Card title="Today's Sales - Hourly Breakdown">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlySalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#10b981" name="Units Sold" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 SKUs */}
        <Card title="Top 5 Products Sold Today">
          <div className="space-y-3">
            {topSKUs.length > 0 ? (
              topSKUs.map((item, index) => (
                <div key={item.sku} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{item.sku}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{item.quantity}</p>
                    <p className="text-xs text-gray-500">units</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No sales data available</div>
            )}
          </div>
        </Card>

        {/* Channel-wise Breakdown */}
        <Card title="Sales by Channel">
          {channelBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={channelBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {channelBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {channelBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{item.value} units</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">No channel data available</div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TodaysSalesChart;
