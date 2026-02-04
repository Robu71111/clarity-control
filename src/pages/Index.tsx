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
import { Shield } from 'lucide-react';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const { canAccessView, isLoading, role } = useUserRole();

  // Reset to dashboard if user doesn't have access to current view
  useEffect(() => {
    if (!isLoading && activeView !== 'dashboard' && !canAccessView(activeView)) {
      setActiveView('dashboard');
    }
  }, [activeView, canAccessView, isLoading]);

  const renderView = () => {
    // Check access permission (dashboard is always accessible)
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
      case 'dashboard':
        return <DashboardView />;
      case 'clients':
        return <ClientsView />;
      case 'jobs':
        return <JobsView />;
      case 'recruiters':
        return <RecruitersView />;
      case 'account-managers':
        return <AccountManagersView />;
      case 'business-dev':
        return <BusinessDevView />;
      case 'operations':
        return <OperationsView />;
      case 'finance':
        return <FinanceView />;
      case 'performance':
        return <PerformanceView />;
      case 'admin':
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="pl-64">
          <div className="p-8 flex items-center justify-center min-h-[50vh]">
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

  // Show message if user has no role assigned
  if (!role) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="pl-64">
          <div className="p-8">
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
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="pl-64">
        <div className="p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
