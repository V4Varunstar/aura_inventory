import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/KPICard';
import Panel from '../../components/ui/Panel';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, ChevronDown, MoreHorizontal, Search } from 'lucide-react';
import { Company, KPIData, SubscriptionPlan, SuperAdminStats } from '../../types';
import { getAllCompanies, getSuperAdminStats } from '../../services/superAdminService';

const SUPER_ADMIN_PLAN_LABEL: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.Free]: 'Trial',
  [SubscriptionPlan.Starter]: 'Basic',
  [SubscriptionPlan.Pro]: 'Pro (Yearly)',
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
  const { addToast } = useToast();

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

  // Dashboard chart: Monthly / Yearly / Trial (mapped from existing plans)
  // - Monthly: Starter
  // - Yearly: Pro + Business
  // - Trial: Free
  const monthlyCount = planCounts[SubscriptionPlan.Starter] ?? 0;
  const yearlyCount = (planCounts[SubscriptionPlan.Pro] ?? 0) + (planCounts[SubscriptionPlan.Business] ?? 0);
  const trialCount = planCounts[SubscriptionPlan.Free] ?? 0;
  const planBars: Array<{
    label: 'Monthly' | 'Yearly' | 'Trial';
    value: number;
    fillClass: string;
    outerHeightClass: string;
    emphasis?: boolean;
  }> = [
    { label: 'Monthly', value: monthlyCount, fillClass: 'bg-accent-green/70', outerHeightClass: 'h-32' },
    {
      label: 'Yearly',
      value: yearlyCount,
      fillClass: 'bg-gradient-to-t from-accent-green to-emerald-300',
      outerHeightClass: 'h-56',
      emphasis: true,
    },
    { label: 'Trial', value: trialCount, fillClass: 'bg-accent-red', outerHeightClass: 'h-20' },
  ];
  const maxPlanCount = Math.max(1, ...planBars.map((b) => b.value));

  const recentCompanies = [...companies]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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

  const fmtNumber = (n: number) => new Intl.NumberFormat('en-IN').format(n);

  const formatValidity = (d?: Date) => {
    if (!d) return { top: '-', bottom: '' };
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return { top: '-', bottom: '' };
    const top = dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    const bottom = dt.toLocaleDateString('en-US', { year: 'numeric' });
    return { top: `${top},`, bottom };
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (a + b).toUpperCase() || 'C';
  };

  const statusText = (c: Company) => {
    if (!c.isActive) return 'Suspended';
    if (c.loginAllowed === false) return 'Offline';
    return 'Active';
  };

  const planBadgeClass = (plan: SubscriptionPlan) => {
    switch (plan) {
      case SubscriptionPlan.Business:
        return 'bg-accent-green/10 text-accent-green border-accent-green/30';
      case SubscriptionPlan.Pro:
        return 'bg-accent-blue/10 text-accent-blue border-accent-blue/30';
      case SubscriptionPlan.Starter:
        return 'bg-white/5 text-gray-200 border-white/10';
      case SubscriptionPlan.Free:
        return 'bg-accent-red/10 text-accent-red border-accent-red/30';
      default:
        return 'bg-white/5 text-gray-200 border-white/10';
    }
  };

  const surfaceClass = 'dark:bg-[#112117] dark:border-white/10';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Welcome back, here's what's happening today.</p>
        </div>

        <div className="flex items-center gap-3 lg:flex-1 lg:justify-end">
          <div className="relative lg:w-[420px]">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, users..."
              className="w-full max-w-[80vw] pl-9 pr-3 py-2.5 rounded-full border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#112117]/80 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-green/30"
            />
          </div>
          <button
            type="button"
            className="size-10 rounded-full border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#112117]/80 flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {(
          [
            {
              title: 'Total Companies',
              value: fmtNumber(stats.totalCompanies),
              change: '+12%',
              changeType: 'positive' as const,
              icon: 'apartment',
              iconColorClass: 'text-accent-green',
              iconBgClass: 'bg-accent-green/10',
              changeLabel: 'vs last month',
              onClick: () => navigate('/super-admin/companies'),
            },
            {
              title: 'Active',
              value: fmtNumber(stats.activeCompanies),
              change: '+5.5%',
              changeType: 'positive' as const,
              icon: 'check_circle',
              iconColorClass: 'text-accent-green',
              iconBgClass: 'bg-accent-green/10',
              changeLabel: 'vs last week',
            },
            {
              title: 'Suspended',
              value: fmtNumber(stats.inactiveCompanies),
              change: '+2%',
              changeType: 'negative' as const,
              icon: 'block',
              iconColorClass: 'text-accent-red',
              iconBgClass: 'bg-accent-red/10',
              changeLabel: 'action needed',
            },
            {
              title: 'Expiring Soon',
              value: fmtNumber(expiringSoonCount),
              change: '-5%',
              changeType: 'neutral' as const,
              icon: 'schedule',
              iconColorClass: 'text-orange-400',
              iconBgClass: 'bg-orange-500/10',
              changeLabel: 'renewal rate',
            },
            {
              title: 'Total Users',
              value: fmtNumber(stats.totalUsers),
              change: '+8%',
              changeType: 'positive' as const,
              icon: 'group',
              iconColorClass: 'text-accent-blue',
              iconBgClass: 'bg-accent-blue/10',
              changeLabel: 'organic growth',
            },
          ] satisfies Array<KPIData & { onClick?: () => void }>
        ).map((kpi) => (
          <KPICard
            key={kpi.title}
            data={kpi}
            onClick={kpi.onClick}
            className={`hover:border-accent-green/40 ${surfaceClass}`}
          />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel
          title="Companies by Plan"
          actions={
            <button
              type="button"
              className="inline-flex items-center justify-center size-9 rounded-full border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
              aria-label="More"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          }
          className={surfaceClass}
        >
          <div className="relative h-64 w-full flex items-end justify-center gap-8 px-4">
            {/* grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              <div className="border-b border-gray-200/60 dark:border-white/10 border-dashed w-full h-0" />
              <div className="border-b border-gray-200/60 dark:border-white/10 border-dashed w-full h-0" />
              <div className="border-b border-gray-200/60 dark:border-white/10 border-dashed w-full h-0" />
              <div className="border-b border-gray-200/60 dark:border-white/10 border-dashed w-full h-0" />
            </div>

            {planBars.map((b) => {
              const heightPct = Math.round((b.value / maxPlanCount) * 100);
              return (
                <div key={b.label} className="flex flex-col items-center gap-2 group w-16 z-10">
                  <div
                    className={`w-full ${b.outerHeightClass} bg-gray-100 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 rounded-t-lg relative overflow-hidden group-hover:opacity-80 transition-opacity`}
                    aria-label={`${b.label}: ${b.value}`}
                  >
                    <div
                      className={`absolute bottom-0 w-full ${b.fillClass}`}
                      style={{ height: `${Math.max(8, heightPct)}%` }}
                    />
                  </div>
                  <span className={`text-xs ${b.emphasis ? 'font-bold text-accent-green' : 'font-medium text-gray-500 dark:text-gray-400'}`}>{b.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">Total Yearly</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{fmtNumber(yearlyCount)}</div>
            </div>
            <div className="text-center">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">Total Monthly</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{fmtNumber(monthlyCount)}</div>
            </div>
            <div className="text-center">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">Active Trials</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{fmtNumber(trialCount)}</div>
            </div>
          </div>
        </Panel>

        <div className="lg:col-span-2">
          <Panel
            title="Recent Companies"
            actions={
              <button
                type="button"
                className="text-sm font-semibold text-accent-green hover:underline"
                onClick={() => navigate('/super-admin/companies')}
              >
                View All
              </button>
            }
            className={surfaceClass}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <th className="py-2">Company Name</th>
                    <th className="py-2">Plan Type</th>
                    <th className="py-2">Validity</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/70 dark:divide-white/10">
                  {filteredRecentCompanies.map((c) => (
                    <tr key={c.id} className="text-sm">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-semibold text-gray-200">
                            {getInitials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white truncate">{c.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${planBadgeClass(c.plan)}`}>
                          {SUPER_ADMIN_PLAN_LABEL[c.plan]}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700 dark:text-gray-200">
                        {(() => {
                          const v = formatValidity(c.validTo);
                          return (
                            <div className="leading-tight">
                              <div className="text-sm text-gray-900 dark:text-white">{v.top}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{v.bottom}</div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border ${
                            statusText(c) === 'Active'
                              ? 'border-accent-green/30 bg-accent-green/10 text-accent-green'
                              : statusText(c) === 'Offline'
                                ? 'border-white/10 bg-white/5 text-gray-300'
                                : 'border-accent-red/30 bg-accent-red/10 text-accent-red'
                          }`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {statusText(c)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => navigate('/super-admin/companies')}
                          className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
                        >
                          Manage
                        </button>
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

              {filteredRecentCompanies.length > 0 && (
                <div className="pt-4 flex items-center justify-center">
                  <button
                    type="button"
                    className="text-xs text-gray-400 hover:text-gray-200 inline-flex items-center gap-2"
                    onClick={() => navigate('/super-admin/companies')}
                  >
                    Show more <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;