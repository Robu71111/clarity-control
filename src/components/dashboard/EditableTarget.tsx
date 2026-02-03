import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Pencil } from 'lucide-react';

interface EditableTargetProps {
  value: number;
  onSave: (value: number) => void;
  format?: 'number' | 'percentage' | 'currency';
  disabled?: boolean;
}

export function EditableTarget({ value, onSave, format = 'number', disabled = false }: EditableTargetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const formatDisplay = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const handleSave = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 h-7 text-sm"
          autoFocus
        />
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
          <Check className="h-3 w-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">{formatDisplay(value)}</span>
      {!disabled && (
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            setEditValue(value.toString());
            setIsEditing(true);
          }}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
