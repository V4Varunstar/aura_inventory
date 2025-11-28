import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { Plus, Eye, Power, PowerOff, UserPlus } from 'lucide-react';
import { Company, CreateCompanyRequest, SubscriptionPlan, Role } from '../../types';
import {
  getAllCompanies,
  createCompany,
  toggleCompanyStatus,
  createCompanyUser
} from '../../services/superAdminService';

const SuperAdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const [createForm, setCreateForm] = useState<CreateCompanyRequest>({
    name: '',
    email: '',
    phone: '',
    plan: SubscriptionPlan.Free,
    ownerName: '',
    ownerEmail: ''
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: Role.Admin
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const companiesData = await getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      addToast('Failed to fetch companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name || !createForm.email || !createForm.ownerName || !createForm.ownerEmail) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setCreating(true);
      await createCompany(createForm);
      addToast('Company created successfully', 'success');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        plan: SubscriptionPlan.Free,
        ownerName: '',
        ownerEmail: ''
      });
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      addToast('Failed to create company', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (company: Company) => {
    try {
      await toggleCompanyStatus(company.id, !company.isActive);
      addToast(
        `Company ${!company.isActive ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
      fetchCompanies();
    } catch (error) {
      console.error('Error toggling company status:', error);
      addToast('Failed to update company status', 'error');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userForm.name || !userForm.email || !selectedCompany) {
      addToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setCreating(true);
      await createCompanyUser(selectedCompany.id, {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        orgId: selectedCompany.orgId
      });
      addToast('User created successfully', 'success');
      setShowUserModal(false);
      setUserForm({ name: '', email: '', role: Role.Admin });
      setSelectedCompany(null);
    } catch (error) {
      console.error('Error creating user:', error);
      addToast('Failed to create user', 'error');
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Company Name',
      render: (value: string, company: Company) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500">Org ID: {company.orgId}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact Email'
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (value: SubscriptionPlan) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === SubscriptionPlan.Business ? 'bg-purple-100 text-purple-800' :
          value === SubscriptionPlan.Pro ? 'bg-blue-100 text-blue-800' :
          value === SubscriptionPlan.Starter ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: Date) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, company: Company) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // In real implementation, this would show company details
              addToast('View functionality would be implemented here', 'info');
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleStatus(company)}
            className={company.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {company.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedCompany(company);
              setShowUserModal(true);
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Companies Management
        </h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          leftIcon={<Plus />}
        >
          Create Company
        </Button>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={companies}
          loading={loading}
          emptyMessage="No companies found"
        />
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
          
          <hr className="my-4" />
          <h3 className="text-lg font-semibold">Owner Details</h3>
          
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

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={creating}
            >
              Create Company
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedCompany(null);
          setUserForm({ name: '', email: '', role: Role.Admin });
        }}
        title={`Add User to ${selectedCompany?.name}`}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="User Name *"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            required
          />
          <Input
            label="Email *"
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            required
          />
          <Select
            label="Role *"
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
            required
          >
            <option value={Role.Admin}>Admin</option>
            <option value={Role.Manager}>Manager</option>
            <option value={Role.Employee}>Employee</option>
            <option value={Role.Viewer}>Viewer</option>
          </Select>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowUserModal(false);
                setSelectedCompany(null);
                setUserForm({ name: '', email: '', role: Role.Admin });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={creating}
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminCompanies;