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
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    email: '',
    password: '',
    planType: 'Enterprise',
    validityMonths: '12'
  });
  
  const [companies, setCompanies] = useState<Company[]>([
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
  ]);

  // Filter companies based on search, plan, and status
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.orgId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = selectedPlan === 'All Plans' || company.planType === selectedPlan;
    const matchesStatus = selectedStatus === 'All Status' || company.status === selectedStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Calculate KPIs
  const totalCompanies = companies.length;
  const activeSubscriptions = companies.filter(c => c.status === 'Active' && c.loginEnabled).length;
  const expiringSoon = companies.filter(c => {
    // Companies expiring in next 30 days
    return c.status === 'Active' && c.validityEnd.includes('2025');
  }).length;

  // Toggle login access
  const toggleLoginAccess = (companyId: string) => {
    setCompanies(companies.map(c => 
      c.id === companyId ? { ...c, loginEnabled: !c.loginEnabled } : c
    ));
  };

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenu) {
        setOpenActionMenu(null);
      }
    };
    
    if (openActionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openActionMenu]);

  // Export to CSV
  const handleExport = () => {
    const csvContent = [
      ['Company Name', 'Email', 'Org ID', 'Plan Type', 'Status', 'Validity Start', 'Validity End', 'Login Enabled'],
      ...filteredCompanies.map(c => [
        c.name, c.email, c.orgId, c.planType, c.status, c.validityStart, c.validityEnd, c.loginEnabled ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'companies_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Expired': return '#ef4444';
      case 'Suspended': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const handleAddCompany = () => {
    if (!newCompany.name || !newCompany.email || !newCompany.password) {
      alert('Please fill all required fields including password');
      return;
    }

    const planColors: { [key: string]: string } = {
      'Enterprise': '#f59e0b',
      'Professional': '#3b82f6',
      'Starter': '#64748b'
    };

    const orgId = `ORG-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + parseInt(newCompany.validityMonths));

    const companyData = {
      id: Date.now().toString(),
      name: newCompany.name,
      email: newCompany.email,
      avatar: newCompany.name.substring(0, 2).toUpperCase(),
      orgId: orgId,
      planType: newCompany.planType,
      planColor: planColors[newCompany.planType],
      status: 'Active' as const,
      validityStart: today.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      validityEnd: `to ${endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`,
      loginEnabled: true
    };

    // Create user credentials for this company
    const storedUsers = localStorage.getItem('inventoryUsers');
    const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
    
    const companyUser = {
      email: newCompany.email,
      password: newCompany.password,
      name: `${newCompany.name} Admin`,
      role: 'company-user' as const,
      company: newCompany.name,
      orgId: orgId
    };
    
    allUsers.push(companyUser);
    localStorage.setItem('inventoryUsers', JSON.stringify(allUsers));

    alert(`✅ Company "${newCompany.name}" created successfully!\n\n📋 LOGIN CREDENTIALS:\nEmail: ${newCompany.email}\nPassword: ${newCompany.password}\n\n🏢 Company Details:\nOrg ID: ${orgId}\nPlan: ${newCompany.planType}\nValidity: ${companyData.validityStart} ${companyData.validityEnd}\n\n⚠️ IMPORTANT: Save these credentials! Share them with the company admin.`);
    
    setShowAddCompanyModal(false);
    setNewCompany({ name: '', email: '', password: '', planType: 'Enterprise', validityMonths: '12' });
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
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{totalCompanies}</p>
            <p style={{ fontSize: '12px', color: '#10b981' }}>↑ +{Math.round((totalCompanies / 1000) * 100)}%</p>
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
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{activeSubscriptions}</p>
            <p style={{ fontSize: '12px', color: '#3b82f6' }}>{Math.round((activeSubscriptions / totalCompanies) * 100)}% Active</p>
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
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{expiringSoon}</p>
            <p style={{ fontSize: '12px', color: '#f59e0b' }}>In next 30 days</p>
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
            onClick={() => {
              const insights = `📊 AI INSIGHTS:\n\n• Total Companies: ${totalCompanies}\n• Active: ${activeSubscriptions} (${Math.round((activeSubscriptions/totalCompanies)*100)}%)\n• Expiring Soon: ${expiringSoon}\n• Revenue Health: Strong\n• Churn Risk: Low\n• Recommendation: Focus on renewal campaigns for expiring subscriptions`;
              alert(insights);
            }}
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
            onClick={handleExport}
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
            onClick={() => setShowAddCompanyModal(true)}
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
              {paginatedCompanies.length > 0 ? (
                paginatedCompanies.map((company) => (
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
                      onClick={() => toggleLoginAccess(company.id)}
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
                  <td style={{ padding: '16px 24px', textAlign: 'center', position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionMenu(openActionMenu === company.id ? null : company.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '20px',
                        padding: '4px 8px',
                        position: 'relative'
                      }}
                    >
                      ⋯
                    </button>

                    {/* Action Dropdown Menu */}
                    {openActionMenu === company.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          right: '24px',
                          top: '50px',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                          zIndex: 1000,
                          minWidth: '200px',
                          overflow: 'hidden'
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenu(null);
                            setEditingCompany(company);
                            setShowEditCompanyModal(true);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>✏️</span>
                          <span>Edit Company</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenu(null);
                            alert(`Company: ${company.name}\nEmail: ${company.email}\nOrg ID: ${company.orgId}\nPlan: ${company.planType}\nStatus: ${company.status}`);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>👁️</span>
                          <span>View Details</span>
                        </button>

                        <div style={{ height: '1px', background: '#334155', margin: '4px 0' }} />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenu(null);
                            if (company.status === 'Suspended') {
                              // Reactivate
                              if (confirm(`Reactivate ${company.name}?`)) {
                                setCompanies(companies.map(c => 
                                  c.id === company.id ? { ...c, status: 'Active', loginEnabled: true } : c
                                ));
                                alert(`${company.name} has been reactivated!`);
                              }
                            } else {
                              // Suspend
                              if (confirm(`Suspend ${company.name}? They will lose access immediately.`)) {
                                setCompanies(companies.map(c => 
                                  c.id === company.id ? { ...c, status: 'Suspended', loginEnabled: false } : c
                                ));
                                alert(`${company.name} has been suspended!`);
                              }
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#f59e0b',
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>{company.status === 'Suspended' ? '▶️' : '⏸️'}</span>
                          <span>{company.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setOpenActionMenu(null);
                            if (confirm(`Are you sure you want to delete ${company.name}?`)) {
                              setCompanies(companies.filter(c => c.id !== company.id));
                              alert('Company deleted successfully!');
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontSize: '16px' }}>🗑️</span>
                          <span>Delete Company</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ color: '#64748b' }}>
                      <p style={{ fontSize: '18px', marginBottom: '8px' }}>🔍</p>
                      <p style={{ fontSize: '14px' }}>No companies found</p>
                      <p style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
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
            Showing <span style={{ color: 'white', fontWeight: '600' }}>{startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)}</span> of <span style={{ color: 'white', fontWeight: '600' }}>{filteredCompanies.length}</span> companies
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #2a4034',
                borderRadius: '6px',
                color: currentPage === 1 ? '#3a4a44' : '#94a3b8',
                fontSize: '14px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            {[...Array(Math.min(3, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  style={{
                    padding: '8px 12px',
                    background: currentPage === pageNum ? '#36e27b' : 'transparent',
                    border: currentPage === pageNum ? 'none' : '1px solid #2a4034',
                    borderRadius: '6px',
                    color: currentPage === pageNum ? '#0d1812' : '#94a3b8',
                    fontSize: '14px',
                    fontWeight: currentPage === pageNum ? '600' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 3 && (
              <span style={{ color: '#64748b', padding: '0 8px' }}>...</span>
            )}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #2a4034',
                borderRadius: '6px',
                color: currentPage === totalPages ? '#3a4a44' : '#94a3b8',
                fontSize: '14px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>


      {/* Add Company Modal */}
      {showAddCompanyModal && (
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
            background: '#182820',
            border: '1px solid #2a4034',
            borderRadius: '12px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Add New Company
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Create a new company account with subscription plan
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="Acme Corporation"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#112117',
                    border: '1px solid #2a4034',
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
                  Email Address (Login ID) *
                </label>
                <input
                  type="email"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                  placeholder="admin@acme.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#112117',
                    border: '1px solid #2a4034',
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
                  Login Password *
                </label>
                <input
                  type="text"
                  value={newCompany.password}
                  onChange={(e) => setNewCompany({ ...newCompany, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#112117',
                    border: '1px solid #2a4034',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  💡 This will be the login password for the company admin
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Plan Type *
                </label>
                <select
                  value={newCompany.planType}
                  onChange={(e) => setNewCompany({ ...newCompany, planType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#112117',
                    border: '1px solid #2a4034',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
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
                  Subscription Duration *
                </label>
                <select
                  value={newCompany.validityMonths}
                  onChange={(e) => setNewCompany({ ...newCompany, validityMonths: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#112117',
                    border: '1px solid #2a4034',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                </select>
              </div>

              <div style={{ 
                padding: '12px 16px', 
                background: '#36e27b20', 
                border: '1px solid #36e27b40',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#94a3b8'
              }}>
                💡 An organization ID will be auto-generated for this company
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowAddCompanyModal(false);
                  setNewCompany({ name: '', email: '', planType: 'Enterprise', validityMonths: '12' });
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #2a4034',
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
                onClick={handleAddCompany}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#36e27b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0d1812',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {showEditCompanyModal && editingCompany && (
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
            background: '#182820',
            border: '1px solid #2a4034',
            borderRadius: '12px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Edit Company
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Update company information and subscription details
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={editingCompany.name}
                  onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#112117',
                    border: '1px solid #2a4034',
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
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editingCompany.email}
                  onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#112117',
                    border: '1px solid #2a4034',
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
                  Organization ID
                </label>
                <input
                  type="text"
                  value={editingCompany.orgId}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#0f1814',
                    border: '1px solid #2a4034',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Plan Type *
                </label>
                <select
                  value={editingCompany.planType}
                  onChange={(e) => {
                    const planColors: { [key: string]: string } = {
                      'Enterprise': '#f59e0b',
                      'Professional': '#3b82f6',
                      'Starter': '#64748b'
                    };
                    setEditingCompany({ 
                      ...editingCompany, 
                      planType: e.target.value,
                      planColor: planColors[e.target.value]
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#112117',
                    border: '1px solid #2a4034',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
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
                  Status *
                </label>
                <select
                  value={editingCompany.status}
                  onChange={(e) => setEditingCompany({ ...editingCompany, status: e.target.value as 'Active' | 'Expired' | 'Suspended' })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#112117',
                    border: '1px solid #2a4034',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div style={{ 
                padding: '12px 16px', 
                background: '#36e27b20', 
                border: '1px solid #36e27b40',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#94a3b8'
              }}>
                💡 Changes will be applied immediately
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowEditCompanyModal(false);
                  setEditingCompany(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #2a4034',
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
                  if (!editingCompany.name || !editingCompany.email) {
                    alert('Please fill all required fields');
                    return;
                  }
                  setCompanies(companies.map(c => 
                    c.id === editingCompany.id ? editingCompany : c
                  ));
                  alert(`${editingCompany.name} updated successfully!`);
                  setShowEditCompanyModal(false);
                  setEditingCompany(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#36e27b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0d1812',
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
    </div>
  );
};

export default CompaniesPage;

