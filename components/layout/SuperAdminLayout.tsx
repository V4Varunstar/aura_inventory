import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import Button from '../ui/Button';
import { LogOut, Building2, LayoutDashboard } from 'lucide-react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not super admin
  React.useEffect(() => {
    if (user && user.role !== Role.SuperAdmin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user || user.role !== Role.SuperAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Access Denied</div>
          <div className="text-gray-600">You don't have permission to access this area.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  Aura Inventory
                </h1>
              </div>
              <div className="ml-8">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Super Admin
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user.name}
              </span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                leftIcon={<LogOut />}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm h-screen sticky top-0">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              <button
                onClick={() => window.location.hash = '#/super-admin/dashboard'}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors w-full text-left ${
                  window.location.hash === '#/super-admin/dashboard' || window.location.hash === '#/super-admin'
                    ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </button>
              
              <button
                onClick={() => window.location.hash = '#/super-admin/companies'}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors w-full text-left ${
                  window.location.hash === '#/super-admin/companies'
                    ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Building2 className="mr-3 h-5 w-5" />
                Companies
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLayout;