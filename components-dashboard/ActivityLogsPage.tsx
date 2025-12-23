import React, { useState } from 'react';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  company: string;
  action: string;
  actionType: 'Update' | 'Create' | 'Delete' | 'Login';
  description: string;
  ipAddress: string;
}

const ActivityLogsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [actionType, setActionType] = useState('All');
  const [targetCompany, setTargetCompany] = useState('All');
  const [status, setStatus] = useState('Success');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const activityLogs: ActivityLog[] = [
    {
      id: '1',
      timestamp: '2023-10-24 14:32:01',
      user: {
        name: 'Sarah Jenkins',
        email: 'sarah@acmecorp.com',
        avatar: '👩‍💼'
      },
      company: 'Acme Corp',
      action: 'Update',
      actionType: 'Update',
      description: 'Changed billing tier',
      ipAddress: '192.168.1.15'
    },
    {
      id: '2',
      timestamp: '2023-10-24 12:15:45',
      user: {
        name: 'Michael Chen',
        email: 'm.chen@globex.io',
        avatar: '👨‍💼'
      },
      company: 'Globex Inc.',
      action: 'Create',
      actionType: 'Create',
      description: 'Added new user',
      ipAddress: '10.0.0.42'
    },
    {
      id: '3',
      timestamp: '2023-10-24 09:18:22',
      user: {
        name: 'John Doe',
        email: 'john@startup.co',
        avatar: '👨'
      },
      company: 'Startup Co',
      action: 'Delete',
      actionType: 'Delete',
      description: 'Removed inventory item',
      ipAddress: '172.16.254.1'
    },
    {
      id: '4',
      timestamp: '2023-10-23 18:45:11',
      user: {
        name: 'Emily Davis',
        email: 'emily@enterprise.net',
        avatar: '👩'
      },
      company: 'Enterprise Net',
      action: 'Login',
      actionType: 'Login',
      description: 'Failed login attempt',
      ipAddress: '192.168.0.23'
    },
    {
      id: '5',
      timestamp: '2023-10-23 16:28:05',
      user: {
        name: 'System Admin',
        email: 'sysadmin@saas.io',
        avatar: 'SA'
      },
      company: 'System',
      action: 'Update',
      actionType: 'Update',
      description: 'Auto-scaling trigger',
      ipAddress: 'localhost'
    }
  ];

  // Filter activity logs
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.ipAddress.includes(searchQuery);
    const matchesAction = actionType === 'All' || actionType === 'Action Type: All' || log.actionType === actionType;
    const matchesCompany = targetCompany === 'All' || targetCompany === 'Target Company: All' || log.company === targetCompany;
    return matchesSearch && matchesAction && matchesCompany;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'Update': return '#3b82f6';
      case 'Create': return '#10b981';
      case 'Delete': return '#ef4444';
      case 'Login': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#0f172a' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
          Activity Logs
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          Audit system-wide actions performed by users and admins across the platform.
        </p>
      </div>

      {/* Search and Actions Bar */}
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px'
      }}>
        {/* Search and Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: '1 1 400px', minWidth: '250px' }}>
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
                placeholder="Search by user, IP, or description..."
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

          {/* Date Filter */}
          <button
            onClick={() => setShowDateModal(true)}
            style={{
              padding: '10px 16px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📅</span> {dateFilter}
          </button>

          {/* Export CSV */}
          <button
            onClick={() => {
              const csvContent = [
                ['Timestamp', 'User', 'Email', 'Company', 'Action', 'Description', 'IP Address'].join(','),
                ...filteredLogs.map(log => [
                  log.timestamp,
                  log.user.name,
                  log.user.email,
                  log.company,
                  log.actionType,
                  log.description,
                  log.ipAddress
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
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
              gap: '8px',
              marginLeft: 'auto'
            }}
          >
            <span>📥</span> Export CSV
          </button>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
            <span>⚙</span>
            <span>Filters:</span>
          </div>

          {/* Action Type Filter */}
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            style={{
              padding: '8px 14px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option>Action Type: All</option>
            <option>Update</option>
            <option>Create</option>
            <option>Delete</option>
            <option>Login</option>
          </select>

          {/* Target Company Filter */}
          <select
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            style={{
              padding: '8px 14px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option>Target Company: All</option>
            <option>Acme Corp</option>
            <option>Globex Inc.</option>
            <option>Startup Co</option>
            <option>Enterprise Net</option>
            <option>System</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: '8px 14px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option>Status: Success</option>
            <option>Status: Failed</option>
            <option>Status: All</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setActionType('All');
              setTargetCompany('All');
              setStatus('Success');
              setSearchQuery('');
            }}
            style={{
              padding: '8px 14px',
              background: 'transparent',
              border: 'none',
              color: '#4f46e5',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '500',
              marginLeft: 'auto'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', background: '#0f172a' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  TIMESTAMP
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  USER
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  COMPANY
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ACTION
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  IP ADDRESS
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  DETAILS
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px'
                      }}>
                        {log.user.avatar}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{log.user.name}</p>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>{log.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#e2e8f0' }}>
                    {log.company}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: getActionColor(log.actionType) + '20',
                        color: getActionColor(log.actionType),
                        border: `1px solid ${getActionColor(log.actionType)}40`,
                        marginBottom: '4px'
                      }}>
                        {log.actionType} ●
                      </span>
                      <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{log.description}</p>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {log.ipAddress}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetailsModal(true);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '18px',
                        padding: '4px 8px'
                      }}
                    >
                      👁
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#94a3b8' }}>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              <span style={{ color: 'white', fontWeight: '600' }}>{startIndex + 1}-{Math.min(endIndex, filteredLogs.length)}</span> of <span style={{ color: 'white', fontWeight: '600' }}>{filteredLogs.length}</span>
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 10px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: currentPage === 1 ? '#475569' : '#94a3b8',
                  fontSize: '14px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ‹
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 10px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: currentPage === totalPages ? '#475569' : '#94a3b8',
                  fontSize: '14px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Modal */}
      {showDateModal && (
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
            maxWidth: '400px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Select Date Range
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Choose a predefined time range for activity logs
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last Year', 'All Time'].map(range => (
                <button
                  key={range}
                  onClick={() => {
                    setDateFilter(range);
                    setShowDateModal(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    background: dateFilter === range ? '#4f46e520' : 'transparent',
                    border: `1px solid ${dateFilter === range ? '#4f46e5' : '#334155'}`,
                    borderRadius: '8px',
                    color: dateFilter === range ? '#4f46e5' : 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (dateFilter !== range) {
                      e.currentTarget.style.background = '#334155';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (dateFilter !== range) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {range}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => setShowDateModal(false)}
                style={{
                  width: '100%',
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
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedLog && (
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
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
              Activity Details
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Complete information about this activity log
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* User Info */}
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '600' }}>
                  User Information
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {selectedLog.user.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>{selectedLog.user.name}</p>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>{selectedLog.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Action Info */}
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Action Type
                </p>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: getActionColor(selectedLog.actionType) + '20',
                  color: getActionColor(selectedLog.actionType),
                  border: `1px solid ${getActionColor(selectedLog.actionType)}40`
                }}>
                  {selectedLog.actionType}
                </span>
                <p style={{ fontSize: '14px', color: 'white', marginTop: '12px' }}>{selectedLog.description}</p>
              </div>

              {/* Company */}
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Target Company
                </p>
                <p style={{ fontSize: '16px', color: 'white', fontWeight: '500' }}>{selectedLog.company}</p>
              </div>

              {/* Timestamp */}
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Timestamp
                </p>
                <p style={{ fontSize: '14px', color: 'white', fontFamily: 'monospace' }}>{selectedLog.timestamp}</p>
              </div>

              {/* IP Address */}
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  IP Address
                </p>
                <p style={{ fontSize: '14px', color: 'white', fontFamily: 'monospace' }}>{selectedLog.ipAddress}</p>
              </div>

              {/* Activity ID */}
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Activity ID
                </p>
                <p style={{ fontSize: '14px', color: 'white', fontFamily: 'monospace' }}>{selectedLog.id}</p>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLog(null);
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

export default ActivityLogsPage;
