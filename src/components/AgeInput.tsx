import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface AgeInputProps {
  value: string;
  onChange: (age: string) => void;
  disabled?: boolean;
  className?: string;
}

export function AgeInput({ value, onChange, disabled, className }: AgeInputProps) {
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    
    if (digits === '') {
      onChange('');
      setError('');
      return;
    }
    
    const num = Math.min(120, Number(digits));
    onChange(String(num));
    setError('');
  };

  const handleBlur = () => {
    if (value === '') {
      setError('Enter 0–120');
      return;
    }
    
    const n = parseInt(value, 10);
    if (Number.isNaN(n) || n < 0 || n > 120) {
      setError('Enter 0–120');
      onChange('');
    } else {
      setError('');
    }
  };

  return (
    <div className="space-y-1">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="Age"
        className={className}
      />
      {error && (
        <p className="text-xs text-muted-foreground">{error}</p>
      )}
    </div>
  );
}
