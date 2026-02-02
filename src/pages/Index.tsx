import { useState } from 'react';
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

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
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
      default:
        return <DashboardView />;
    }
  };

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
