import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useCustomFields } from '@/hooks/useCustomFields';
import { useEmployeesByRole, EmployeeRole } from '@/hooks/useEmployees';
import { generateExcelTemplate, downloadExcel } from '@/lib/excelUtils';
import { useToast } from '@/hooks/use-toast';

interface ExcelTemplateDownloadProps {
  department: string;
}

// Map department names to employee roles
const departmentToRole: Record<string, EmployeeRole> = {
  'Recruiter': 'Recruiter',
  'Account Manager': 'Account Manager',
  'Business Development': 'Business Development',
  'Operations Manager': 'Operations Manager',
};

export function ExcelTemplateDownload({ department }: ExcelTemplateDownloadProps) {
  const { data: customFields = [] } = useCustomFields(department);
  const role = departmentToRole[department];
  const { data: employees = [], isLoading } = useEmployeesByRole(role || 'Recruiter');
  const { toast } = useToast();

  const handleDownload = () => {
    try {
      const employeeData = employees.map(e => ({ id: e.id, name: e.name }));
      const workbook = generateExcelTemplate(department, employeeData, customFields);
      const filename = `${department.replace(/\s+/g, '_')}_KPI_Template.xlsx`;
      downloadExcel(workbook, filename);
      toast({ title: 'Success', description: 'Template downloaded successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate template', variant: 'destructive' });
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isLoading} className="w-full">
      <Download className="h-4 w-4 mr-2" />
      Download Template ({employees.length} employees)
    </Button>
  );
}
