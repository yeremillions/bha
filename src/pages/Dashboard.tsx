import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { BookOpen, DollarSign, Percent, Wine } from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { AlertsSection } from '@/components/admin/AlertsSection';
import { QuickActions } from '@/components/admin/QuickActions';
import { TodaySchedule } from '@/components/admin/TodaySchedule';
import { RecentBookings } from '@/components/admin/RecentBookings';
import { HousekeepingTasks } from '@/components/admin/HousekeepingTasks';
import { MonthlyOverview } from '@/components/admin/MonthlyOverview';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Page Content */}
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Today's Bookings"
              value="3"
              subtitle="12 this week"
              trend={{ value: '+12%', positive: true }}
              icon={BookOpen}
              chartColor="stroke-blue-500"
            />
            <StatCard
              title="Today's Revenue"
              value="₦135,000"
              subtitle="₦540,000 this week"
              trend={{ value: '+8%', positive: true }}
              icon={DollarSign}
              chartColor="stroke-green-500"
            />
            <StatCard
              title="Occupancy Rate"
              value="78%"
              subtitle="This month"
              trend={{ value: '+5%', positive: true }}
              icon={Percent}
              chartColor="stroke-amber-500"
            />
            <StatCard
              title="Bar Sales Today"
              value="₦25,000"
              subtitle="₦105,000 this week"
              trend={{ value: '+15%', positive: true }}
              icon={Wine}
              chartColor="stroke-purple-500"
            />
          </div>

          {/* Alerts */}
          <div className="mb-8">
            <AlertsSection />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <TodaySchedule />
            <RecentBookings />
          </div>

          {/* Bottom Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <HousekeepingTasks />
            <MonthlyOverview />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
