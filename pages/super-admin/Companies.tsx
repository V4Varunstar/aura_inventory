import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import { useToast } from '../../context/ToastContext';
import { Plus, Eye, Power, PowerOff, UserPlus, Settings } from 'lucide-react';
import { 
  Company, 
  CreateCompanyRequest, 
  SubscriptionPlan, 
  Role,
  SubscriptionStatus 
} from '../../types';
import { 
  getAllCompanies, 
  createCompany, 
  toggleCompanyStatus,
  createCompanyUser
} from '../../services/superAdminService';

const SuperAdminCompanies: React.FC = memo(() => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [showAdminAssignModal, setShowAdminAssignModal] = useState(false);
  const [showCompanyUsersModal, setShowCompanyUsersModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
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
    plan: SubscriptionPlan.Free,
    validFrom: '',
    validTo: '',
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

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching companies...');
      const companiesData = await getAllCompanies();
      console.log('✅ Companies loaded:', companiesData.length);
      setCompanies(companiesData);
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      addToast('Failed to fetch companies. Please try again.', 'error');
      // Set empty array as fallback
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const handleCreateCompany = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email) {
      addToast('Please fill in required fields', 'error');
      return;
    }

    try {
      setCreating(true);
      await createCompany(createForm);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        plan: SubscriptionPlan.Free,
        ownerName: '',
        ownerEmail: ''
      });
      addToast('Company created successfully!', 'success');
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      addToast('Failed to create company', 'error');
    } finally {
      setCreating(false);
    }
  }, [createForm, addToast, fetchCompanies]);

  const handleToggleStatus = useCallback(async (company: Company) => {
    try {
      await toggleCompanyStatus(company.id, !company.isActive);
      addToast(`Company ${!company.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchCompanies();
    } catch (error) {
      console.error('Error toggling company status:', error);
      addToast('Failed to update company status', 'error');
    }
  }, [addToast, fetchCompanies]);

  const openUserModal = useCallback((company: Company) => {
    setSelectedCompany(company);
    setUserForm({ name: '', email: '', role: Role.Admin });
    setShowUserModal(true);
  }, []);

  const handleUserAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) {
      addToast('No company selected', 'error');
      return;
    }
    
    if (!userForm.name || !userForm.email) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    
    try {
      setCreating(true);
      console.log('Creating company user via User Modal:', {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        companyId: selectedCompany.id,
        orgId: selectedCompany.orgId
      });
      
      // Generate a default password
      const defaultPassword = 'user123';
      
      const result = await createCompanyUser(selectedCompany.id, {
        name: userForm.name,
        email: userForm.email,
        password: defaultPassword,
        role: userForm.role,
        orgId: selectedCompany.orgId
      });
      
      setShowUserModal(false);
      const assignedCredentials = {
        email: userForm.email,
        password: defaultPassword,
        name: userForm.name,
        role: userForm.role
      };
      setUserForm({ name: '', email: '', role: Role.Admin });
      
      // Success message
      addToast(
        `✅ User created successfully!\n` +
        `📧 Email: ${assignedCredentials.email}\n` +
        `🔑 Password: ${assignedCredentials.password}\n` +
        `👤 Role: ${assignedCredentials.role}`,
        'success'
      );
      
    } catch (error: any) {
      console.error('Error creating company user:', error);
      addToast(error.message || 'Failed to create user', 'error');
    } finally {
      setCreating(false);
    }
  };

  const openAdminAssignModal = (company: Company) => {
    setSelectedCompany(company);
    setAdminAssignForm({ name: '', email: '', password: '', role: Role.Admin });
    setShowAdminAssignModal(true);
  };

  const viewCompanyUsers = (company: Company) => {
    setSelectedCompany(company);
    
    // Get users from localStorage
    try {
      const superAdminUsers = JSON.parse(localStorage.getItem('superadmin_users') || '[]');
      const companySpecificUsers = superAdminUsers.filter((user: any) => user.orgId === company.orgId);
      setCompanyUsers(companySpecificUsers);
      setShowCompanyUsersModal(true);
      console.log('📋 Found users for company:', company.name, companySpecificUsers);
    } catch (error) {
      console.error('❌ Error loading company users:', error);
      addToast('Error loading users', 'error');
    }
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminAssignForm.email)) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    // Validate password strength
    if (adminAssignForm.password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }
    
    try {
      setCreating(true);
      console.log('Creating company user (NO AUTO-LOGIN):', {
        name: adminAssignForm.name,
        email: adminAssignForm.email,
        role: adminAssignForm.role,
        companyId: selectedCompany.id,
        orgId: selectedCompany.orgId
      });
      
      const result = await createCompanyUser(selectedCompany.id, {
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
      
      // Success message without auto-login
      addToast(
        `✅ User created successfully!\n` +
        `📧 Email: ${assignedCredentials.email}\n` +
        `🔑 Password: ${assignedCredentials.password}\n` +
        `👤 Role: ${assignedCredentials.role}\n\n` +
        `🚀 User can now login from any device/browser with these credentials.\n` +
        `⚠️ SuperAdmin session remains unchanged.`,
        'success'
      );
      
      console.log('✅ User created successfully (SuperAdmin NOT auto-logged-out):', {
        ...assignedCredentials,
        autoLogin: false,
        crossDeviceLogin: true
      });
      
      await fetchCompanies();
    } catch (error) {
      console.error('❌ Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      addToast(`Failed to create user: ${errorMessage}`, 'error');
    } finally {
      setCreating(false);
    }
  };

  const columns = useMemo(() => [
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
      key: 'phone',
      label: 'Phone'
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (value: SubscriptionPlan) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === SubscriptionPlan.Enterprise ? 'bg-purple-100 text-purple-800' :
          value === SubscriptionPlan.Professional ? 'bg-blue-100 text-blue-800' :
          value === SubscriptionPlan.Standard ? 'bg-green-100 text-green-800' :
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, company: Company) => (
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {/* View subscription details */}}
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
            onClick={() => viewCompanyUsers(company)}
            className="text-green-600 hover:text-green-700"
            title="View Company Users"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], [handleToggleStatus, openUserModal, openAdminAssignModal, viewCompanyUsers]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Companies Management
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchCompanies}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus />}
          >
            Create Company
          </Button>
        </div>
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
              <option value={SubscriptionPlan.Standard}>Standard</option>
              <option value={SubscriptionPlan.Professional}>Professional</option>
              <option value={SubscriptionPlan.Enterprise}>Enterprise</option>
            </Select>
            <Input
              label="Owner Name"
              value={createForm.ownerName}
              onChange={(e) => setCreateForm({ ...createForm, ownerName: e.target.value })}
            />
            <Input
              label="Owner Email"
              type="email"
              value={createForm.ownerEmail}
              onChange={(e) => setCreateForm({ ...createForm, ownerEmail: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setCreateForm({
                  name: '',
                  email: '',
                  phone: '',
                  plan: SubscriptionPlan.Free,
                  ownerName: '',
                  ownerEmail: ''
                });
              }}
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

      {/* Add User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Add User to Company"
        size="medium"
      >
        <form onSubmit={handleUserAssign} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              Add a new user to <strong>{selectedCompany?.name}</strong>. 
              A default password will be assigned which the user can change later.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              placeholder="Enter user name"
              required
            />
            <Input
              label="Email *"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="Enter user email"
              required
            />
          </div>

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

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> User will be assigned default password: <code>user123</code>
            </p>
          </div>

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
              leftIcon={<UserPlus />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Admin Assignment Modal */}
      <Modal
        isOpen={showAdminAssignModal}
        onClose={() => setShowAdminAssignModal(false)}
        title="Assign Admin User"
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
              label="Name *"
              value={adminAssignForm.name}
              onChange={(e) => setAdminAssignForm({ ...adminAssignForm, name: e.target.value })}
              placeholder="Enter admin name"
              required
            />
            <Input
              label="Email *"
              type="email"
              value={adminAssignForm.email}
              onChange={(e) => setAdminAssignForm({ ...adminAssignForm, email: e.target.value })}
              placeholder="Enter admin email"
              required
            />
            <Input
              label="Password *"
              type="password"
              value={adminAssignForm.password}
              onChange={(e) => setAdminAssignForm({ ...adminAssignForm, password: e.target.value })}
              placeholder="Enter secure password"
              required
            />
            <Select
              label="Role *"
              value={adminAssignForm.role}
              onChange={(e) => setAdminAssignForm({ ...adminAssignForm, role: e.target.value as Role })}
              required
            >
              <option value={Role.Admin}>Admin</option>
              <option value={Role.Manager}>Manager</option>
            </Select>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
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
                setSelectedCompany(null);
                setAdminAssignForm({ name: '', email: '', password: '', role: Role.Admin });
              }}
              leftIcon={<Settings />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={creating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Assign Admin User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Company Users Modal */}
      <Modal
        isOpen={showCompanyUsersModal}
        onClose={() => setShowCompanyUsersModal(false)}
        title={`Users in ${selectedCompany?.name || 'Company'}`}
        size="large"
      >
        <div className="space-y-4">
          {companyUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No users found for this company</p>
              <p className="text-sm">Add users using the "Add User" or "Assign Admin" buttons</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Total Users:</strong> {companyUsers.length} | 
                  <strong> Company:</strong> {selectedCompany?.name}
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Password
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companyUsers.map((user, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'Manager' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {user.password || 'user123'}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          <div className="flex justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCompanyUsersModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

SuperAdminCompanies.displayName = 'SuperAdminCompanies';

export default SuperAdminCompanies;