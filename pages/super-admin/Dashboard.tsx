import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Building2, Users, CheckCircle, XCircle, Plus, UserPlus, Check } from 'lucide-react';
import { SuperAdminStats, SubscriptionPlan, Role } from '../../types';
import { getSuperAdminStats, getAllCompanies, createCompany } from '../../services/superAdminService';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SuperAdminStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    totalUsers: 0
  });
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
      console.log('Stats loaded:', statsData);
      setStats(statsData);
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Super Admin Dashboard
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Super Admin Dashboard
        </h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus />}
        >
          Create Company
        </Button>
      </div>

      {/* Stats Cards - All Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            console.log('Navigating to companies...');
            navigate('/super-admin/companies');
          }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Companies
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCompanies}
              </p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            console.log('Navigating to companies...');
            navigate('/super-admin/companies');
          }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            console.log('Navigating to companies...');
            navigate('/super-admin/companies');
          }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeCompanies}
              </p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => {
            console.log('Navigating to companies...');
            navigate('/super-admin/companies');
          }}
        >
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inactive
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.inactiveCompanies}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="p-6">
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
            leftIcon={<UserPlus />}
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
      <Card title="Plans" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
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

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
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

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
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