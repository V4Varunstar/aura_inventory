import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, Building2, Check, CheckCircle, Clock, Plus, Search, Users, XCircle } from 'lucide-react';
import { Company, SubscriptionPlan, SuperAdminStats } from '../../types';
import { createCompany, getAllCompanies, getSuperAdminStats } from '../../services/superAdminService';

const SUPER_ADMIN_PLAN_LABEL: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.Free]: 'Free',
  [SubscriptionPlan.Starter]: 'Starter',
  [SubscriptionPlan.Pro]: 'Medium',
  [SubscriptionPlan.Business]: 'Enterprise',
};

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SuperAdminStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    totalUsers: 0
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: SubscriptionPlan.Starter,
    ownerName: '',
    ownerEmail: '',
    maxUsers: 25,
    maxWarehouses: 5,
    maxProducts: 500
  });
  const { addToast } = useToast();

  const applyPlanPreset = (plan: SubscriptionPlan) => {
    setCreateForm((prev) => ({
      ...prev,
      plan,
      maxUsers: plan === SubscriptionPlan.Starter ? 25 : plan === SubscriptionPlan.Pro ? 100 : 999,
      maxWarehouses: plan === SubscriptionPlan.Starter ? 5 : plan === SubscriptionPlan.Pro ? 20 : 999,
      maxProducts: plan === SubscriptionPlan.Starter ? 500 : plan === SubscriptionPlan.Pro ? 5000 : 99999,
    }));
  };

  useEffect(() => {
    console.log('SuperAdminDashboard mounted, user:', user);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading Super Admin dashboard data...');
      const statsData = await getSuperAdminStats();
      const companiesData = await getAllCompanies();
      console.log('Stats loaded:', statsData);
      setStats(statsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching Super Admin stats:', error);
      addToast('Error loading dashboard data', 'error');
      // Set fallback stats if there's an error
      setStats({
        totalCompanies: 0,
        activeCompanies: 0,
        inactiveCompanies: 0,
        totalUsers: 0
      });
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany({
        ...createForm,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
      await loadData();
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        plan: SubscriptionPlan.Starter,
        ownerName: '',
        ownerEmail: '',
        maxUsers: 25,
        maxWarehouses: 5,
        maxProducts: 500
      });
      addToast('Company created successfully', 'success');
    } catch (error) {
      addToast('Error creating company', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const expiringSoonCount = companies.filter((c) => {
    const validTo = c.validTo ? new Date(c.validTo).getTime() : 0;
    if (!validTo) return false;
    const days = (validTo - now) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  }).length;

  const planCounts = companies.reduce(
    (acc, c) => {
      acc[c.plan] = (acc[c.plan] ?? 0) + 1;
      return acc;
    },
    {} as Record<SubscriptionPlan, number>
  );

  const planBars: Array<{ label: string; plan: SubscriptionPlan; value: number; color: string }> = [
    { label: 'Starter', plan: SubscriptionPlan.Starter, value: planCounts[SubscriptionPlan.Starter] ?? 0, color: 'bg-accent-green' },
    { label: 'Medium', plan: SubscriptionPlan.Pro, value: planCounts[SubscriptionPlan.Pro] ?? 0, color: 'bg-primary' },
    { label: 'Enterprise', plan: SubscriptionPlan.Business, value: planCounts[SubscriptionPlan.Business] ?? 0, color: 'bg-accent-purple' },
  ];
  const maxPlanCount = Math.max(1, ...planBars.map((b) => b.value));

  const recentCompanies = [...companies]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const filteredRecentCompanies = search.trim()
    ? recentCompanies.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          SUPER_ADMIN_PLAN_LABEL[c.plan].toLowerCase().includes(q)
        );
      })
    : recentCompanies;

  const formatDate = (d?: Date) => {
    if (!d) return '-';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '-';
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statusText = (c: Company) => {
    if (!c.isActive) return 'Suspended';
    return 'Active';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Welcome back, here's what's happening today.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, users..."
              className="w-80 max-w-[70vw] pl-9 pr-3 py-2 rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-green/30"
            />
          </div>
          <button
            type="button"
            className="size-10 rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus />}>Create Company</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card
          className="dark:!bg-surface-dark border border-gray-200/70 dark:border-gray-700/70 !p-5"
          onClick={() => navigate('/super-admin/companies')}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Companies</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.totalCompanies}</div>
            </div>
            <div className="size-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="dark:!bg-surface-dark border border-gray-200/70 dark:border-gray-700/70 !p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.activeCompanies}</div>
            </div>
            <div className="size-9 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-accent-green" />
            </div>
          </div>
        </Card>

        <Card className="dark:!bg-surface-dark border border-gray-200/70 dark:border-gray-700/70 !p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Suspended</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.inactiveCompanies}</div>
            </div>
            <div className="size-9 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-accent-red" />
            </div>
          </div>
        </Card>

        <Card className="dark:!bg-surface-dark border border-gray-200/70 dark:border-gray-700/70 !p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Expiring Soon</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{expiringSoonCount}</div>
            </div>
            <div className="size-9 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-accent-purple" />
            </div>
          </div>
        </Card>

        <Card className="dark:!bg-surface-dark border border-gray-200/70 dark:border-gray-700/70 !p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Users</div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.totalUsers}</div>
            </div>
            <div className="size-9 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-accent-blue" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Companies by Plan" className="dark:!bg-surface-dark border border-gray-200/70 dark:border-gray-700/70">
          <div className="flex items-end justify-between gap-4 pt-2">
            {planBars.map((b) => {
              const heightPct = Math.round((b.value / maxPlanCount) * 100);
              return (
                <div key={b.plan} className="flex-1">
                  <div className="h-44 rounded-2xl bg-gray-100 dark:!bg-surface-darker border border-gray-200/70 dark:border-gray-700/70 flex items-end p-3">
                    <div className={`w-full rounded-xl ${b.color}`} style={{ height: `${Math.max(8, heightPct)}%` }} />
                  </div>
                  <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 text-center">{b.label}</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white text-center">{b.value}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card
            title="Recent Companies"
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/super-admin/companies')}>
                View All
              </Button>
            }
            className="dark:!bg-surface-dark border border-gray-200/70 dark:border-gray-700/70"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="py-2">Company</th>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Validity</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/70">
                  {filteredRecentCompanies.map((c) => (
                    <tr key={c.id} className="text-sm">
                      <td className="py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">{c.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{c.email}</div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs border border-gray-200/70 dark:border-gray-700/70 bg-gray-100 dark:!bg-surface-darker text-gray-700 dark:text-gray-200">
                          {SUPER_ADMIN_PLAN_LABEL[c.plan]}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700 dark:text-gray-200">
                        {formatDate(c.validTo)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border ${
                            statusText(c) === 'Active'
                              ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
                              : 'border-accent-red/30 bg-accent-red/10 text-accent-red'
                          }`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {statusText(c)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRecentCompanies.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 py-10 text-center">
                  No companies found.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="dark:!bg-surface-dark border border-gray-200/70 dark:border-gray-700/70">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              console.log('Navigate to companies via button');
              navigate('/super-admin/companies');
            }}
            leftIcon={<Building2 />}
            className="justify-start text-left"
          >
            <div className="flex flex-col items-start">
              <div className="font-semibold">Manage Companies</div>
              <div className="text-sm text-gray-500">View and manage all companies</div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus />}
            className="justify-start text-left"
          >
            <div className="flex flex-col items-start">
              <div className="font-semibold">Create Company</div>
              <div className="text-sm text-gray-500">Add a new company to the system</div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              console.log('Navigate to companies for user management');
              navigate('/super-admin/companies');
            }}
            leftIcon={<Users />}
            className="justify-start text-left"
          >
            <div className="flex flex-col items-start">
              <div className="font-semibold">Manage Users</div>
              <div className="text-sm text-gray-500">Manage users across companies</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Plans */}
      <Card title="Plans" className="dark:!bg-surface-dark border border-gray-200/70 dark:border-gray-700/70">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Starter</div>
                <div className="text-xs text-gray-500">For small teams getting started</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Popular</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center"><Check className="w-4 h-4 mr-2" />Up to 25 users</div>
              <div className="flex items-center"><Check className="w-4 h-4 mr-2" />Up to 5 warehouses</div>
              <div className="flex items-center"><Check className="w-4 h-4 mr-2" />Up to 500 products</div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={() => { applyPlanPreset(SubscriptionPlan.Starter); setShowCreateModal(true); }}>
                Create company on Starter
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-br from-accent-blue/5 to-transparent dark:from-accent-blue/10 dark:to-transparent p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Medium</div>
                <div className="text-xs text-gray-500">For growing companies</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">Scale</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center"><Check className="w-4 h-4 mr-2" />Up to 100 users</div>
              <div className="flex items-center"><Check className="w-4 h-4 mr-2" />Up to 20 warehouses</div>
              <div className="flex items-center"><Check className="w-4 h-4 mr-2" />Up to 5,000 products</div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={() => { applyPlanPreset(SubscriptionPlan.Pro); setShowCreateModal(true); }}>
                Create company on Medium
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-br from-accent-purple/5 to-transparent dark:from-accent-purple/10 dark:to-transparent p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Enterprise</div>
                <div className="text-xs text-gray-500">For large orgs and multi-warehouse ops</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">Advanced</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-center"><Check className="w-4 h-4 mr-2" />Unlimited users*</div>
              <div className="flex items-center"><Check className="w-4 h-4 mr-2" />Unlimited warehouses*</div>
              <div className="flex items-center"><Check className="w-4 h-4 mr-2" />Unlimited products*</div>
              <div className="text-xs text-gray-500">*Implemented as very high limits (no payments)</div>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={() => { applyPlanPreset(SubscriptionPlan.Business); setShowCreateModal(true); }}>
                Create company on Enterprise
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Create Company Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Company"
        size="large"
      >
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              required
            />
            <Input
              label="Company Email *"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            />
            <Select
              label="Subscription Plan *"
              value={createForm.plan}
              onChange={(e) => {
                const plan = e.target.value as SubscriptionPlan;
                applyPlanPreset(plan);
              }}
              required
            >
              <option value={SubscriptionPlan.Starter}>Starter</option>
              <option value={SubscriptionPlan.Pro}>Medium</option>
              <option value={SubscriptionPlan.Business}>Enterprise</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Owner Name *"
              value={createForm.ownerName}
              onChange={(e) => setCreateForm({ ...createForm, ownerName: e.target.value })}
              required
            />
            <Input
              label="Owner Email *"
              type="email"
              value={createForm.ownerEmail}
              onChange={(e) => setCreateForm({ ...createForm, ownerEmail: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Valid From *"
              type="date"
              value={createForm.validFrom}
              onChange={(e) => setCreateForm({ ...createForm, validFrom: e.target.value })}
              required
            />
            <Input
              label="Valid To *"
              type="date"
              value={createForm.validTo}
              onChange={(e) => setCreateForm({ ...createForm, validTo: e.target.value })}
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Company Usage Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Max Users *"
                type="number"
                min="1"
                value={createForm.maxUsers.toString()}
                onChange={(e) => setCreateForm({ ...createForm, maxUsers: parseInt(e.target.value) || 1 })}
                required
                placeholder="Number of users allowed"
              />
              <Input
                label="Max Warehouses *"
                type="number"
                min="1"
                value={createForm.maxWarehouses.toString()}
                onChange={(e) => setCreateForm({ ...createForm, maxWarehouses: parseInt(e.target.value) || 1 })}
                required
                placeholder="Number of warehouses allowed"
              />
              <Input
                label="Max Products *"
                type="number"
                min="1"
                value={createForm.maxProducts.toString()}
                onChange={(e) => setCreateForm({ ...createForm, maxProducts: parseInt(e.target.value) || 1 })}
                required
                placeholder="Number of products allowed"
              />
            </div>
            <div className="mt-2 text-sm text-blue-700">
              <p><strong>Note:</strong> These limits control how many users the company admin can create and how many warehouses/products can be added.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" leftIcon={<Plus />}>
              Create Company
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;