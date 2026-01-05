import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import Button from '../ui/Button';
import { Activity, Building2, CreditCard, LayoutDashboard, LogOut, Settings, Shield, Users } from 'lucide-react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const SUPER_ADMIN_BUILD_TAG = 'sa-ui-1';

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
      <div className="dark min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
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
    <div className="dark min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 flex-col bg-white dark:bg-gray-950 border-r border-gray-200/70 dark:border-gray-800">
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-primary to-accent-green flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate">
                  Aura Inventory
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Super Admin Panel</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 pb-6 flex flex-col gap-2">
            <button
              onClick={() => navigate('/super-admin/dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors w-full text-left ${
                location.pathname === '/super-admin/dashboard' || location.pathname === '/super-admin'
                  ? 'bg-accent-green/15 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-semibold text-sm">Dashboard</span>
            </button>

            <button
              onClick={() => navigate('/super-admin/companies')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors w-full text-left ${
                location.pathname === '/super-admin/companies'
                  ? 'bg-accent-green/15 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span className="font-semibold text-sm">Companies</span>
            </button>

            <button
              onClick={() => navigate('/super-admin/users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors w-full text-left ${
                location.pathname === '/super-admin/users'
                  ? 'bg-accent-green/15 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-semibold text-sm">Users</span>
            </button>

            <button
              onClick={() => navigate('/super-admin/subscriptions')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors w-full text-left ${
                location.pathname === '/super-admin/subscriptions'
                  ? 'bg-accent-green/15 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span className="font-semibold text-sm">Subscriptions</span>
            </button>

            <button
              onClick={() => navigate('/super-admin/activity-logs')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors w-full text-left ${
                location.pathname === '/super-admin/activity-logs'
                  ? 'bg-accent-green/15 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <Activity className="h-5 w-5" />
              <span className="font-semibold text-sm">Activity Logs</span>
            </button>

            <button
              onClick={() => navigate('/super-admin/settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors w-full text-left ${
                location.pathname === '/super-admin/settings'
                  ? 'bg-accent-green/15 text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="font-semibold text-sm">Settings</span>
            </button>
          </nav>

          <div className="px-4 pb-6">
            <div className="rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {user.name?.slice(0, 1)?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                </div>
                <Button onClick={handleLogout} variant="ghost" size="sm" leftIcon={<LogOut />}>
                  Logout
                </Button>
              </div>
              <div className="mt-3">
                <span className="text-[10px] leading-none px-2 py-1 rounded-full border border-gray-200/70 dark:border-gray-800 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950">
                  Build: {SUPER_ADMIN_BUILD_TAG}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;