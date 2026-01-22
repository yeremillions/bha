import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { BookOpen, DollarSign, Percent, Wine } from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { AlertsSection } from '@/components/admin/AlertsSection';
import { PendingApprovals } from '@/components/admin/PendingApprovals';
import { QuickActions } from '@/components/admin/QuickActions';
import { TodaySchedule } from '@/components/admin/TodaySchedule';
import { RecentBookings } from '@/components/admin/RecentBookings';
import { HousekeepingTasks } from '@/components/admin/HousekeepingTasks';
import { MonthlyOverview } from '@/components/admin/MonthlyOverview';
import { useDashboardStats, formatNaira } from '@/hooks/useDashboardStats';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-accent/3 blur-3xl" />
      </div>
      
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)} 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div
        className={cn(
          'relative transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Header */}
        <AdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
              <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-accent/10 text-accent rounded-full">
                Live
              </span>
            </div>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening at Brooklyn Hills today.
            </p>
          </div>

          {/* Stats Grid - Bento style */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Today's Bookings"
              value={statsLoading ? '...' : String(stats?.todayBookings ?? 0)}
              subtitle={statsLoading ? '...' : `${stats?.weekBookings ?? 0} this week`}
              trend={stats?.bookingsTrend ?? { value: '0%', positive: true }}
              icon={BookOpen}
              variant="navy"
            />
            <StatCard
              title="Today's Revenue"
              value={statsLoading ? '...' : formatNaira(stats?.todayRevenue ?? 0)}
              subtitle={statsLoading ? '...' : `${formatNaira(stats?.weekRevenue ?? 0)} this week`}
              trend={stats?.revenueTrend ?? { value: '0%', positive: true }}
              icon={DollarSign}
              variant="success"
            />
            <StatCard
              title="Occupancy Rate"
              value={statsLoading ? '...' : `${stats?.occupancyRate ?? 0}%`}
              subtitle="This month"
              trend={stats?.occupancyTrend ?? { value: '0%', positive: true }}
              icon={Percent}
              variant="gold"
            />
            <StatCard
              title="Bar Sales Today"
              value={statsLoading ? '...' : formatNaira(stats?.barSalesToday ?? 0)}
              subtitle={statsLoading ? '...' : `${formatNaira(stats?.barSalesWeek ?? 0)} this week`}
              trend={stats?.barSalesTrend ?? { value: '0%', positive: true }}
              icon={Wine}
              variant="purple"
            />
          </div>

          {/* Alerts */}
          <div className="mb-8">
            <AlertsSection />
          </div>

          {/* Pending Approvals */}
          <div className="mb-8">
            <PendingApprovals />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>

          {/* Main Grid - Modern bento layout */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-8">
            <TodaySchedule />
            <RecentBookings />
          </div>

          {/* Bottom Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <HousekeepingTasks />
            <MonthlyOverview />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
