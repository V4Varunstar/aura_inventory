import React from 'react';
import DashboardSidebar from './components/DashboardSidebar-Clean';
import DashboardHeader from './components/DashboardHeader';
import KPICard from './components/KPICard';
import CompaniesChart from './components/CompaniesChart';
import RecentCompaniesTable from './components/RecentCompaniesTable';
import { KPI_STATS } from './constants-clean';

const App: React.FC = () => {
  return (
    <>
      <DashboardSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
        <DashboardHeader />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {KPI_STATS.map((kpi, index) => (
              <KPICard key={`kpi-${index}`} data={kpi} />
            ))}
          </div>

          {/* Charts and Tables Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="col-span-1">
              <CompaniesChart />
            </div>
            
            <div className="col-span-1 xl:col-span-2">
              <RecentCompaniesTable />
            </div>
          </div>
          
        </div>
      </main>
    </>
  );
};

export default App;