import React, { useState } from 'react';

interface Company {
  id: string;
  name: string;
  email: string;
  avatar: string;
  orgId: string;
  planType: string;
  planColor: string;
  status: 'Active' | 'Expired' | 'Suspended';
  validityStart: string;
  validityEnd: string;
  loginEnabled: boolean;
}

const CompaniesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All Plans');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  
  const companies: Company[] = [
    {
      id: '1',
      name: 'Acme Corp',
      email: 'hello@acme.com',
      avatar: 'AC',
      orgId: 'ORG-8821',
      planType: 'Enterprise',
      planColor: '#f59e0b',
      status: 'Active',
      validityStart: 'Jan 01, 2024',
      validityEnd: 'to Dec 31, 2024',
      loginEnabled: true
    },
    {
      id: '2',
      name: 'Global Logistics',
      email: 'admin@glogistics.io',
      avatar: 'GL',
      orgId: 'ORG-9942',
      planType: 'Professional',
      planColor: '#3b82f6',
      status: 'Active',
      validityStart: 'Mar 15, 2024',
      validityEnd: 'to Mar 14, 2025',
      loginEnabled: true
    },
    {
      id: '3',
      name: 'FastTrack Shipping',
      email: 'ops@fasttrack.com',
      orgId: 'ORG-1823',
      planType: 'Starter',
      planColor: '#64748b',
      status: 'Expired',
      validityStart: 'Jun 01, 2023',
      validityEnd: 'Ended Jan 01, 2024',
      loginEnabled: false
    },
    {
      id: '4',
      name: 'TechNova Inc',
      email: 'billing@technova.com',
      avatar: 'TE',
      orgId: 'ORG-7781',
      planType: 'Enterprise',
      planColor: '#f59e0b',
      status: 'Active',
      validityStart: 'Sep 10, 2023',
      validityEnd: 'to Sep 09, 2024',
      loginEnabled: true
    },
    {
      id: '5',
      name: 'BlueSky Warehousing',
      email: 'contact@bluesky.net',
      avatar: 'BL',
      orgId: 'ORG-3312',
      planType: 'Professional',
      planColor: '#3b82f6',
      status: 'Suspended',
      validityStart: 'Jan 20, 2023',
      validityEnd: 'to Jan 19, 2024',
      loginEnabled: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Expired': return '#ef4444';
      case 'Suspended': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#112117' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          background: '#182820',
          border: '1px solid #2a4034',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Total Companies</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>1,248</p>
            <p style={{ fontSize: '12px', color: '#10b981' }}>↑ +12%</p>
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#10b98120',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🏢
          </div>
        </div>

        <div style={{
          background: '#182820',
          border: '1px solid #2a4034',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Active Subscriptions</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>1,085</p>
            <p style={{ fontSize: '12px', color: '#3b82f6' }}>87% Active</p>
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#3b82f620',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🎯
          </div>
        </div>

        <div style={{
          background: '#182820',
          border: '1px solid #2a4034',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Expiring Soon</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>24</p>
            <p style={{ fontSize: '12px', color: '#f59e0b' }}>In next 7 days</p>
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#f59e0b20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            ⏰
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div style={{
        background: '#182820',
        border: '1px solid #2a4034',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#112117',
            border: '1px solid #2a4034',
            borderRadius: '8px',
            padding: '10px 16px',
            gap: '12px'
          }}>
            <span style={{ color: '#64748b' }}>🔍</span>
            <input
              type="text"
              placeholder="Search company name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Plan Filter */}
        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          style={{
            padding: '10px 16px',
            background: '#112117',
            border: '1px solid #2a4034',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option>All Plans</option>
          <option>Enterprise</option>
          <option>Professional</option>
          <option>Starter</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '10px 16px',
            background: '#112117',
            border: '1px solid #2a4034',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Expired</option>
          <option>Suspended</option>
        </select>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <button
            onClick={() => alert('AI Insights feature coming soon!')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #36e27b',
              borderRadius: '8px',
              color: '#36e27b',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>✨</span> AI Insights
          </button>
          
          <button
            onClick={() => alert('Export functionality coming soon!')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #2a4034',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📥</span> Export
          </button>

          <button
            onClick={() => alert('Add Company functionality coming soon!')}
            style={{
              padding: '10px 20px',
              background: '#36e27b',
              border: 'none',
              borderRadius: '8px',
              color: '#0d1812',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>+</span> Add Company
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div style={{ background: '#182820', border: '1px solid #2a4034', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a4034', background: '#1a2820' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  COMPANY NAME
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ORG ID
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PLAN TYPE
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  STATUS
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  VALIDITY
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  LOGIN ACCESS
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} style={{ borderBottom: '1px solid #2a4034' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: company.planColor + '30',
                        border: `2px solid ${company.planColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: company.planColor
                      }}>
                        {company.avatar}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{company.name}</p>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {company.orgId}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: company.planColor + '20',
                      color: company.planColor,
                      border: `1px solid ${company.planColor}40`
                    }}>
                      {company.planType === 'Enterprise' && '⭐'}
                      {company.planType === 'Professional' && '🎯'}
                      {company.planType}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getStatusColor(company.status)
                      }} />
                      <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{company.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: 'white' }}>{company.validityStart}</p>
                      <p style={{
                        fontSize: '12px',
                        color: company.status === 'Expired' ? '#ef4444' : '#64748b'
                      }}>
                        {company.validityEnd}
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => alert(`Toggle login access for ${company.name}`)}
                      style={{
                        width: '48px',
                        height: '26px',
                        borderRadius: '13px',
                        background: company.loginEnabled ? '#36e27b' : '#64748b',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '3px',
                        left: company.loginEnabled ? '25px' : '3px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'white',
                        transition: 'all 0.3s'
                      }} />
                    </button>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => alert(`Actions menu for ${company.name}`)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '20px',
                        padding: '4px 8px'
                      }}
                    >
                      ⋯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #2a4034',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Showing <span style={{ color: 'white', fontWeight: '600' }}>1-5</span> of <span style={{ color: 'white', fontWeight: '600' }}>1,248</span> companies
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #2a4034',
                borderRadius: '6px',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Previous
            </button>
            <button
              style={{
                padding: '8px 12px',
                background: '#36e27b',
                border: 'none',
                borderRadius: '6px',
                color: '#0d1812',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              1
            </button>
            <button
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #2a4034',
                borderRadius: '6px',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              2
            </button>
            <button
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #2a4034',
                borderRadius: '6px',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              3
            </button>
            <span style={{ color: '#64748b', padding: '0 8px' }}>...</span>
            <button
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #2a4034',
                borderRadius: '6px',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              25
            </button>
            <button
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #2a4034',
                borderRadius: '6px',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
