import { useCustomFields } from '@/hooks/useCustomFields';
import { useCustomFieldValues } from '@/hooks/useCustomFieldValues';
import { format } from 'date-fns';

interface CustomFieldsDisplayProps {
  department: string;
  employeeId?: string;
  period?: string;
}

export function CustomFieldsDisplay({ department, employeeId, period }: CustomFieldsDisplayProps) {
  const currentPeriod = period || format(new Date(), 'yyyy-MM');
  const { data: fields, isLoading: fieldsLoading } = useCustomFields(department);
  const { data: values, isLoading: valuesLoading } = useCustomFieldValues(currentPeriod, employeeId);

  if (fieldsLoading || valuesLoading) return null;
  if (!fields || fields.length === 0) return null;

  const getFieldValue = (fieldId: string) => {
    const val = values?.find(v => v.custom_field_id === fieldId);
    return val?.value ?? '-';
  };

  const formatValue = (value: string, fieldType: string) => {
    if (value === '-') return value;
    switch (fieldType) {
      case 'currency':
        return `$${Number(value).toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      case 'number':
        return Number(value).toLocaleString();
      default:
        return value;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {fields.map(field => {
        const rawValue = getFieldValue(field.id);
        return (
          <div key={field.id} className="kpi-card">
            <p className="text-sm text-muted-foreground">{field.field_name}</p>
            <p className="text-2xl font-bold mt-1">
              {formatValue(rawValue, field.field_type)}
            </p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{field.field_type}</p>
          </div>
        );
      })}
    </div>
  );
}
