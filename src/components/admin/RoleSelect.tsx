import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AppRole } from '@/hooks/useUserRole';

interface RoleSelectProps {
  value: AppRole | null;
  onChange: (role: AppRole) => void;
}

const ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'account_manager', label: 'Account Manager', description: 'Clients, jobs, AM activities' },
  { value: 'recruiter', label: 'Recruiter', description: 'Jobs, recruiter activities' },
  { value: 'business_dev', label: 'Business Dev', description: 'BD prospects' },
  { value: 'operations', label: 'Operations', description: 'Operations, performance' },
  { value: 'finance', label: 'Finance', description: 'Invoices, payments' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

export function RoleSelect({ value, onChange }: RoleSelectProps) {
  return (
    <Select value={value || undefined} onValueChange={(v) => onChange(v as AppRole)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((role) => (
          <SelectItem key={role.value} value={role.value}>
            <div className="flex flex-col">
              <span>{role.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
