import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { Plus, Eye, Power, PowerOff, UserPlus, Settings } from 'lucide-react';
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
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [showAdminAssignModal, setShowAdminAssignModal] = useState(false);
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

  const [subscriptionForm, setSubscriptionForm] = useState({
    validFrom: '',
    validTo: '',
    plan: SubscriptionPlan.Free,
    maxUsers: 5,
    maxWarehouses: 2,
    maxProducts: 50
  });

  const [assignUserForm, setAssignUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.Admin
  });

  const [adminAssignForm, setAdminAssignForm] = useState({
    name: '',
    email: '',
    password: '',
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
      const newCompany = await createCompany(createForm);
      addToast('Company created successfully! Now assign login credentials.', 'success');
      setShowCreateModal(false);
      
      // Automatically show user assignment modal after company creation
      setSelectedCompany(newCompany);
      setAssignUserForm({
        name: createForm.ownerName,
        email: createForm.ownerEmail,
        password: `${createForm.ownerName.replace(' ', '')}@123`, // Auto-generate password
        role: Role.Owner
      });
      setShowAssignUserModal(true);
      
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

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) {
      addToast('No company selected', 'error');
      return;
    }
    
    if (!assignUserForm.name || !assignUserForm.email || !assignUserForm.password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setCreating(true);
      console.log('Assigning user:', assignUserForm);
      console.log('To company:', selectedCompany);
      
      await createCompanyUser(selectedCompany.id, {
        name: assignUserForm.name,
        email: assignUserForm.email,
        password: assignUserForm.password,
        role: assignUserForm.role,
        orgId: selectedCompany.orgId
      });
      
      setShowAssignUserModal(false);
      const userCredentials = {
        email: assignUserForm.email,
        password: assignUserForm.password,
        name: assignUserForm.name,
        role: assignUserForm.role
      };
      setAssignUserForm({ name: '', email: '', password: '', role: Role.Admin });
      
      addToast(`User assigned successfully! 🎉\nEmail: ${userCredentials.email}\nPassword: ${userCredentials.password}\nRole: ${userCredentials.role}`, 'success');
      console.log('User credentials assigned:', userCredentials);
      
      await fetchCompanies();
    } catch (error) {
      console.error('Error assigning user credentials:', error);
      addToast('Failed to assign user credentials. Please try again.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    
    if (!subscriptionForm.validFrom || !subscriptionForm.validTo) {
      addToast('Please select valid dates', 'error');
      return;
    }
    
    try {
      setCreating(true);
      // Update company subscription details
      const updatedCompany = {
        ...selectedCompany,
        plan: subscriptionForm.plan,
        validFrom: new Date(subscriptionForm.validFrom),
        validTo: new Date(subscriptionForm.validTo),
        limits: {
          maxUsers: subscriptionForm.maxUsers,
          maxWarehouses: subscriptionForm.maxWarehouses,
          maxProducts: subscriptionForm.maxProducts
        }
      };
      
      setShowSubscriptionModal(false);
      addToast('Subscription updated successfully', 'success');
      fetchCompanies();
    } catch (error) {
      console.error('Error updating subscription:', error);
      addToast('Failed to update subscription', 'error');
    } finally {
      setCreating(false);
    }
  };

  const openSubscriptionModal = (company: Company) => {
    setSelectedCompany(company);
    setSubscriptionForm({
      validFrom: company.validFrom ? company.validFrom.toISOString().split('T')[0] : '',
      validTo: company.validTo ? company.validTo.toISOString().split('T')[0] : '',
      plan: company.plan || SubscriptionPlan.Free,
      maxUsers: company.limits?.maxUsers || 5,
      maxWarehouses: company.limits?.maxWarehouses || 2,
      maxProducts: company.limits?.maxProducts || 50
    });
    setShowSubscriptionModal(true);
  };

  const openUserModal = (company: Company) => {
    setSelectedCompany(company);
    setUserForm({ name: '', email: '', role: Role.Admin });
    setShowUserModal(true);
  };

  const openAdminAssignModal = (company: Company) => {
    setSelectedCompany(company);
    setAdminAssignForm({ name: '', email: '', password: '', role: Role.Admin });
    setShowAdminAssignModal(true);
  };

  const handleAdminAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) {
      addToast('No company selected', 'error');
      return;
    }
    
    if (!adminAssignForm.name || !adminAssignForm.email || !adminAssignForm.password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setCreating(true);
      console.log('Assigning admin user:', adminAssignForm);
      console.log('To company:', selectedCompany);
      
      await createCompanyUser(selectedCompany.id, {
        name: adminAssignForm.name,
        email: adminAssignForm.email,
        password: adminAssignForm.password,
        role: adminAssignForm.role,
        orgId: selectedCompany.orgId
      });
      
      setShowAdminAssignModal(false);
      const assignedCredentials = {
        email: adminAssignForm.email,
        password: adminAssignForm.password,
        name: adminAssignForm.name,
        role: adminAssignForm.role
      };
      setAdminAssignForm({ name: '', email: '', password: '', role: Role.Admin });
      
      addToast(`Admin user assigned successfully! 🎉\nEmail: ${assignedCredentials.email}\nPassword: ${assignedCredentials.password}\nRole: ${assignedCredentials.role}`, 'success');
      console.log('Admin user assigned:', assignedCredentials);
      
      await fetchCompanies();
    } catch (error) {
      console.error('Error assigning admin user:', error);
      addToast('Failed to assign admin user. Please try again.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const openAdminAssignModal = (company: Company) => {
    setSelectedCompany(company);
    setAdminAssignForm({ name: '', email: '', password: '', role: Role.Admin });
    setShowAdminAssignModal(true);
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
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openSubscriptionModal(company)}
            className="text-purple-600 hover:text-purple-700"
            title="Manage Subscription"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleStatus(company)}
            className={company.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
            title={company.isActive ? 'Deactivate' : 'Activate'}
          >
            {company.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openUserModal(company)}
            className="text-blue-600 hover:text-blue-700"
            title="Add User"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openAdminAssignModal(company)}
            className="text-orange-600 hover:text-orange-700"
            title="Assign Admin User"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openAdminAssignModal(company)}
            className="text-orange-600 hover:text-orange-700"
            title="Assign Admin User"
          >
            <Settings className="w-4 h-4" />
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

      {/* Assign User Credentials Modal */}
      <Modal
        isOpen={showAssignUserModal}
        onClose={() => setShowAssignUserModal(false)}
        title="Assign Login Credentials"
        size="large"
      >
        <form onSubmit={handleAssignUser} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              Assign login credentials for the company owner. These credentials will be used to access the system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={assignUserForm.name}
              onChange={(e) => setAssignUserForm({ ...assignUserForm, name: e.target.value })}
              required
            />
            <Input
              label="Email *"
              type="email"
              value={assignUserForm.email}
              onChange={(e) => setAssignUserForm({ ...assignUserForm, email: e.target.value })}
              required
            />
            <Input
              label="Password *"
              type="password"
              value={assignUserForm.password}
              onChange={(e) => setAssignUserForm({ ...assignUserForm, password: e.target.value })}
              required
              placeholder="Create a secure password"
            />
            <Select
              label="Role *"
              value={assignUserForm.role}
              onChange={(e) => setAssignUserForm({ ...assignUserForm, role: e.target.value as Role })}
              required
            >
              <option value={Role.Owner}>Owner</option>
              <option value={Role.Admin}>Admin</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAssignUserModal(false);
                setAssignUserForm({ name: '', email: '', password: '', role: Role.Admin });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={creating}
              leftIcon={<UserPlus />}
            >
              Assign Credentials
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subscription Management Modal */}
      <Modal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title={`Manage Subscription - ${selectedCompany?.name}`}
        size="large"
      >
        <form onSubmit={handleUpdateSubscription} className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-purple-800">
              Configure subscription details, validity period, and usage limits for this company.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Subscription Plan *"
              value={subscriptionForm.plan}
              onChange={(e) => {
                const plan = e.target.value as SubscriptionPlan;
                setSubscriptionForm({ 
                  ...subscriptionForm, 
                  plan,
                  maxUsers: plan === SubscriptionPlan.Free ? 5 : 
                           plan === SubscriptionPlan.Starter ? 25 : 
                           plan === SubscriptionPlan.Pro ? 100 : 999,
                  maxWarehouses: plan === SubscriptionPlan.Free ? 2 : 
                                plan === SubscriptionPlan.Starter ? 5 : 
                                plan === SubscriptionPlan.Pro ? 20 : 999,
                  maxProducts: plan === SubscriptionPlan.Free ? 50 : 
                              plan === SubscriptionPlan.Starter ? 500 : 
                              plan === SubscriptionPlan.Pro ? 5000 : 99999
                });
              }}
              required
            >
              <option value={SubscriptionPlan.Free}>Free</option>
              <option value={SubscriptionPlan.Starter}>Starter</option>
              <option value={SubscriptionPlan.Pro}>Pro</option>
              <option value={SubscriptionPlan.Business}>Business</option>
            </Select>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Current Status</label>
              <div className="p-2 bg-gray-50 rounded">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedCompany?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedCompany?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Valid From *"
              type="date"
              value={subscriptionForm.validFrom}
              onChange={(e) => setSubscriptionForm({ ...subscriptionForm, validFrom: e.target.value })}
              required
            />
            <Input
              label="Valid To *"
              type="date"
              value={subscriptionForm.validTo}
              onChange={(e) => setSubscriptionForm({ ...subscriptionForm, validTo: e.target.value })}
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Usage Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Max Users"
                type="number"
                min="1"
                value={subscriptionForm.maxUsers.toString()}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, maxUsers: parseInt(e.target.value) || 1 })}
                required
              />
              <Input
                label="Max Warehouses"
                type="number"
                min="1"
                value={subscriptionForm.maxWarehouses.toString()}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, maxWarehouses: parseInt(e.target.value) || 1 })}
                required
              />
              <Input
                label="Max Products"
                type="number"
                min="1"
                value={subscriptionForm.maxProducts.toString()}
                onChange={(e) => setSubscriptionForm({ ...subscriptionForm, maxProducts: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowSubscriptionModal(false);
                setSelectedCompany(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={creating}
              leftIcon={<Eye />}
            >
              Update Subscription
            </Button>
          </div>
        </form>
      </Modal>

      {/* Admin User Assignment Modal */}
      <Modal
        isOpen={showAdminAssignModal}
        onClose={() => setShowAdminAssignModal(false)}
        title={`Assign Admin User - ${selectedCompany?.name}`}
        size="large"
      >
        <form onSubmit={handleAdminAssign} className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-orange-800">
              Assign a new admin user with full access to this company. This user will be able to manage the company's inventory, users, and settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Admin Name *"
              value={adminAssignForm.name}
              onChange={(e) => setAdminAssignForm({ ...adminAssignForm, name: e.target.value })}
              required
              placeholder="Enter admin user name"
            />
            <Input
              label="Admin Email *"
              type="email"
              value={adminAssignForm.email}
              onChange={(e) => setAdminAssignForm({ ...adminAssignForm, email: e.target.value })}
              required
              placeholder="Enter admin email address"
            />
            <Input
              label="Password *"
              type="password"
              value={adminAssignForm.password}
              onChange={(e) => setAdminAssignForm({ ...adminAssignForm, password: e.target.value })}
              required
              placeholder="Create secure password"
            />
            <Select
              label="Admin Role *"
              value={adminAssignForm.role}
              onChange={(e) => setAdminAssignForm({ ...adminAssignForm, role: e.target.value as Role })}
              required
            >
              <option value={Role.Admin}>Admin</option>
              <option value={Role.Manager}>Manager</option>
            </Select>
          </div>

          <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This admin user will have full access to manage the company's inventory, create users, and configure settings.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAdminAssignModal(false);
                setAdminAssignForm({ name: '', email: '', password: '', role: Role.Admin });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={creating}
              leftIcon={<Settings />}
            >
              Assign Admin User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SuperAdminCompanies;