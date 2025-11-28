import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { Building2, Users, CheckCircle, XCircle, Plus, UserPlus, Settings } from 'lucide-react';
import { SuperAdminStats, SubscriptionPlan, Role } from '../../types';
import { getSuperAdminStats, getAllCompanies, createCompany } from '../../services/superAdminService';

const SuperAdminDashboard: React.FC = () => {
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
    plan: SubscriptionPlan.Free,
    ownerName: '',
    ownerEmail: '',
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const statsData = await getSuperAdminStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching Super Admin stats:', error);
      addToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCompany({
        ...createForm,
        validFrom: new Date(createForm.validFrom),
        validTo: new Date(createForm.validTo)
      });
      await loadData();
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        plan: SubscriptionPlan.Free,
        ownerName: '',
        ownerEmail: '',
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
          onClick={() => window.location.href = '#/super-admin/companies'}
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
          onClick={() => window.location.href = '#/super-admin/companies'}
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
          onClick={() => window.location.href = '#/super-admin/companies'}
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
          onClick={() => window.location.href = '#/super-admin/companies'}
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
            onClick={() => window.location.href = '#/super-admin/companies'}
            leftIcon={<Building2 />}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-semibold">Manage Companies</div>
              <div className="text-sm text-gray-500">View and manage all companies</div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus />}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-semibold">Create Company</div>
              <div className="text-sm text-gray-500">Add a new company to the system</div>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '#/super-admin/companies'}
            leftIcon={<UserPlus />}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-semibold">Manage Users</div>
              <div className="text-sm text-gray-500">Manage users across companies</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Create Company Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Company"
        size="lg"
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
              onChange={(e) => setCreateForm({ ...createForm, plan: e.target.value as SubscriptionPlan })}
              required
            >
              <option value={SubscriptionPlan.Free}>Free</option>
              <option value={SubscriptionPlan.Starter}>Starter</option>
              <option value={SubscriptionPlan.Pro}>Pro</option>
              <option value={SubscriptionPlan.Business}>Business</option>
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