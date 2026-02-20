import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { ClientsView } from '@/components/views/ClientsView';
import { JobsView } from '@/components/views/JobsView';
import { RecruitersView } from '@/components/views/RecruitersView';
import { AccountManagersView } from '@/components/views/AccountManagersView';
import { BusinessDevView } from '@/components/views/BusinessDevView';
import { OperationsView } from '@/components/views/OperationsView';
import { FinanceView } from '@/components/views/FinanceView';
import { PerformanceView } from '@/components/views/PerformanceView';
import { AdminView } from '@/components/views/AdminView';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { canAccessView, isLoading, role } = useUserRole();
  const isMobile = useIsMobile();

  // Reset to dashboard if user doesn't have access to current view
  useEffect(() => {
    if (!isLoading && activeView !== 'dashboard' && !canAccessView(activeView)) {
      setActiveView('dashboard');
    }
  }, [activeView, canAccessView, isLoading]);

  // Close sidebar when switching views on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [activeView]);

  const renderView = () => {
    if (!isLoading && activeView !== 'dashboard' && !canAccessView(activeView)) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to view this section. Contact your administrator for access.
          </p>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'clients': return <ClientsView />;
      case 'jobs': return <JobsView />;
      case 'recruiters': return <RecruitersView />;
      case 'account-managers': return <AccountManagersView />;
      case 'business-dev': return <BusinessDevView />;
      case 'operations': return <OperationsView />;
      case 'finance': return <FinanceView />;
      case 'performance': return <PerformanceView />;
      case 'admin': return <AdminView />;
      default: return <DashboardView />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar activeView={activeView} onViewChange={setActiveView} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="md:pl-64">
          <div className="p-4 sm:p-8 flex items-center justify-center min-h-[50vh]">
            <div className="text-center space-y-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                <div className="h-4 w-4 rounded bg-primary/30" />
              </div>
              <p className="text-muted-foreground">Loading permissions...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar activeView={activeView} onViewChange={setActiveView} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="md:pl-64">
          <div className="p-4 sm:p-8">
            {/* Mobile header */}
            <div className="md:hidden mb-4">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Role Assigned</h2>
              <p className="text-muted-foreground max-w-md mb-4">
                Your account doesn't have a role assigned yet. Please contact your administrator to get access.
              </p>
              <p className="text-sm text-muted-foreground">
                Administrator email: <strong>niramay@mintextech.com</strong>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:pl-64">
        {/* Mobile header */}
        <div className="md:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="font-semibold text-foreground">StaffTrack</h1>
        </div>
        <div className="p-4 sm:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
