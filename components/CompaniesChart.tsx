import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CHART_DATA } from '../constants';

const CompaniesChart: React.FC = () => {
  return (
    <div className="col-span-1 bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-border-dark shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg dark:text-white">Companies by Plan</h3>
        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-highlight text-gray-400 transition-colors">
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CHART_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                dy={10}
            />
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                    backgroundColor: '#182820', 
                    borderColor: '#2a4034', 
                    borderRadius: '0.5rem',
                    color: '#fff' 
                }}
                itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
              {CHART_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center border-t border-gray-100 dark:border-border-dark pt-4">
        <div>
          <p className="text-xs text-gray-500">Total Yearly</p>
          <p className="text-lg font-bold dark:text-white">856</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Monthly</p>
          <p className="text-lg font-bold dark:text-white">312</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Active Trials</p>
          <p className="text-lg font-bold dark:text-white">72</p>
        </div>
      </div>
    </div>
  );
};

export default CompaniesChart;