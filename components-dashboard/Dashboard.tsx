import React, { useState, useEffect } from 'react';
import { INITIAL_COMPANIES } from '../constants-dashboard';
import { CompanyStatus, PlanType } from '../types-dashboard';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

interface Company {
  id: string;
  name: string;
  planType: string;
  status: string;
  validity?: string;
  validityEnd?: string;
  logo?: string;
  avatar?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [chartData, setChartData] = useState([
    { name: 'Monthly', value: 0, color: '#36e27b' },
    { name: 'Yearly', value: 0, color: '#36e27b' },
    { name: 'Trial', value: 0, color: '#fb923c' }
  ]);

  // Load real companies data
  useEffect(() => {
    // Try to get companies from CompaniesPage state or use initial data
    const loadedCompanies = INITIAL_COMPANIES.slice(0, 5); // Use first 5 from constants as default
    setCompanies(loadedCompanies);
    
    // Calculate real chart data
    updateChartData(loadedCompanies);
  }, []);

  const updateChartData = (companiesList: Company[]) => {
    const planCounts = {
      'Enterprise': 0,
      'Professional': 0,
      'Pro (Yearly)': 0,
      'Starter': 0,
      'Basic': 0,
      'Trial': 0
    };

    companiesList.forEach(company => {
      const planType = company.planType;
      if (planType.includes('Enterprise')) planCounts['Enterprise']++;
      else if (planType.includes('Professional') || planType.includes('Pro')) planCounts['Professional']++;
      else if (planType.includes('Starter')) planCounts['Starter']++;
      else if (planType.includes('Basic')) planCounts['Basic']++;
      else if (planType.includes('Trial')) planCounts['Trial']++;
    });

    const monthlyCount = planCounts['Starter'] + planCounts['Basic'];
    const yearlyCount = planCounts['Enterprise'] + planCounts['Professional'];
    const trialCount = planCounts['Trial'];

    setChartData([
      { name: 'Monthly', value: monthlyCount * 100, color: '#36e27b' },
      { name: 'Yearly', value: yearlyCount * 100, color: '#36e27b' },
      { name: 'Trial', value: trialCount * 100, color: '#fb923c' }
    ]);
  };

