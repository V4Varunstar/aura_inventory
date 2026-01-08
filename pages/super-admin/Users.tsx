import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { Company, Role } from '../../types';
import { createCompanyUser, getAllCompanies, updateCompanyUser } from '../../services/superAdminService';

type StoredSuperAdminUser = {
  id?: string;
  name?: string;
  email?: string;
  companyId?: string;
  orgId?: string;
  password?: string;
  role?: Role | string;
  isEnabled?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

const SuperAdminUsers: React.FC = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<StoredSuperAdminUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Blocked'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    companyId: '',
    name: '',
    email: '',
    role: Role.Manager as Role,
    password: '',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTargetEmail, setEditTargetEmail] = useState<string>('');
  const [editForm, setEditForm] = useState({
    companyId: '',
    name: '',
    role: Role.Manager as Role,
    password: '',
    status: 'Active' as 'Active' | 'Blocked',
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetTargetEmail, setResetTargetEmail] = useState<string>('');
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    const loadUsers = () => {
      try {
        const raw = localStorage.getItem('superadmin_users');
        const parsed = raw ? (JSON.parse(raw) as StoredSuperAdminUser[]) : [];
        setUsers(Array.isArray(parsed) ? parsed : []);
      } catch {
        setUsers([]);
      }
    };

    loadUsers();
  }, []);

  const openCreate = async () => {
    setShowCreateModal(true);
    try {
      const list = await getAllCompanies();
      setCompanies(list);
      if (!createForm.companyId && list.length > 0) {
        setCreateForm((p) => ({ ...p, companyId: list[0].id }));
      }
    } catch {
      setCompanies([]);
    }
  };

  const openEdit = async (email: string) => {
    const targetEmail = String(email ?? '').trim();
    if (!targetEmail) return;

    setShowEditModal(true);
    setEditTargetEmail(targetEmail);

    try {
      const list = await getAllCompanies();
      setCompanies(list);

      const raw = localStorage.getItem('superadmin_users');
      const parsed = raw ? (JSON.parse(raw) as StoredSuperAdminUser[]) : [];
      const record = Array.isArray(parsed)
        ? parsed.find(
            (u) => String(u?.email ?? '').trim().toLowerCase() === targetEmail.toLowerCase()
          )
        : undefined;

      const fallbackCompanyId = record?.companyId || list[0]?.id || '';

      setEditForm({
        companyId: fallbackCompanyId,
        name: String(record?.name ?? ''),
        role: (record?.role ?? Role.Manager) as Role,
        password: '',
        status: record?.isEnabled === false ? 'Blocked' : 'Active',
      });
    } catch {
      // keep modal open, but clear companies to avoid invalid selections
      setCompanies([]);
    }
  };

  const closeEdit = () => {
    if (editing) return;
    setShowEditModal(false);
    setEditTargetEmail('');
    setEditForm({ companyId: '', name: '', role: Role.Manager, password: '', status: 'Active' });
  };

  const openResetPassword = (email: string) => {
    const targetEmail = String(email ?? '').trim();
    if (!targetEmail) return;
    setShowResetModal(true);
    setResetTargetEmail(targetEmail);
    setResetPassword('');
  };

  const closeResetPassword = () => {
    if (resetting) return;
    setShowResetModal(false);
    setResetTargetEmail('');
    setResetPassword('');
  };

  const closeCreate = () => {
    if (creating) return;
    setShowCreateModal(false);
  };

  const reloadUsersFromStorage = () => {
    try {
      const raw = localStorage.getItem('superadmin_users');
      const parsed = raw ? (JSON.parse(raw) as StoredSuperAdminUser[]) : [];
      setUsers(Array.isArray(parsed) ? parsed : []);
    } catch {
      setUsers([]);
    }
  };

  const handleCreateUser = async () => {
    const name = createForm.name.trim();
    const email = createForm.email.trim();
    const password = createForm.password.trim();
    const companyId = createForm.companyId;

    if (!companyId) {
      addToast('Please select a company', 'error');
      return;
    }
    if (!name) {
      addToast('Please enter name', 'error');
      return;
    }
    if (!email) {
      addToast('Please enter email', 'error');
      return;
    }
    if (!password) {
      addToast('Please enter password', 'error');
      return;
    }

    const company = companies.find((c) => c.id === companyId);
    if (!company?.orgId) {
      addToast('Selected company is missing orgId', 'error');
      return;
    }

    try {
      setCreating(true);
      const created = await createCompanyUser(companyId, {
        name,
        email,
        role: createForm.role,
        orgId: company.orgId,
        password,
      });

      addToast(
        `User created. Email: ${created.email} | Password: ${created.password}`,
        'success'
      );

      reloadUsersFromStorage();
      setSelectedIds(new Set());
      setShowCreateModal(false);
      setCreateForm({ companyId, name: '', email: '', role: Role.Manager, password: '' });
    } catch (e: any) {
      addToast(e?.message || 'Failed to create user', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async () => {
    const name = editForm.name.trim();
    const companyId = editForm.companyId;
    const role = editForm.role;
    const password = editForm.password;
    const isEnabled = editForm.status === 'Active';

    if (!editTargetEmail) {
      addToast('Missing user email', 'error');
      return;
    }
    if (!companyId) {
      addToast('Please select a company', 'error');
      return;
    }
    if (!name) {
      addToast('Please enter name', 'error');
      return;
    }

    try {
      setEditing(true);
      await updateCompanyUser(editTargetEmail, {
        name,
        role,
        companyId,
        isEnabled,
        password: password, // if blank, service keeps old password
      });

      addToast('User updated successfully', 'success');
      reloadUsersFromStorage();
      closeEdit();
    } catch (e: any) {
      addToast(e?.message || 'Failed to update user', 'error');
    } finally {
      setEditing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTargetEmail) {
      addToast('Missing user email', 'error');
      return;
    }
    if (!resetPassword.trim()) {
      addToast('Please enter password', 'error');
      return;
    }

    try {
      setResetting(true);
      await updateCompanyUser(resetTargetEmail, { password: resetPassword });
      addToast('Password updated successfully', 'success');
      reloadUsersFromStorage();
      closeResetPassword();
    } catch (e: any) {
      addToast(e?.message || 'Failed to reset password', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleToggleBlock = async (email: string, currentlyEnabled: boolean) => {
    const targetEmail = String(email ?? '').trim();
    if (!targetEmail) return;

    try {
      await updateCompanyUser(targetEmail, { isEnabled: !currentlyEnabled });
      addToast(!currentlyEnabled ? 'User unblocked' : 'User blocked', 'success');
      reloadUsersFromStorage();
      setSelectedIds(new Set());
    } catch (e: any) {
      addToast(e?.message || 'Failed to update user status', 'error');
    }
  };

  const fmtDateTime = (value?: string | Date) => {
    if (!value) return '-';
    const dt = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dt.getTime())) return '-';
    return dt.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (a + b).toUpperCase() || 'U';
  };

  const normalizedUsers = useMemo(() => {
    return users
      .map((u) => {
        const id = String(u.id ?? u.email ?? Math.random());
        const name = String(u.name ?? 'Unknown User');
        const email = String(u.email ?? '-');
        const role = (u.role ?? Role.Viewer) as Role;
        const enabled = u.isEnabled !== false;
        const lastLogin = u.updatedAt ?? u.createdAt;
        return { id, name, email, role, enabled, lastLogin };
      })
      .filter((u) => u.email !== '-');
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalizedUsers.filter((u) => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
      const status = u.enabled ? 'Active' : 'Blocked';
      const matchesStatus = statusFilter === 'all' ? true : status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [normalizedUsers, roleFilter, search, statusFilter]);

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter((u) => u.enabled).length;
  const blockedUsers = filteredUsers.filter((u) => !u.enabled).length;

  const totalPages = Math.max(1, Math.ceil(totalUsers / Math.max(1, pageSize)));
  const safePage = Math.min(page, totalPages);
  const pageStartIndex = (safePage - 1) * pageSize;
  const pageRows = filteredUsers.slice(pageStartIndex, pageStartIndex + pageSize);
  const rangeStart = totalUsers === 0 ? 0 : pageStartIndex + 1;
  const rangeEnd = Math.min(totalUsers, pageStartIndex + pageRows.length);

  const toggleSelectAllOnPage = () => {
    const next = new Set(selectedIds);
    const ids = pageRows.map((r) => r.id);
    const allSelected = ids.length > 0 && ids.every((id) => next.has(id));
    if (allSelected) {
      ids.forEach((id) => next.delete(id));
    } else {
      ids.forEach((id) => next.add(id));
    }
    setSelectedIds(next);
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const roleBadgeClass = (role: Role) => {
    switch (role) {
      case Role.Admin:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case Role.Manager:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      case Role.Viewer:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  };

  const permissionsLabel = (role: Role) => {
    if (role === Role.Admin) return { icon: 'verified_user', text: 'Full Access' };
    if (role === Role.Manager) return { icon: 'inventory_2', text: 'Inventory, Reports' };
    return { icon: 'visibility', text: 'Read Only' };
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-[#9d9db9]">
        <button
          type="button"
          className="hover:text-primary transition-colors"
          onClick={() => addToast('Home navigation coming soon', 'info')}
        >
          Home
        </button>
        <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
        <span className="text-slate-500 dark:text-[#9d9db9]">Administration</span>
        <span className="material-symbols-outlined text-[16px] mx-2">chevron_right</span>
        <span className="text-slate-900 dark:text-white">Company Users</span>
      </nav>

      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Company Users Management
          </h2>
          <p className="text-slate-500 dark:text-[#9d9db9] text-base">
            Manage access, roles, and permissions for all system users.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-primary/30"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Add New User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl border border-gray-100 dark:border-[#282839] shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-primary">group</span>
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-slate-500 dark:text-[#9d9db9] font-medium">Total Users</span>
            <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
            </span>
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white z-10">
            {new Intl.NumberFormat('en-IN').format(totalUsers)}
          </div>
          <div className="text-sm text-slate-400 dark:text-slate-500 z-10">Across all departments</div>
        </div>

        <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl border border-gray-100 dark:border-[#282839] shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-green-500">check_circle</span>
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-slate-500 dark:text-[#9d9db9] font-medium">Active Now</span>
            <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> 5%
            </span>
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white z-10">
            {new Intl.NumberFormat('en-IN').format(activeUsers)}
          </div>
          <div className="text-sm text-slate-400 dark:text-slate-500 z-10">Currently enabled</div>
        </div>

        <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl border border-gray-100 dark:border-[#282839] shadow-sm flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-8xl text-red-500">block</span>
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-slate-500 dark:text-[#9d9db9] font-medium">Blocked Users</span>
            <span className="bg-slate-100 dark:bg-[#282839] text-slate-500 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-full">
              0% Change
            </span>
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white z-10">
            {new Intl.NumberFormat('en-IN').format(blockedUsers)}
          </div>
          <div className="text-sm text-slate-400 dark:text-slate-500 z-10">Requires attention</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1e1e2d] rounded-xl border border-gray-100 dark:border-[#282839] shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-[#282839] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-[#111118] border border-gray-200 dark:border-[#282839] rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Search by name, email or role..."
              type="text"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => {
                const v = e.target.value;
                setRoleFilter(v === 'all' ? 'all' : (v as Role));
                setPage(1);
              }}
              className="h-10 px-3 pr-8 bg-slate-50 dark:bg-[#111118] border border-gray-200 dark:border-[#282839] rounded-lg text-sm text-slate-600 dark:text-white outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value={Role.Admin}>Admin</option>
              <option value={Role.Manager}>Manager</option>
              <option value={Role.Viewer}>Viewer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="h-10 px-3 pr-8 bg-slate-50 dark:bg-[#111118] border border-gray-200 dark:border-[#282839] rounded-lg text-sm text-slate-600 dark:text-white outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>

            <button
              type="button"
              onClick={() => addToast('Filters (coming soon)', 'info')}
              className="h-10 px-3 bg-slate-50 dark:bg-[#111118] border border-gray-200 dark:border-[#282839] rounded-lg text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#282839] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
              <span className="hidden sm:inline text-sm font-medium">Filters</span>
            </button>

            <button
              type="button"
              onClick={() => addToast('Export (coming soon)', 'info')}
              className="h-10 px-3 bg-slate-50 dark:bg-[#111118] border border-gray-200 dark:border-[#282839] rounded-lg text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#282839] transition-colors ml-auto md:ml-0"
              title="Export"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#282839]">
                <th className="p-5 w-10">
                  <input
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#282839] text-primary focus:ring-primary"
                    type="checkbox"
                    checked={pageRows.length > 0 && pageRows.every((r) => selectedIds.has(r.id))}
                    onChange={toggleSelectAllOnPage}
                    aria-label="Select all"
                  />
                </th>
                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9d9db9]">User</th>
                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9d9db9]">Role</th>
                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9d9db9]">Permissions</th>
                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9d9db9]">Status</th>
                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9d9db9]">Last Login</th>
                <th className="p-5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-[#9d9db9] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {pageRows.map((u) => {
                const perm = permissionsLabel(u.role);
                const status = u.enabled ? 'Active' : 'Blocked';
                return (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 dark:border-[#282839] hover:bg-slate-50 dark:hover:bg-[#282839]/50 transition-colors group"
                  >
                    <td className="p-5">
                      <input
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#282839] text-primary focus:ring-primary"
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleRow(u.id)}
                        aria-label={`Select ${u.name}`}
                      />
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#3f3f5a] flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white">
                          {getInitials(u.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-slate-900 dark:text-white truncate">{u.name}</span>
                          <span className="text-xs text-slate-500 dark:text-[#9d9db9] truncate">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-5 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">{perm.icon}</span>
                        <span>{perm.text}</span>
                        {u.role === Role.Manager && <span className="text-xs text-slate-400 ml-1">+2</span>}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-slate-700 dark:text-slate-200">{status}</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500 dark:text-slate-400">{fmtDateTime(u.lastLogin)}</td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => openEdit(u.email)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#3f3f5a] text-slate-500 dark:text-slate-400 transition-colors"
                          title="Edit User"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openResetPassword(u.email)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#3f3f5a] text-slate-500 dark:text-slate-400 transition-colors"
                          title="Reset Password"
                        >
                          <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBlock(u.email, u.enabled)}
                          className={
                            u.enabled
                              ? 'p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors'
                              : 'p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors'
                          }
                          title={u.enabled ? 'Block User' : 'Unblock User'}
                        >
                          <span className="material-symbols-outlined text-[18px]">{u.enabled ? 'block' : 'check_circle'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-slate-500 dark:text-[#9d9db9]">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-gray-100 dark:border-[#282839] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#9d9db9]">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-transparent border-none font-medium text-slate-900 dark:text-white outline-none focus:ring-0 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-[#9d9db9]">
            <span>
              {rangeStart}-{rangeEnd} of {new Intl.NumberFormat('en-IN').format(totalUsers)}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#282839] disabled:opacity-50 transition-colors"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                type="button"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#282839] disabled:opacity-50 transition-colors"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={closeCreate}
        title="Add New User"
        footer={
          <>
            <Button variant="secondary" onClick={closeCreate} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} isLoading={creating}>
              Create User
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Company"
            id="sa-user-company"
            value={createForm.companyId}
            onChange={(e) => setCreateForm((p) => ({ ...p, companyId: e.target.value }))}
          >
            {companies.length === 0 ? (
              <option value="">No companies found</option>
            ) : (
              companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))
            )}
          </Select>

          <Select
            label="Role"
            id="sa-user-role"
            value={createForm.role}
            onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value as Role }))}
          >
            <option value={Role.Admin}>Admin</option>
            <option value={Role.Manager}>Manager</option>
            <option value={Role.Viewer}>Viewer</option>
          </Select>

          <Input
            label="Name"
            id="sa-user-name"
            value={createForm.name}
            onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="User full name"
          />

          <Input
            label="Email"
            id="sa-user-email"
            value={createForm.email}
            onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="user@company.com"
            type="email"
          />

          <div className="md:col-span-2">
            <Input
              label="Password"
              id="sa-user-password"
              value={createForm.password}
              onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Enter password"
              type="text"
            />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Password is required.</div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={closeEdit}
        title="Edit User"
        footer={
          <>
            <Button variant="secondary" onClick={closeEdit} disabled={editing}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} isLoading={editing}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600 dark:text-[#9d9db9]">
            Editing: <span className="font-medium text-slate-900 dark:text-white">{editTargetEmail}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Company"
              id="sa-edit-user-company"
              value={editForm.companyId}
              onChange={(e) => setEditForm((p) => ({ ...p, companyId: e.target.value }))}
            >
              {companies.length === 0 ? (
                <option value="">No companies found</option>
              ) : (
                companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </Select>

            <Select
              label="Role"
              id="sa-edit-user-role"
              value={editForm.role}
              onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value as Role }))}
            >
              <option value={Role.Admin}>Admin</option>
              <option value={Role.Manager}>Manager</option>
              <option value={Role.Viewer}>Viewer</option>
            </Select>

            <Input
              label="Name"
              id="sa-edit-user-name"
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="User full name"
            />

            <Select
              label="Status"
              id="sa-edit-user-status"
              value={editForm.status}
              onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as any }))}
            >
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </Select>

            <div className="md:col-span-2">
              <Input
                label="Password (optional)"
                id="sa-edit-user-password"
                value={editForm.password}
                onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Leave blank to keep current password"
                type="text"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                If you type a password here, exactly that password will be saved.
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showResetModal}
        onClose={closeResetPassword}
        title="Reset Password"
        footer={
          <>
            <Button variant="secondary" onClick={closeResetPassword} disabled={resetting}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} isLoading={resetting}>
              Update Password
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-600 dark:text-[#9d9db9]">
            Reset password for:{' '}
            <span className="font-medium text-slate-900 dark:text-white">{resetTargetEmail}</span>
          </div>
          <Input
            label="New Password"
            id="sa-reset-user-password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            placeholder="Enter new password"
            type="text"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            The password is saved exactly as entered.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SuperAdminUsers;
