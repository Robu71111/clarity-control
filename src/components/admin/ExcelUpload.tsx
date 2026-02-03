import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useCustomFields } from '@/hooks/useCustomFields';
import { useBulkUpsertCustomFieldValues } from '@/hooks/useCustomFieldValues';
import { parseExcelFile, ParsedExcelData, ValidationError } from '@/lib/excelUtils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExcelUploadProps {
  department: string;
}

export function ExcelUpload({ department }: ExcelUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ParsedExcelData | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { data: customFields = [] } = useCustomFields(department);
  const bulkUpsert = useBulkUpsertCustomFieldValues();
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setResult(null);
    setUploadSuccess(false);

    try {
      const parsed = await parseExcelFile(file, customFields);
      setResult(parsed);

      if (parsed.errors.length === 0 && parsed.data.length > 0) {
        // Auto-process if no errors
        await processData(parsed);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to parse Excel file', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const processData = async (parsed: ParsedExcelData) => {
    // Get current period (week)
    const currentPeriod = format(new Date(), 'yyyy-WW');

    // Build values to upsert for custom fields
    const valuesToUpsert = [];

    for (const row of parsed.data) {
      for (const field of customFields) {
        const value = row[field.field_name];
        if (value !== undefined && value !== null) {
          valuesToUpsert.push({
            custom_field_id: field.id,
            employee_id: row.id,
            period: currentPeriod,
            value: String(value),
          });
        }
      }
    }

    if (valuesToUpsert.length > 0) {
      try {
        await bulkUpsert.mutateAsync(valuesToUpsert);
        setUploadSuccess(true);
        toast({ title: 'Success', description: `Updated ${valuesToUpsert.length} custom field values` });
      } catch {
        toast({ title: 'Error', description: 'Failed to save data', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Info', description: 'No custom field values to update' });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileSelect(file);
    } else {
      toast({ title: 'Error', description: 'Please upload an Excel file (.xlsx or .xls)', variant: 'destructive' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            {isProcessing ? 'Processing...' : 'Drop file here or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">.xlsx or .xls</p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleInputChange}
      />

      {uploadSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Upload Complete</AlertTitle>
          <AlertDescription>
            Data has been successfully imported.
          </AlertDescription>
        </Alert>
      )}

      {result && result.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors ({result.errors.length})</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 text-sm space-y-1 max-h-32 overflow-y-auto">
              {result.errors.slice(0, 10).map((err: ValidationError, i: number) => (
                <li key={i}>Row {err.row}, {err.column}: {err.message}</li>
              ))}
              {result.errors.length > 10 && (
                <li>...and {result.errors.length - 10} more errors</li>
              )}
            </ul>
            {result.data.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => processData(result)}
              >
                Import valid rows only
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