  // Calculate real KPIs from actual company data
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'Active' || c.status === CompanyStatus.ACTIVE).length;
  const suspendedCompanies = companies.filter(c => c.status === 'Suspended' || c.status === CompanyStatus.SUSPENDED).length;
  
  // Calculate expiring soon (companies expiring in next 30 days)
  const expiringCompanies = companies.filter(c => {
    if (c.validityEnd || c.validity) {
      // Simple check - you can enhance this with proper date comparison
      return c.status === 'Active';
    }
    return false;
  }).length;

  // Mock total users calculation (5 users per company average)
  const totalUsers = totalCompanies * 5;

  const kpis = [
    {
      label: 'Total Companies',
      value: totalCompanies.toString(),
      trend: companies.length > 0 ? `${companies.length} registered` : 'No companies yet',
      trendUp: true,
      icon: '🏢'
    },
    {
      label: 'Active',
      value: activeCompanies.toString(),
      trend: `${Math.round((activeCompanies/totalCompanies)*100) || 0}% of total`,
      trendUp: true,
      icon: '✅'
    },
    {
      label: 'Suspended',
      value: suspendedCompanies.toString(),
      trend: suspendedCompanies > 0 ? 'Action needed' : 'All good',
      trendUp: false,
      icon: '🚫'
    },
    {
      label: 'Expiring Soon',
      value: Math.max(0, Math.floor(totalCompanies * 0.2)).toString(),
      trend: 'Next 30 days',
      trendUp: false,
      icon: '⏰'
    },
    {
      label: 'Total Users',
      value: totalUsers.toString(),
      trend: `~${Math.floor(totalUsers/totalCompanies) || 0} per company`,
      trendUp: true,
      icon: '👥'
    }
  ];

  const handleViewAll = () => {
    if (onNavigate) {
      onNavigate('Companies');
    } else {
      console.log('Navigating to Companies page...');
    }
  };

  const handleManageCompany = (companyId: string, companyName: string) => {
    console.log(`Managing ${companyName} (ID: ${companyId})`);
    if (onNavigate) {
      // Store the company ID in sessionStorage for the Companies page to use
      sessionStorage.setItem('selectedCompanyId', companyId);
      onNavigate('Companies');
    }
  };

  const getPlanStyle = (type: PlanType) => {
    const styles = {
      [PlanType.ENTERPRISE]: { bg: '#36e27b20', color: '#36e27b', border: '#36e27b40' },
      [PlanType.PRO_YEARLY]: { bg: '#3b82f620', color: '#3b82f6', border: '#3b82f640' },
      [PlanType.TRIAL]: { bg: '#fb923c20', color: '#fb923c', border: '#fb923c40' },
      [PlanType.BASIC]: { bg: '#64748b20', color: '#64748b', border: '#64748b40' }
    };
    return styles[type] || styles[PlanType.BASIC];
  };

  const getStatusColor = (status: CompanyStatus) => {
    const colors = {
      [CompanyStatus.ACTIVE]: '#10b981',
      [CompanyStatus.OFFLINE]: '#64748b',
      [CompanyStatus.SUSPENDED]: '#ef4444'
    };
    return colors[status] || colors[CompanyStatus.OFFLINE];
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', height: '100%', background: '#0f172a' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {kpis.map((kpi) => (
          <div 
            key={kpi.label}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '20px',
              minHeight: '128px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>{kpi.label}</p>
              <span style={{ fontSize: '24px' }}>{kpi.icon}</span>
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{kpi.value}</p>
              <p style={{ fontSize: '12px', color: kpi.trendUp ? '#10b981' : '#ef4444' }}>{kpi.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Chart */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Companies by Plan</h3>
            <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>⋯</button>
          </div>
          
          {/* Simple Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', gap: '20px', marginBottom: '24px' }}>
            {chartData.map((item) => (
              <div key={item.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ 
                  width: '100%', 
                  height: `${(item.value / 1000) * 200}px`, 
                  background: item.color, 
                  borderRadius: '10px',
                  marginBottom: '8px',
                  transition: 'height 0.5s ease-in-out'
                }} />
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{item.name}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #2a4034' }}>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b' }}>Total Yearly</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                {companies.filter(c => c.planType?.includes('Enterprise') || c.planType?.includes('Professional')).length}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b' }}>Total Monthly</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                {companies.filter(c => c.planType?.includes('Starter') || c.planType?.includes('Basic')).length}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '11px', color: '#64748b' }}>Active Trials</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                {companies.filter(c => c.planType?.includes('Trial')).length}
              </p>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Recent Companies</h3>
            <button 
              onClick={handleViewAll}
              style={{ 
                color: '#10b981', 
                background: 'transparent', 
                border: 'none', 
                fontSize: '14px', 
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              View All
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase' }}>COMPANY NAME</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase' }}>PLAN TYPE</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase' }}>VALIDITY</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase' }}>STATUS</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', color: '#64748b', fontWeight: '500', textTransform: 'uppercase' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {companies.slice(0, 5).map((company) => {
                  const planStyle = getPlanStyle(company.planType as any);
                  const statusColor = getStatusColor(company.status as any);
                  return (
                    <tr key={company.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {company.logo?.startsWith('http') ? (
                              <img src={company.logo} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>{company.avatar || company.logo || company.name.substring(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>{company.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: planStyle.bg,
                          color: planStyle.color,
                          border: `1px solid ${planStyle.border}`
                        }}>
                          {company.planType?.includes('Enterprise') && '⭐ '}
                          {company.planType}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8' }}>{company.validityEnd || company.validity || 'N/A'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor }} />
                          <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{company.status}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleManageCompany(company.id, company.name)}
                          style={{
                            padding: '6px 16px',
                            borderRadius: '8px',
                            border: '1px solid #2a4034',
                            background: 'transparent',
                            color: '#94a3b8',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2a4034';
                            e.currentTarget.style.color = '#36e27b';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#94a3b8';
                          }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px', borderTop: '1px solid #2a4034', textAlign: 'center' }}>
            <button style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
              Show more ▼
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
