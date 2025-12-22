import React, { useState } from 'react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

interface CompanyDashboardProps {
  user: {
    name: string;
    company: string;
    email: string;
  };
  onLogout: () => void;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Laptop Dell XPS 15',
      sku: 'SKU-001',
      category: 'Electronics',
      quantity: 45,
      minStock: 10,
      price: 1200,
      status: 'In Stock',
      lastUpdated: '2 hours ago'
    },
    {
      id: '2',
      name: 'Office Chair Premium',
      sku: 'SKU-002',
      category: 'Furniture',
      quantity: 8,
      minStock: 15,
      price: 250,
      status: 'Low Stock',
      lastUpdated: '5 hours ago'
    },
    {
      id: '3',
      name: 'Wireless Mouse',
      sku: 'SKU-003',
      category: 'Electronics',
      quantity: 0,
      minStock: 20,
      price: 25,
      status: 'Out of Stock',
      lastUpdated: '1 day ago'
    },
    {
      id: '4',
      name: 'Desk Lamp LED',
      sku: 'SKU-004',
      category: 'Office Supplies',
      quantity: 120,
      minStock: 30,
      price: 35,
      status: 'In Stock',
      lastUpdated: '3 hours ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return '#10b981';
      case 'Low Stock': return '#f59e0b';
      case 'Out of Stock': return '#ef4444';
      default: return '#64748b';
    }
  };

  const sidebarItems = [
    { id: 'Dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'Inventory', icon: '📦', label: 'Inventory' },
    { id: 'Inward', icon: '📥', label: 'Inward Stock' },
    { id: 'Outward', icon: '📤', label: 'Outward Stock' },
    { id: 'Reports', icon: '📈', label: 'Reports' },
    { id: 'Settings', icon: '⚙️', label: 'Settings' }
  ];

  const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventoryItems.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: '#0f172a', fontFamily: 'system-ui' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: '#1e293b',
        borderRight: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        {/* Company Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #36e27b 0%, #1e8449 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏢
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>{user.company}</h2>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Inventory System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: activePage === item.id ? '#36e27b20' : 'transparent',
                  color: activePage === item.id ? '#36e27b' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activePage !== item.id) {
                    e.currentTarget.style.background = '#334155';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePage !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: '#334155'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#36e27b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#0d1812'
            }}>
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '4px'
              }}
              title="Logout"
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: '1px solid #334155',
          background: '#1e293b'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>Inventory Dashboard</h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>Welcome back, {user.name.split(' ')[0]}!</p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '10px 16px',
              gap: '12px',
              width: '300px'
            }}>
              <span style={{ color: '#64748b' }}>🔍</span>
              <input
                type="text"
                placeholder="Search inventory..."
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
        </header>

        {/* Dashboard Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#0f172a' }}>
          {activePage === 'Dashboard' && (
            <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>Total Items</p>
                <span style={{ fontSize: '32px' }}>📦</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{totalItems}</p>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>Across all categories</p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>Low Stock Alerts</p>
                <span style={{ fontSize: '32px' }}>⚠️</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>{lowStockItems}</p>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>Items need attention</p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>Total Value</p>
                <span style={{ fontSize: '32px' }}>💰</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>${totalValue.toLocaleString()}</p>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>Inventory worth</p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', opacity: 0.9 }}>Categories</p>
                <span style={{ fontSize: '32px' }}>📋</span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>3</p>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>Product categories</p>
            </div>
          </div>

          {/* Quick Actions & Inventory Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {/* Quick Actions */}
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '20px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <button
                  onClick={() => setShowAddItemModal(true)}
                  style={{
                    padding: '16px',
                    background: '#36e27b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0d1812',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '24px' }}>➕</span>
                  <span>Add New Item</span>
                </button>

                <button
                  onClick={() => setActivePage('Inward')}
                  style={{
                    padding: '16px',
                    background: '#3b82f6',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '24px' }}>📥</span>
                  <span>Stock Inward</span>
                </button>

                <button
                  onClick={() => setActivePage('Outward')}
                  style={{
                    padding: '16px',
                    background: '#f59e0b',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '24px' }}>📤</span>
                  <span>Stock Outward</span>
                </button>

                <button
                  onClick={() => setActivePage('Reports')}
                  style={{
                    padding: '16px',
                    background: '#a855f7',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '24px' }}>📊</span>
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Current Inventory</h3>
                <button
                  onClick={() => alert('Export functionality coming soon!')}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  📥 Export
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', background: '#0f172a' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Product</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>SKU</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Category</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Quantity</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Price</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{item.name}</p>
                            <p style={{ fontSize: '12px', color: '#64748b' }}>Updated {item.lastUpdated}</p>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8', fontFamily: 'monospace' }}>{item.sku}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8' }}>{item.category}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <div>
                            <p style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>{item.quantity}</p>
                            <p style={{ fontSize: '11px', color: '#64748b' }}>Min: {item.minStock}</p>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: 'white' }}>${item.price}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: getStatusColor(item.status) + '20',
                            color: getStatusColor(item.status),
                            border: `1px solid ${getStatusColor(item.status)}40`
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(item.status) }} />
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                          <button
                            onClick={() => alert(`Edit ${item.name} functionality coming soon!`)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              fontSize: '18px',
                              padding: '4px 8px'
                            }}
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
            </>
          )}

          {activePage === 'Inventory' && (
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: '#36e27b20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                📦
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                Inventory Management
              </h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '8px' }}>
                Full inventory management features coming soon...
              </p>
              <button
                onClick={() => setActivePage('Dashboard')}
                style={{
                  marginTop: '32px',
                  padding: '12px 32px',
                  background: '#36e27b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0d1812',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {activePage === 'Inward' && (
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: '#3b82f620',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                📥
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                Inward Stock Management
              </h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '8px' }}>
                Track and manage incoming inventory...
              </p>
              <button
                onClick={() => setActivePage('Dashboard')}
                style={{
                  marginTop: '32px',
                  padding: '12px 32px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {activePage === 'Outward' && (
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: '#f59e0b20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                📤
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                Outward Stock Management
              </h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '8px' }}>
                Track and manage outgoing inventory...
              </p>
              <button
                onClick={() => setActivePage('Dashboard')}
                style={{
                  marginTop: '32px',
                  padding: '12px 32px',
                  background: '#f59e0b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {activePage === 'Reports' && (
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: '#a855f720',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                📈
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                Reports & Analytics
              </h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '8px' }}>
                Generate detailed reports and analytics...
              </p>
              <button
                onClick={() => setActivePage('Dashboard')}
                style={{
                  marginTop: '32px',
                  padding: '12px 32px',
                  background: '#a855f7',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {activePage === 'Settings' && (
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: '#64748b20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                ⚙️
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>
                Company Settings
              </h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '8px' }}>
                Manage your company preferences and settings...
              </p>
              <button
                onClick={() => setActivePage('Dashboard')}
                style={{
                  marginTop: '32px',
                  padding: '12px 32px',
                  background: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
              Add New Inventory Item
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input
                type="text"
                placeholder="Product Name"
                style={{
                  padding: '12px 16px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="SKU"
                style={{
                  padding: '12px 16px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <select
                style={{
                  padding: '12px 16px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option>Select Category</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Office Supplies</option>
              </select>
              <input
                type="number"
                placeholder="Quantity"
                style={{
                  padding: '12px 16px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <input
                type="number"
                placeholder="Price"
                style={{
                  padding: '12px 16px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowAddItemModal(false)}
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
                  alert('Item added successfully!');
                  setShowAddItemModal(false);
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
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
