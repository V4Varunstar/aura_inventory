import React from 'react';
import { DashboardSidebar } from './components/DashboardSidebar';
import { Header } from './components/DashboardHeader';
import KPICard from './components/KPICard';
import CompaniesChart from './components/CompaniesChart';
import RecentCompaniesTable from './components/RecentCompaniesTable';
import { KPI_STATS } from './constants';

const App: React.FC = () => {
  return (
    <>
      <DashboardSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
        <Header />
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {KPI_STATS.map((kpi, index) => (
              <KPICard key={index} data={kpi} />
            ))}
          </div>

          {/* Content Split (Chart & Table) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <CompaniesChart />
            <RecentCompaniesTable />
          </div>
          
        </div>
      </main>
    </>
  );
};

export default App;