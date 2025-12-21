import React from 'react';

const Sidebar: React.FC<{ onLogout?: () => void; activePage: string; setActivePage: (page: string) => void }> = ({ onLogout, activePage, setActivePage }) => {
  const menuItems = [
    { label: 'Dashboard', icon: '📊' },
    { label: 'Companies', icon: '🏢' },
    { label: 'Users', icon: '👥' },
    { label: 'Subscriptions', icon: '💳' },
    { label: 'Activity Logs', icon: '📋' },
    { label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside style={{
      width: '288px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #2a4034',
      background: '#0d1812',
      height: '100%',
      flexShrink: 0
    }}>
      {/* Header */}
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #36e27b 0%, #1e8449 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0d1812',
          fontWeight: 'bold',
          fontSize: '20px'
        }}>
          I
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>Inventory SaaS</h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Super Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingTop: '16px' }}>
        {menuItems.map((item) => {
          const isActive = activePage === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActivePage(item.label)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '24px',
                background: isActive ? '#36e27b20' : 'transparent',
                color: isActive ? '#36e27b' : '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#23362b';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div style={{ padding: '16px', borderTop: '1px solid #2a4034' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: '#23362b'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            AM
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Alex Morgan
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              alex@inventory.com
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
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
