import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import { Building2, Users, CheckCircle, XCircle } from 'lucide-react';
import { SuperAdminStats } from '../../types';
import { getSuperAdminStats } from '../../services/superAdminService';

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SuperAdminStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getSuperAdminStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching Super Admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <div className="text-sm text-gray-500 dark:text-gray-400">
          System Overview
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Companies
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalCompanies}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Companies
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.activeCompanies}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inactive Companies
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.inactiveCompanies}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions" className="p-6">
          <div className="space-y-4">
            <a
              href="/#/super-admin/companies"
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Manage Companies
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View, create, and manage all companies
                  </p>
                </div>
              </div>
            </a>
          </div>
        </Card>

        <Card title="System Status" className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">System Status</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Database</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Authentication</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;