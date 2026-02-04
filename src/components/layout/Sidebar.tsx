import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
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
  Building2,
  LogOut,
  UserCog
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  { id: 'operations', label: 'Operations', icon: ClipboardList },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'performance', label: 'Performance', icon: Award },
  { id: 'admin', label: 'Admin', icon: Settings },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { role, isAdmin, canAccessView, isLoading } = useUserRole();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  // Filter nav items based on user permissions
  const visibleNavItems = navItems.filter((item) => {
    if (isLoading) return true; // Show all while loading
    return canAccessView(item.id);
  });

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
          {visibleNavItems.map((item) => {
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
        <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-foreground">
                {user?.email?.slice(0, 2).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-sidebar-muted">
                {isAdmin ? 'Admin' : role ? role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'No Role'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="nav-item w-full"
          >
            <UserCog className="h-4 w-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="nav-item w-full text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
