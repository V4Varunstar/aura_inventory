import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [platformName, setPlatformName] = useState('Inventory SaaS');
  const [supportEmail, setSupportEmail] = useState('help@saas-inventory.com');
  const [timezone, setTimezone] = useState('(UTC+06:00) UTC');
  const [currency, setCurrency] = useState('USD ($)');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [allowPublicSignups, setAllowPublicSignups] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      if (!['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('Please upload SVG, PNG, or JPG file only');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    // Save all settings
    const settings = {
      platformName,
      supportEmail,
      timezone,
      currency,
      dateFormat,
      allowPublicSignups,
      maintenanceMode,
      logoFile: logoFile?.name || 'No file uploaded'
    };
    
    console.log('Saving settings:', settings);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const menuItems = [
    { id: 'General', icon: '⚙️', label: 'General', color: '#4f46e5' },
    { id: 'User Management', icon: '👥', label: 'User Management', color: '#64748b' },
    { id: 'Billing & Plans', icon: '💳', label: 'Billing & Plans', color: '#64748b' },
    { id: 'Notifications', icon: '🔔', label: 'Notifications', color: '#64748b' },
    { id: 'Integrations', icon: '🔗', label: 'Integrations', color: '#64748b' },
    { id: 'Danger Zone', icon: '⚠️', label: 'Danger Zone', color: '#ef4444' }
  ];

  return (
    <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden', background: '#0f172a' }}>
      {/* Left Sidebar Menu */}
      <div style={{
        width: '280px',
        background: '#1e293b',
        borderRight: '1px solid #334155',
        padding: '24px 16px',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            MAIN MENU
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: activeTab === item.id ? item.color : 'transparent',
                  color: activeTab === item.id ? 'white' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.background = '#334155';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
            SYSTEM
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.slice(4).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: activeTab === item.id ? item.color : 'transparent',
                  color: activeTab === item.id ? 'white' : (item.id === 'Danger Zone' ? '#ef4444' : '#94a3b8'),
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.background = '#334155';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <span style={{ color: '#64748b', cursor: 'pointer' }}>Home</span>
          <span style={{ color: '#64748b' }}>›</span>
          <span style={{ color: '#64748b', cursor: 'pointer' }}>Admin Panel</span>
          <span style={{ color: '#64748b' }}>›</span>
          <span style={{ color: 'white' }}>Platform Settings</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Platform Settings
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Manage global configurations, branding, billing, and system preferences.
          </p>
        </div>

        {/* User Management Tab */}
        {activeTab === 'User Management' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>User Management Settings</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
                Configure user roles, permissions, and access controls.
              </p>
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>👥</span>
                <p>User management features are available here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Billing & Plans Tab */}
        {activeTab === 'Billing & Plans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Billing & Plans Settings</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
                Manage subscription plans, pricing, and billing configurations.
              </p>
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>💳</span>
                <p>Billing and subscription management features are available here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'Notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Notification Settings</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
                Configure email notifications, alerts, and communication preferences.
              </p>
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🔔</span>
                <p>Notification configuration options are available here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'Integrations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Integrations</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
                Connect third-party services and APIs to extend platform functionality.
              </p>
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🔗</span>
                <p>Integration management and API connections are available here.</p>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'Danger Zone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ef4444', marginBottom: '8px' }}>⚠️ Danger Zone</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
                Critical operations that can affect the entire platform. Proceed with caution.
              </p>
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>⚠️</span>
                <p>System-wide reset and deletion options are available here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'General' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Platform Identity */}
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Platform Identity</h2>
                <button
                  style={{
                    padding: '8px 16px',
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
                  onClick={handleSaveChanges}
                >
                  💾 Save Changes
                </button>
              </div>
              {showSuccessMessage && (
                <div style={{
                  padding: '12px 16px',
                  background: '#10b98120',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontSize: '14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✅ Settings saved successfully!
                </div>
              )}
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
                Configure how the platform appears to your tenants and users.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
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
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Platform Logo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <div style={{
                  border: '2px dashed #334155',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#0f172a',
                  transition: 'all 0.2s'
                }}
                onClick={() => fileInputRef.current?.click()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4f46e5';
                  e.currentTarget.style.background = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.background = '#0f172a';
                }}
                >
                  {logoPreview ? (
                    <div>
                      <img src={logoPreview} alt="Logo preview" style={{ maxWidth: '200px', maxHeight: '100px', marginBottom: '16px' }} />
                      <p style={{ fontSize: '14px', color: '#10b981' }}>✅ {logoFile?.name}</p>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Click to change</p>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 16px',
                        background: '#4f46e5',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        📦
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: 'white', fontSize: '14px' }}>☁️ </span>
                        <span style={{ color: 'white', fontSize: '14px' }}>Click to upload or drag and drop</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>SVG, PNG, JPG (max. 800×400px)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Regional Settings</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
                Set the defaults for new accounts and system logs.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                    Default Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option>(UTC+06:00) UTC</option>
                    <option>(UTC+05:30) IST</option>
                    <option>(UTC+00:00) GMT</option>
                    <option>(UTC-05:00) EST</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                    Currency Symbol
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                    Date Format
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      cursor: 'pointer',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option>YYYY-MM-DD</option>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
            </div>

            {/* System Controls */}
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>System Controls</h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
                Manage access and availability of the platform.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Allow Public Signups */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: '#0f172a',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>👤</span>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>
                        Allow Public Signups
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                        If disabled, only admins can invite new users.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAllowPublicSignups(!allowPublicSignups)}
                    style={{
                      width: '48px',
                      height: '26px',
                      borderRadius: '13px',
                      background: allowPublicSignups ? '#4f46e5' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '3px',
                      left: allowPublicSignups ? '25px' : '3px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'all 0.3s'
                    }} />
                  </button>
                </div>

                {/* Maintenance Mode */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: '#0f172a',
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>🔧</span>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>
                        Maintenance Mode
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>
                        Restricts access to Super Admins only, displays a maintenance page to users.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    style={{
                      width: '48px',
                      height: '26px',
                      borderRadius: '13px',
                      background: maintenanceMode ? '#4f46e5' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '3px',
                      left: maintenanceMode ? '25px' : '3px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'all 0.3s'
                    }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
