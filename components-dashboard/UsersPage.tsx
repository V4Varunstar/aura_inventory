import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  roleColor: string;
  permissions: string[];
  status: 'Active' | 'Blocked';
  lastLogin: string;
  checked: boolean;
}

const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: 'company-user'
  });
  
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Sarah Connor',
      email: 'sarah@skynet.com',
      avatar: '👩‍💼',
      role: 'Manager',
      roleColor: '#a855f7',
      permissions: ['Inventory', 'Reports'],
      status: 'Active',
      lastLogin: 'Oct 24, 2023 09:41 AM',
      checked: false
    },
    {
      id: '2',
      name: 'John Reese',
      email: 'john@machine.org',
      avatar: '👨‍💼',
      role: 'Admin',
      roleColor: '#3b82f6',
      permissions: ['Full Access'],
      status: 'Active',
      lastLogin: 'Just now',
      checked: false
    },
    {
      id: '3',
      name: 'Harold Finch',
      email: 'finch@library.com',
      avatar: '👨‍🦳',
      role: 'Viewer',
      roleColor: '#64748b',
      permissions: ['Read Only'],
      status: 'Blocked',
      lastLogin: 'Oct 10, 2023',
      checked: false
    },
    {
      id: '4',
      name: 'Samantha Groves',
      email: 'root@admin.com',
      avatar: '👩‍💻',
      role: 'Admin',
      roleColor: '#3b82f6',
      permissions: ['Full Access'],
      status: 'Active',
      lastLogin: '1 day ago',
      checked: false
    },
    {
      id: '5',
      name: 'Michael Thompson',
      email: 'michael.t@company.com',
      avatar: '👨‍💼',
      role: 'Manager',
      roleColor: '#a855f7',
      permissions: ['Inventory', 'Reports'],
      status: 'Active',
      lastLogin: '2 hours ago',
      checked: false
    },
    {
      id: '6',
      name: 'Emma Watson',
      email: 'emma.w@company.com',
      avatar: '👩‍💼',
      role: 'Viewer',
      roleColor: '#64748b',
      permissions: ['Read Only'],
      status: 'Active',
      lastLogin: '5 minutes ago',
      checked: false
    },
    {
      id: '7',
      name: 'David Chen',
      email: 'david.chen@company.com',
      avatar: '👨‍💻',
      role: 'Admin',
      roleColor: '#3b82f6',
      permissions: ['Full Access'],
      status: 'Active',
      lastLogin: 'Just now',
      checked: false
    },
    {
      id: '8',
      name: 'Lisa Anderson',
      email: 'lisa.a@company.com',
      avatar: '👩‍💼',
      role: 'Manager',
      roleColor: '#a855f7',
      permissions: ['Inventory', 'Reports'],
      status: 'Blocked',
      lastLogin: 'Oct 15, 2023',
      checked: false
    },
    {
      id: '9',
      name: 'James Wilson',
      email: 'james.w@company.com',
      avatar: '👨‍💼',
      role: 'Viewer',
      roleColor: '#64748b',
      permissions: ['Read Only'],
      status: 'Active',
      lastLogin: '30 minutes ago',
      checked: false
    },
    {
      id: '10',
      name: 'Sophie Martin',
      email: 'sophie.m@company.com',
      avatar: '👩‍💻',
      role: 'Admin',
      roleColor: '#3b82f6',
      permissions: ['Full Access'],
      status: 'Active',
      lastLogin: '3 hours ago',
      checked: false
    }
  ]);

  // Filter users based on search, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All Roles' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'All Status' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate KPIs
  const totalUsers = users.length;
  const activeNow = users.filter(u => u.status === 'Active' && (u.lastLogin.includes('now') || u.lastLogin.includes('ago'))).length;
  const blockedUsers = users.filter(u => u.status === 'Blocked').length;

  // Pagination
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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

  const toggleUserCheck = (id: string) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, checked: !user.checked } : user
    ));
  };

  const toggleAllUsers = () => {
    const allChecked = users.every(u => u.checked);
    setUsers(users.map(user => ({ ...user, checked: !allChecked })));
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.company) {
      alert('Please fill all fields');
      return;
    }

    // Save to localStorage
    const storedUsers = localStorage.getItem('inventoryUsers');
    const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
    
    const userToAdd = {
      email: newUser.email,
      password: newUser.password,
      name: newUser.name,
      role: 'company-user' as const,
      company: newUser.company
    };
    
    allUsers.push(userToAdd);
    localStorage.setItem('inventoryUsers', JSON.stringify(allUsers));
    
    alert(`User ${newUser.name} created successfully! They can now login with:\nEmail: ${newUser.email}\nPassword: ${newUser.password}`);
    
    setShowAddUserModal(false);
    setNewUser({ name: '', email: '', password: '', company: '', role: 'company-user' });
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: '#112117' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
        <span style={{ color: '#64748b', cursor: 'pointer' }}>Home</span>
        <span style={{ color: '#64748b' }}>›</span>
        <span style={{ color: '#64748b', cursor: 'pointer' }}>Administration</span>
        <span style={{ color: '#64748b' }}>›</span>
        <span style={{ color: 'white' }}>Company Users</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Company Users Management
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Manage access, roles, and permissions for all system users.
          </p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          style={{
            padding: '12px 24px',
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
          <span>+</span> Add New User
        </button>
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
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Total Users</p>
            <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>↗</span> 12%
            </span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{totalUsers}</p>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Across all departments</p>
        </div>

        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Active Now</p>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '4px solid #10b981',
              borderTopColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>✓</span>
            </div>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{activeNow}</p>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Currently logged in</p>
        </div>

        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Blocked Users</p>
            <span style={{ fontSize: '12px', color: '#64748b' }}>0% Change</span>
          </div>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{blockedUsers}</p>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Requires attention</p>
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
              placeholder="Search by name, email or role..."
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

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
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
          <option>All Roles</option>
          <option>Admin</option>
          <option>Manager</option>
          <option>Viewer</option>
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
          <option>All Status</option>
          <option>Active</option>
          <option>Blocked</option>
        </select>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <button
            onClick={() => {
              const stats = `Total Users: ${totalUsers}, Active: ${activeNow}, Blocked: ${blockedUsers}\nFiltered Results: ${filteredUsers.length} users`;
              alert(`Current Filters Applied:\n\nRole: ${selectedRole}\nStatus: ${selectedStatus}\nSearch: ${searchQuery || 'None'}\n\n${stats}`);
            }}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #334155',
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
            <span>⚙</span> Filters
          </button>
          
          <button
            onClick={() => {
              const csvContent = [
                ['Name', 'Email', 'Role', 'Status', 'Permissions', 'Last Login'].join(','),
                ...filteredUsers.map(user => [
                  user.name,
                  user.email,
                  user.role,
                  user.status,
                  user.permissions.join(' | '),
                  user.lastLogin
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
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
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>↓</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', background: '#0f172a' }}>
                <th style={{ padding: '16px 24px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={users.every(u => u.checked)}
                    onChange={toggleAllUsers}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  USER
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ROLE
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PERMISSIONS
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  STATUS
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  LAST LOGIN
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <input
                      type="checkbox"
                      checked={user.checked}
                      onChange={() => toggleUserCheck(user.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        {user.avatar}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{user.name}</p>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</p>
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
                      background: user.roleColor + '20',
                      color: user.roleColor,
                      border: `1px solid ${user.roleColor}40`
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {user.permissions.map((perm, idx) => (
                        <span key={idx} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          color: '#94a3b8'
                        }}>
                          <span style={{ fontSize: '16px' }}>
                            {perm === 'Full Access' && '🔓'}
                            {perm === 'Read Only' && '📖'}
                            {perm === 'Inventory' && '📦'}
                            {perm === 'Reports' && '📊'}
                          </span>
                          {perm}
                          {idx < user.permissions.length - 1 && ','}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: user.status === 'Active' ? '#10b981' : '#ef4444'
                      }} />
                      <span style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '500' }}>{user.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#94a3b8' }}>
                    {user.lastLogin}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center', position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenActionMenu(openActionMenu === user.id ? null : user.id);
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
                      ⋯
                    </button>
                    {openActionMenu === user.id && (
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
                          minWidth: '180px',
                          overflow: 'hidden'
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditUser({...user});
                            setShowEditUserModal(true);
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
                          Edit User
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
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
                            const action = user.status === 'Active' ? 'block' : 'unblock';
                            if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
                              setUsers(users.map(u => 
                                u.id === user.id 
                                  ? { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' } 
                                  : u
                              ));
                            }
                            setOpenActionMenu(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: user.status === 'Active' ? '#f59e0b' : '#10b981',
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
                          <span style={{ fontSize: '16px' }}>{user.status === 'Active' ? '🚫' : '✅'}</span>
                          {user.status === 'Active' ? 'Block User' : 'Unblock User'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
                              setUsers(users.filter(u => u.id !== user.id));
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
        {filteredUsers.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            background: '#1e293b',
            borderTop: '1px solid #334155',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px'
          }}>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
        )}
      </div>
      {/* Add User Modal */}
      {showAddUserModal && (
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
              Create Company User
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Add a new user who can login to their company dashboard
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
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
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@company.com"
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
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Minimum 6 characters"
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
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newUser.company}
                  onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
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

              <div style={{ 
                padding: '12px 16px', 
                background: '#4f46e520', 
                border: '1px solid #4f46e540',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#94a3b8'
              }}>
                💡 This user will be able to login and access their company's inventory dashboard
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setNewUser({ name: '', email: '', password: '', company: '', role: 'company-user' });
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
                onClick={handleAddUser}
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
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editUser && (
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
              Edit User
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              Update user information and permissions
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
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
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
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
                  Role *
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    let roleColor = '#64748b';
                    let permissions: string[] = [];
                    if (role === 'Admin') {
                      roleColor = '#3b82f6';
                      permissions = ['Full Access'];
                    } else if (role === 'Manager') {
                      roleColor = '#a855f7';
                      permissions = ['Inventory', 'Reports'];
                    } else {
                      roleColor = '#64748b';
                      permissions = ['Read Only'];
                    }
                    setEditUser({ ...editUser, role, roleColor, permissions });
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
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  value={editUser.status}
                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value as 'Active' | 'Blocked' })}
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
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              <div style={{ 
                padding: '12px 16px', 
                background: '#4f46e520', 
                border: '1px solid #4f46e540',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#94a3b8'
              }}>
                💡 Permissions: {editUser.permissions.join(', ')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditUser(null);
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
                  if (editUser.name && editUser.email) {
                    setUsers(users.map(u => u.id === editUser.id ? editUser : u));
                    setShowEditUserModal(false);
                    setEditUser(null);
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
      {showViewDetailsModal && selectedUser && (
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
                background: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                {selectedUser.avatar}
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                  {selectedUser.name}
                </h2>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                  {selectedUser.email}
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
                  Role
                </p>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: selectedUser.roleColor + '20',
                  color: selectedUser.roleColor,
                  border: `1px solid ${selectedUser.roleColor}40`
                }}>
                  {selectedUser.role}
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
                    background: selectedUser.status === 'Active' ? '#10b981' : '#ef4444'
                  }} />
                  <span style={{ fontSize: '16px', color: 'white', fontWeight: '600' }}>{selectedUser.status}</span>
                </div>
              </div>

              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Permissions
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedUser.permissions.map((perm, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>
                        {perm === 'Full Access' && '🔓'}
                        {perm === 'Read Only' && '📖'}
                        {perm === 'Inventory' && '📦'}
                        {perm === 'Reports' && '📊'}
                      </span>
                      <span style={{ fontSize: '14px', color: 'white' }}>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  Last Login
                </p>
                <p style={{ fontSize: '14px', color: 'white' }}>{selectedUser.lastLogin}</p>
              </div>

              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                  User ID
                </p>
                <p style={{ fontSize: '14px', color: 'white', fontFamily: 'monospace' }}>{selectedUser.id}</p>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowViewDetailsModal(false);
                  setSelectedUser(null);
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

export default UsersPage;
