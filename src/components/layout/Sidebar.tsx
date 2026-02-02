import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  UserCheck, 
  TrendingUp, 
  Settings, 
  DollarSign,
  ClipboardList,
  Award,
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Building2 },
  { id: 'jobs', label: 'Job Tracker', icon: Briefcase },
  { id: 'recruiters', label: 'Recruiters', icon: UserCheck },
  { id: 'account-managers', label: 'Account Managers', icon: Users },
  { id: 'business-dev', label: 'Business Dev', icon: TrendingUp },
  { id: 'operations', label: 'Operations', icon: Settings },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'performance', label: 'Performance', icon: Award },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <ClipboardList className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">StaffTrack</h1>
            <p className="text-xs text-sidebar-muted">KPI Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'nav-item w-full',
                  isActive && 'nav-item-active'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-foreground">OW</span>
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">Owner View</p>
              <p className="text-xs text-sidebar-muted">Admin Access</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
