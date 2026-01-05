import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import Button from '../ui/Button';
import { LogOut, Building2, LayoutDashboard, Shield } from 'lucide-react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
        <div className="text-center max-w-md w-full rounded-2xl bg-white dark:bg-surface-dark border border-gray-200/70 dark:border-gray-700/70 shadow-md p-8">
          <div className="mx-auto mb-4 size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div className="text-red-500 text-xl font-semibold mb-2">Access Denied</div>
          <div className="text-gray-600 dark:text-gray-300">You don't have permission to access this area.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 border-b border-gray-200/70 dark:border-gray-700/70 bg-white/70 dark:bg-surface-dark/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent-green flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex flex-col leading-none">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Aura Inventory</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    Super Admin
                  </span>
                  <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">Manage companies, users and plans</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 rounded-full bg-gray-100/70 dark:bg-surface-darker/70 border border-gray-200/70 dark:border-gray-700/70 px-4 py-2">
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {user.name?.slice(0, 1)?.toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                </div>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="sm" leftIcon={<LogOut />}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 hidden lg:flex flex-col border-r border-gray-200/70 dark:border-gray-700/70 bg-white dark:bg-surface-darker h-[calc(100vh-64px)] sticky top-16">
          <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
            <button
              onClick={() => navigate('/super-admin/dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors w-full text-left ${
                location.pathname === '/super-admin/dashboard' || location.pathname === '/super-admin'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-dark hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium text-sm">Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/super-admin/companies')}
              className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors w-full text-left ${
                location.pathname === '/super-admin/companies'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-dark hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span className="font-medium text-sm">Companies</span>
            </button>
          </nav>

          <div className="p-4 border-t border-gray-200/70 dark:border-gray-700/70">
            <div className="rounded-2xl bg-gray-100/70 dark:bg-surface-dark/70 border border-gray-200/70 dark:border-gray-700/70 px-4 py-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">Logged in as</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;