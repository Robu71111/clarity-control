import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface DepartmentAccessEditorProps {
  value: string[];
  onChange: (departments: string[]) => void;
}

const DEPARTMENTS = [
  'Recruiter',
  'Account Manager',
  'Business Development',
  'Operations Manager',
  'Finance',
];

export function DepartmentAccessEditor({ value, onChange }: DepartmentAccessEditorProps) {
  const handleToggle = (department: string) => {
    if (value.includes(department)) {
      onChange(value.filter((d) => d !== department));
    } else {
      onChange([...value, department]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {DEPARTMENTS.map((dept) => (
        <div key={dept} className="flex items-center space-x-2">
          <Checkbox
            id={`dept-${dept}`}
            checked={value.includes(dept)}
            onCheckedChange={() => handleToggle(dept)}
          />
          <Label htmlFor={`dept-${dept}`} className="text-sm cursor-pointer">
            {dept}
          </Label>
        </div>
      ))}
    </div>
  );
}
