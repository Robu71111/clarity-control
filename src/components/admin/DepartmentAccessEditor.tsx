import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const DEPARTMENTS = [
  { key: 'Dashboard', label: 'Dashboard', viewOnly: true },
  { key: 'Recruiter', label: 'Recruiters', viewOnly: false },
  { key: 'Account Manager', label: 'Clients & Jobs', viewOnly: false },
  { key: 'Account Manager View', label: 'Account Managers', viewOnly: false },
  { key: 'Business Development', label: 'Business Dev', viewOnly: false },
  { key: 'Operations Manager', label: 'Operations', viewOnly: false },
  { key: 'Finance', label: 'Finance', viewOnly: false },
  { key: 'Performance', label: 'Performance', viewOnly: true },
];

interface DepartmentAccessEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  viewAccess: string[];
  editAccess: string[];
  onSave: (viewAccess: string[], editAccess: string[]) => void;
}

export function DepartmentAccessEditor({ open, onOpenChange, userName, viewAccess, editAccess, onSave }: DepartmentAccessEditorProps) {
  const [localView, setLocalView] = useState<string[]>(viewAccess);
  const [localEdit, setLocalEdit] = useState<string[]>(editAccess);

  // Reset on open
  const handleOpenChange = (o: boolean) => {
    if (o) {
      setLocalView([...viewAccess]);
      setLocalEdit([...editAccess]);
    }
    onOpenChange(o);
  };

  const toggleView = (key: string) => {
    setLocalView(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]);
    // If removing view, also remove edit
    if (localView.includes(key)) {
      setLocalEdit(prev => prev.filter(d => d !== key));
    }
  };

  const toggleEdit = (key: string) => {
    setLocalEdit(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]);
    // If adding edit, also add view
    if (!localEdit.includes(key)) {
      setLocalView(prev => prev.includes(key) ? prev : [...prev, key]);
    }
  };

  const toggleAllView = () => {
    const allKeys = DEPARTMENTS.map(d => d.key);
    if (localView.length === allKeys.length) {
      setLocalView([]);
      setLocalEdit([]);
    } else {
      setLocalView(allKeys);
    }
  };

  const toggleAllEdit = () => {
    const editableKeys = DEPARTMENTS.filter(d => !d.viewOnly).map(d => d.key);
    if (editableKeys.every(k => localEdit.includes(k))) {
      setLocalEdit([]);
    } else {
      setLocalEdit(editableKeys);
      // Also ensure all are viewable
      const allKeys = DEPARTMENTS.map(d => d.key);
      setLocalView(prev => [...new Set([...prev, ...allKeys])]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Access — {userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Department</span>
            <div className="flex gap-6">
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={toggleAllView}>
                Toggle All View
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={toggleAllEdit}>
                Toggle All Edit
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {DEPARTMENTS.map(dept => (
              <div key={dept.key} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50">
                <span className="text-sm">{dept.label}</span>
                <div className="flex gap-8">
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id={`view-${dept.key}`}
                      checked={localView.includes(dept.key)}
                      onCheckedChange={() => toggleView(dept.key)}
                    />
                    <Label htmlFor={`view-${dept.key}`} className="text-xs text-muted-foreground cursor-pointer">View</Label>
                  </div>
                  {!dept.viewOnly ? (
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id={`edit-${dept.key}`}
                        checked={localEdit.includes(dept.key)}
                        onCheckedChange={() => toggleEdit(dept.key)}
                      />
                      <Label htmlFor={`edit-${dept.key}`} className="text-xs text-muted-foreground cursor-pointer">Edit</Label>
                    </div>
                  ) : (
                    <div className="w-[52px]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSave(localView, localEdit); onOpenChange(false); }}>Save Access</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
