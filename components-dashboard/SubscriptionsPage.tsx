import React, { useState } from 'react';

interface Subscription {
  id: string;
  company: string;
  email: string;
  logo: string;
  plan: string;
  planColor: string;
  billingStart: string;
  billingNext: string;
  autoRenewal: boolean;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  checked: boolean;
}

const SubscriptionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('All Plans');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: '1',
      company: 'Acme Corp',
      email: 'acme.co',
      logo: 'AC',
      plan: 'Enterprise',
      planColor: '#a855f7',
      billingStart: 'Jan 1, 2024',
      billingNext: 'Next: Feb 1, 2024',
      autoRenewal: true,
      status: 'Paid',
      checked: false
    },
    {
      id: '2',
      company: 'Global Logistics',
      email: 'globaliog.com',
      logo: 'GL',
      plan: 'Starter',
      planColor: '#06b6d4',
      billingStart: 'Mar 10, 2023',
      billingNext: 'Ends: Mar 10, 2024',
      autoRenewal: false,
      status: 'Overdue',
      checked: false
    },
    {
      id: '3',
      company: 'TechFlow Inc',
      email: 'techflow.io',
      logo: 'TF',
      plan: 'Professional',
      planColor: '#10b981',
      billingStart: 'Dec 15, 2023',
      billingNext: 'Next: Jan 15, 2024',
      autoRenewal: true,
      status: 'Pending',
      checked: false
    },
    {
      id: '4',
      company: 'Solaris Energy',
      email: 'solaris.energy',
      logo: 'SE',
      plan: 'Enterprise',
      planColor: '#a855f7',
      billingStart: 'Nov 20, 2023',
      billingNext: 'Next: Nov 20, 2024',
      autoRenewal: true,
      status: 'Paid',
      checked: false
    },
    {
      id: '5',
      company: 'Omega Labs',
      email: 'omega.labs',
      logo: 'OL',
      plan: 'Starter',
      planColor: '#06b6d4',
      billingStart: 'Aug 05, 2023',
      billingNext: 'Ends: Aug 05, 2024',
      autoRenewal: false,
      status: 'Cancelled',
      checked: false
    }
  ]);

  const toggleSubscriptionCheck = (id: string) => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === id ? { ...sub, checked: !sub.checked } : sub
    ));
  };

  const toggleAllSubscriptions = () => {
    const allChecked = subscriptions.every(s => s.checked);
    setSubscriptions(subscriptions.map(sub => ({ ...sub, checked: !allChecked })));
  };

  const toggleAutoRenewal = (id: string) => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === id ? { ...sub, autoRenewal: !sub.autoRenewal } : sub
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#10b981';
      case 'Pending': return '#f59e0b';
      case 'Overdue': return '#ef4444';
      case 'Cancelled': return '#64748b';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#0f172a' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
        <span style={{ color: '#64748b', cursor: 'pointer' }}>Admin</span>
        <span style={{ color: '#64748b' }}>›</span>
        <span style={{ color: 'white' }}>Subscriptions</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Subscription Management
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Manage and oversee all company billing plans, renewals, and payment statuses.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => alert('AI Insights feature coming soon!')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #10b981',
              borderRadius: '8px',
              color: '#10b981',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>✨</span> AI Insights
          </button>
          
          <button
            onClick={() => alert('Export CSV functionality coming soon!')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📥</span> Export CSV
          </button>

          <button
            onClick={() => alert('Add Subscription functionality coming soon!')}
            style={{
              padding: '10px 20px',
              background: '#4f46e5',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>+</span> Add Subscription
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Total ARR</p>
            <span style={{ fontSize: '20px' }}>📈</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>$1.2M</p>
          <p style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑</span> 5.4% vs last month
          </p>
        </div>

        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Active Subscriptions</p>
            <span style={{ fontSize: '20px' }}>📊</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>1420</p>
          <p style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑</span> 12% new subscribers
          </p>
        </div>

        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Churn Rate</p>
            <span style={{ fontSize: '20px' }}>📉</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>2.1%</p>
          <p style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>↑</span> 0.5% vs month (good)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
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
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '10px 16px',
            gap: '12px'
          }}>
            <span style={{ color: '#64748b' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by company, email..."
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
            background: '#0f172a',
            border: '1px solid #334155',
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
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          <option>All Statuses</option>
          <option>Paid</option>
          <option>Pending</option>
          <option>Overdue</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', background: '#0f172a' }}>
                <th style={{ padding: '16px 24px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={subscriptions.every(s => s.checked)}
                    onChange={toggleAllSubscriptions}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  COMPANY NAME
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PLAN
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  BILLING CYCLE
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  AUTO-RENEWAL
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  STATUS
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <input
                      type="checkbox"
                      checked={sub.checked}
                      onChange={() => toggleSubscriptionCheck(sub.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: sub.planColor + '30',
                        border: `2px solid ${sub.planColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: sub.planColor
                      }}>
                        {sub.logo}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{sub.company}</p>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: sub.planColor + '20',
                      color: sub.planColor,
                      border: `1px solid ${sub.planColor}40`
                    }}>
                      {sub.plan}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: 'white', fontWeight: '500' }}>{sub.billingStart}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{sub.billingNext}</p>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleAutoRenewal(sub.id)}
                      style={{
                        width: '48px',
                        height: '26px',
                        borderRadius: '13px',
                        background: sub.autoRenewal ? '#4f46e5' : '#64748b',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s'
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        top: '3px',
                        left: sub.autoRenewal ? '25px' : '3px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'white',
                        transition: 'all 0.3s'
                      }} />
                    </button>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getStatusColor(sub.status)
                      }} />
                      <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{sub.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => alert(`Actions menu for ${sub.company}`)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '20px',
                        padding: '4px 8px'
                      }}
                    >
                      ⋮
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
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Showing <span style={{ color: 'white', fontWeight: '600' }}>1</span> to <span style={{ color: 'white', fontWeight: '600' }}>5</span> of <span style={{ color: 'white', fontWeight: '600' }}>1,420</span> results
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              style={{
                padding: '8px 12px',
                background: '#4f46e5',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
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
                border: '1px solid #334155',
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
                border: '1px solid #334155',
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
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              10
            </button>
            <button
              style={{
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#94a3b8',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
