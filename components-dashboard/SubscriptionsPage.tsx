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
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [editSub, setEditSub] = useState<Subscription | null>(null);
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
    },
    {
      id: '6',
      company: 'NexGen Solutions',
      email: 'nexgen.io',
      logo: 'NS',
      plan: 'Professional',
      planColor: '#10b981',
      billingStart: 'Jan 15, 2024',
      billingNext: 'Next: Feb 15, 2024',
      autoRenewal: true,
      status: 'Paid',
      checked: false
    },
    {
      id: '7',
      company: 'Digital Wave',
      email: 'digitalwave.com',
      logo: 'DW',
      plan: 'Enterprise',
      planColor: '#a855f7',
      billingStart: 'Feb 20, 2024',
      billingNext: 'Next: Mar 20, 2024',
      autoRenewal: true,
      status: 'Paid',
      checked: false
    },
    {
      id: '8',
      company: 'CloudFirst Inc',
      email: 'cloudfirst.io',
      logo: 'CF',
      plan: 'Starter',
      planColor: '#06b6d4',
      billingStart: 'Nov 10, 2023',
      billingNext: 'Next: Dec 10, 2024',
      autoRenewal: false,
      status: 'Overdue',
      checked: false
    }
  ]);

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.plan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = selectedPlan === 'All Plans' || sub.plan === selectedPlan;
    const matchesStatus = selectedStatus === 'All Statuses' || sub.status === selectedStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Calculate real-time KPIs - these recalculate on every render when subscriptions change
  const activeSubscriptions = subscriptions.filter(s => 
    s.status === 'Paid' || s.status === 'Pending'
  ).length;
  const totalSubscriptions = subscriptions.length;
  const paidSubscriptions = subscriptions.filter(s => s.status === 'Paid').length;
  const cancelledCount = subscriptions.filter(s => s.status === 'Cancelled').length;
  
  // Calculate ARR based on plan types (more realistic)
  const totalARR = subscriptions.reduce((total, sub) => {
    if (sub.status === 'Paid' || sub.status === 'Pending') {
      if (sub.plan === 'Enterprise') return total + 50000;
      if (sub.plan === 'Professional') return total + 25000;
      if (sub.plan === 'Starter') return total + 10000;
    }
    return total;
  }, 0);
  
  const churnRate = totalSubscriptions > 0 
    ? ((cancelledCount / totalSubscriptions) * 100).toFixed(1) 
    : '0.0';

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (openActionMenu) {
        setOpenActionMenu(null);
      }
    };
    if (openActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openActionMenu]);

  const toggleSubscriptionCheck = (id: string) => {
    setSubscriptions(prevSubs => prevSubs.map(sub =>
      sub.id === id ? { ...sub, checked: !sub.checked } : sub
    ));
  };

  const toggleAllSubscriptions = () => {
    setSubscriptions(prevSubs => {
      const allChecked = prevSubs.every(s => s.checked);
      return prevSubs.map(sub => ({ ...sub, checked: !allChecked }));
    });
  };

  const toggleAutoRenewal = (id: string) => {
    setSubscriptions(prevSubs => prevSubs.map(sub =>
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
            onClick={() => {
              const stats = `📊 Subscription Insights:\n\n` +
                `Total ARR: $${(totalARR / 1000000).toFixed(1)}M\n` +
                `Active Subscriptions: ${activeSubscriptions}\n` +
                `Churn Rate: ${churnRate}%\n` +
                `Cancelled: ${cancelledCount}\n\n` +
                `Filtered Results: ${filteredSubscriptions.length} subscriptions`;
              alert(stats);
            }}
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
            onClick={() => {
              const csvContent = [
                ['Company', 'Email', 'Plan', 'Billing Start', 'Next Billing', 'Auto-Renewal', 'Status'].join(','),
                ...filteredSubscriptions.map(sub => [
                  sub.company,
                  sub.email,
                  sub.plan,
                  sub.billingStart,
                  sub.billingNext,
                  sub.autoRenewal ? 'Yes' : 'No',
                  sub.status
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
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
            onClick={() => setShowAddModal(true)}
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
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>${(totalARR / 1000000).toFixed(1)}M</p>
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
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{activeSubscriptions}</p>
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
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{churnRate}%</p>
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
              {paginatedSubscriptions.map((sub) => (
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
                  <td style={{ padding: '16px 24px', textAlign: 'center', position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionMenu(openActionMenu === sub.id ? null : sub.id);
                      }}
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
                    {openActionMenu === sub.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          right: '60px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                          zIndex: 100,
                          minWidth: '200px',
                          overflow: 'hidden'
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditSub({...sub});
                            setShowEditModal(true);
                            setOpenActionMenu(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textAlign: 'left',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>✏️</span>
                          Edit Subscription
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSub(sub);
                            setShowViewDetailsModal(true);
                            setOpenActionMenu(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textAlign: 'left',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>👁️</span>
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to ${sub.status === 'Cancelled' ? 'reactivate' : 'cancel'} ${sub.company}'s subscription?`)) {
                              setSubscriptions(prevSubs => prevSubs.map(s => 
                                s.id === sub.id 
                                  ? { ...s, status: s.status === 'Cancelled' ? 'Paid' as 'Paid' : 'Cancelled' as 'Cancelled' } 
                                  : s
                              ));
                            }
                            setOpenActionMenu(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: sub.status === 'Cancelled' ? '#10b981' : '#f59e0b',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textAlign: 'left',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>{sub.status === 'Cancelled' ? '✅' : '⏸️'}</span>
                          {sub.status === 'Cancelled' ? 'Reactivate' : 'Cancel Subscription'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete ${sub.company}'s subscription? This action cannot be undone.`)) {
                              setSubscriptions(prevSubs => prevSubs.filter(s => s.id !== sub.id));
                            }
                            setOpenActionMenu(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textAlign: 'left',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>🗑️</span>
                          Delete
                        </button>
                      </div>
                    )}
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
            Showing <span style={{ color: 'white', fontWeight: '600' }}>{startIndex + 1}</span> to <span style={{ color: 'white', fontWeight: '600' }}>{Math.min(endIndex, filteredSubscriptions.length)}</span> of <span style={{ color: 'white', fontWeight: '600' }}>{filteredSubscriptions.length}</span> results
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                background: currentPage === 1 ? '#0f172a' : '#334155',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: currentPage === 1 ? '#475569' : 'white',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                style={{
                  padding: '8px 12px',
                  background: currentPage === page ? '#4f46e5' : '#334155',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  minWidth: '40px'
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                background: currentPage === totalPages ? '#0f172a' : '#334155',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: currentPage === totalPages ? '#475569' : 'white',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Add New Subscription
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Create a new subscription for a company
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="acme.co"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Plan *
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Professional">Professional</option>
                  <option value="Starter">Starter</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Billing Start Date *
                </label>
                <input
                  type="date"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" id="autoRenewal" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="autoRenewal" style={{ fontSize: '14px', color: 'white', cursor: 'pointer' }}>
                  Enable Auto-Renewal
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Subscription added successfully!');
                  setShowAddModal(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#4f46e5',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {showEditModal && editSub && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Edit Subscription
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Update subscription details for {editSub.company}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={editSub.company}
                  onChange={(e) => setEditSub({ ...editSub, company: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={editSub.email}
                  onChange={(e) => setEditSub({ ...editSub, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Plan *
                </label>
                <select
                  value={editSub.plan}
                  onChange={(e) => {
                    const plan = e.target.value;
                    let planColor = '#a855f7';
                    if (plan === 'Professional') planColor = '#10b981';
                    else if (plan === 'Starter') planColor = '#06b6d4';
                    setEditSub({ ...editSub, plan, planColor });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Professional">Professional</option>
                  <option value="Starter">Starter</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  value={editSub.status}
                  onChange={(e) => setEditSub({ ...editSub, status: e.target.value as 'Paid' | 'Pending' | 'Overdue' | 'Cancelled' })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  id="editAutoRenewal" 
                  checked={editSub.autoRenewal}
                  onChange={(e) => setEditSub({ ...editSub, autoRenewal: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                />
                <label htmlFor="editAutoRenewal" style={{ fontSize: '14px', color: 'white', cursor: 'pointer' }}>
                  Enable Auto-Renewal
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditSub(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editSub.company && editSub.email) {
                    setSubscriptions(prevSubs => prevSubs.map(s => s.id === editSub.id ? editSub : s));
                    setShowEditModal(false);
                    setEditSub(null);
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#4f46e5',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewDetailsModal && selectedSub && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '32px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: selectedSub.planColor + '30',
                border: `3px solid ${selectedSub.planColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: selectedSub.planColor
              }}>
                {selectedSub.logo}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                  {selectedSub.company}
                </h2>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                  {selectedSub.email}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Plan
                </p>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: selectedSub.planColor + '20',
                  color: selectedSub.planColor,
                  border: `1px solid ${selectedSub.planColor}40`
                }}>
                  {selectedSub.plan}
                </span>
              </div>

              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Status
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: getStatusColor(selectedSub.status)
                  }} />
                  <span style={{ fontSize: '16px', color: 'white', fontWeight: '600' }}>{selectedSub.status}</span>
                </div>
              </div>

              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Billing Cycle
                </p>
                <p style={{ fontSize: '14px', color: 'white', marginBottom: '4px' }}>Start: {selectedSub.billingStart}</p>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>{selectedSub.billingNext}</p>
              </div>

              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Auto-Renewal
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{selectedSub.autoRenewal ? '✅' : '❌'}</span>
                  <span style={{ fontSize: '14px', color: 'white' }}>{selectedSub.autoRenewal ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>

              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Subscription ID
                </p>
                <p style={{ fontSize: '14px', color: 'white', fontFamily: 'monospace' }}>{selectedSub.id}</p>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowViewDetailsModal(false);
                  setSelectedSub(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#4f46e5',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
