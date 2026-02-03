import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useCustomFields, useCreateCustomField, useUpdateCustomField, useDeleteCustomField, CustomFieldType } from '@/hooks/useCustomFields';
import { useToast } from '@/hooks/use-toast';

interface CustomFieldsManagerProps {
  department: string;
}

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'date', label: 'Date' },
];

const MAX_CUSTOM_FIELDS = 5;

export function CustomFieldsManager({ department }: CustomFieldsManagerProps) {
  const { data: fields = [], isLoading } = useCustomFields(department);
  const createField = useCreateCustomField();
  const updateField = useUpdateCustomField();
  const deleteField = useDeleteCustomField();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldType, setEditFieldType] = useState<CustomFieldType>('text');

  const canAddMore = fields.length < MAX_CUSTOM_FIELDS;

  const handleAdd = async () => {
    if (!newFieldName.trim()) {
      toast({ title: 'Error', description: 'Field name is required', variant: 'destructive' });
      return;
    }

    try {
      await createField.mutateAsync({
        department,
        field_name: newFieldName.trim(),
        field_type: newFieldType,
      });
      setNewFieldName('');
      setNewFieldType('text');
      setIsAdding(false);
      toast({ title: 'Success', description: 'Custom field added' });
    } catch {
      toast({ title: 'Error', description: 'Failed to add custom field', variant: 'destructive' });
    }
  };

  const handleEdit = async (id: string) => {
    if (!editFieldName.trim()) {
      toast({ title: 'Error', description: 'Field name is required', variant: 'destructive' });
      return;
    }

    try {
      await updateField.mutateAsync({
        id,
        field_name: editFieldName.trim(),
        field_type: editFieldType,
      });
      setEditingId(null);
      toast({ title: 'Success', description: 'Custom field updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update custom field', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteField.mutateAsync(id);
      toast({ title: 'Success', description: 'Custom field deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete custom field', variant: 'destructive' });
    }
  };

  const startEdit = (field: { id: string; field_name: string; field_type: CustomFieldType }) => {
    setEditingId(field.id);
    setEditFieldName(field.field_name);
    setEditFieldType(field.field_type);
  };

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-48 rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Custom Fields for {department}s</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {fields.length}/{MAX_CUSTOM_FIELDS} custom fields
          </p>
        </div>
        {canAddMore && !isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Field
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Field Name</TableHead>
              <TableHead className="w-32">Type</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  {editingId === field.id ? (
                    <Input
                      value={editFieldName}
                      onChange={(e) => setEditFieldName(e.target.value)}
                      className="h-8"
                      autoFocus
                    />
                  ) : (
                    field.field_name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === field.id ? (
                    <Select value={editFieldType} onValueChange={(v) => setEditFieldType(v as CustomFieldType)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="capitalize">{field.field_type}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === field.id ? (
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(field.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(field)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(field.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {isAdding && (
              <TableRow>
                <TableCell className="text-muted-foreground">{fields.length + 1}</TableCell>
                <TableCell>
                  <Input
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Enter field name"
                    className="h-8"
                    autoFocus
                  />
                </TableCell>
                <TableCell>
                  <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as CustomFieldType)}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleAdd}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsAdding(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {fields.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No custom fields yet. Click "Add Field" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
