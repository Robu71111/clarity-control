import * as XLSX from 'xlsx';
import { CustomKPIField, CustomFieldType } from '@/hooks/useCustomFields';

export interface ExcelEmployee {
  id: string;
  name: string;
  [key: string]: string | number | null;
}

export interface ValidationError {
  row: number;
  column: string;
  message: string;
}

export interface ParsedExcelData {
  data: ExcelEmployee[];
  errors: ValidationError[];
}

// Standard KPI columns per department
export const departmentKPIs: Record<string, { name: string; type: CustomFieldType }[]> = {
  Recruiter: [
    { name: 'Open Positions Worked On', type: 'number' },
    { name: 'Job Coverage Ratio', type: 'percentage' },
    { name: 'AM Submissions', type: 'number' },
    { name: 'End Client Submissions', type: 'number' },
    { name: 'Interviews', type: 'number' },
    { name: 'Hired', type: 'number' },
  ],
  'Account Manager': [
    { name: 'Client Meetings', type: 'number' },
    { name: 'Jobs Opened', type: 'number' },
    { name: 'Revenue Generated', type: 'currency' },
  ],
  'Business Development': [
    { name: 'Leads Generated', type: 'number' },
    { name: 'Meetings Scheduled', type: 'number' },
    { name: 'Proposals Sent', type: 'number' },
    { name: 'Deals Closed', type: 'number' },
  ],
  'Operations Manager': [
    { name: 'Tasks Completed', type: 'number' },
    { name: 'Process Improvements', type: 'number' },
  ],
};

export function generateExcelTemplate(
  department: string,
  employees: { id: string; name: string }[],
  customFields: CustomKPIField[]
): XLSX.WorkBook {
  const standardKPIs = departmentKPIs[department] || [];
  
  // Build header row
  const headers = [
    'Employee ID',
    'Employee Name',
    ...standardKPIs.map(k => k.name),
    ...customFields.map(f => f.field_name),
  ];
  
  // Build data rows
  const rows = employees.map(emp => [
    emp.id,
    emp.name,
    ...standardKPIs.map(() => ''),
    ...customFields.map(() => ''),
  ]);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Set column widths
  ws['!cols'] = headers.map((h, i) => ({
    wch: i < 2 ? 40 : Math.max(h.length + 5, 15),
  }));
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, department);
  
  return wb;
}

export function downloadExcel(workbook: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(workbook, filename);
}

export function parseExcelFile(
  file: File,
  customFields: CustomKPIField[]
): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          resolve({ data: [], errors: [{ row: 0, column: '', message: 'File is empty or has no data rows' }] });
          return;
        }
        
        const headers = (jsonData[0] as unknown[]).map(h => String(h || ''));
        const errors: ValidationError[] = [];
        const parsedData: ExcelEmployee[] = [];
        
        // Process each row
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as unknown[];
          if (!row || row.length === 0) continue;
          if (!row || row.length === 0) continue;
          
          const employeeId = String(row[0] || '');
          const employeeName = String(row[1] || '');
          
          if (!employeeId) {
            errors.push({ row: i + 1, column: 'Employee ID', message: 'Employee ID is required' });
            continue;
          }
          
          const employee: ExcelEmployee = {
            id: employeeId,
            name: employeeName,
          };
          
          // Parse remaining columns
          for (let j = 2; j < headers.length; j++) {
            const header = headers[j];
            const value = row[j];
            
            // Find custom field for this column
            const customField = customFields.find(f => f.field_name === header);
            
            if (customField) {
              const validated = validateFieldValue(value, customField.field_type, i + 1, header);
              if (validated.error) {
                errors.push(validated.error);
              }
              employee[header] = validated.value;
            } else {
              // Standard field - assume number
              employee[header] = parseNumericValue(value);
            }
          }
          
          parsedData.push(employee);
        }
        
        resolve({ data: parsedData, errors });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

function validateFieldValue(
  value: unknown,
  fieldType: CustomFieldType,
  row: number,
  column: string
): { value: string | number | null; error?: ValidationError } {
  if (value === null || value === undefined || value === '') {
    return { value: null };
  }
  
  const strValue = String(value);
  
  switch (fieldType) {
    case 'number': {
      const num = parseFloat(strValue.replace(/[,$]/g, ''));
      if (isNaN(num)) {
        return {
          value: null,
          error: { row, column, message: `Invalid number: "${strValue}"` },
        };
      }
      return { value: num };
    }
    
    case 'currency': {
      const num = parseFloat(strValue.replace(/[$,]/g, ''));
      if (isNaN(num)) {
        return {
          value: null,
          error: { row, column, message: `Invalid currency: "${strValue}"` },
        };
      }
      return { value: num };
    }
    
    case 'percentage': {
      const num = parseFloat(strValue.replace(/%/g, ''));
      if (isNaN(num) || num < 0 || num > 100) {
        return {
          value: null,
          error: { row, column, message: `Invalid percentage (0-100): "${strValue}"` },
        };
      }
      return { value: num };
    }
    
    case 'date': {
      const date = new Date(strValue);
      if (isNaN(date.getTime())) {
        return {
          value: null,
          error: { row, column, message: `Invalid date: "${strValue}"` },
        };
      }
      return { value: date.toISOString().split('T')[0] };
    }
    
    case 'text':
    default:
      if (strValue.length > 500) {
        return {
          value: strValue.substring(0, 500),
          error: { row, column, message: 'Text truncated to 500 characters' },
        };
      }
      return { value: strValue };
  }
}

function parseNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = parseFloat(String(value).replace(/[,$%]/g, ''));
  return isNaN(num) ? null : num;
}
