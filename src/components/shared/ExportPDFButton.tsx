import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportPDFButtonProps {
  onClick: () => void;
}

export function ExportPDFButton({ onClick }: ExportPDFButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <FileDown className="h-4 w-4 mr-2" />
      Export PDF
    </Button>
  );
}
