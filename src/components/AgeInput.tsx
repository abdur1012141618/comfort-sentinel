import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface AgeInputProps {
  value: number | undefined;
  onChange: (age: number | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function AgeInput({ value, onChange, disabled, className }: AgeInputProps) {
  const [ageStr, setAgeStr] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Initialize from value prop
  useEffect(() => {
    if (value !== undefined) {
      setAgeStr(String(value));
      setError('');
    } else {
      setAgeStr('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^\d]/g, '');
    
    if (v === '') {
      setAgeStr('');
      setError('');
      onChange(undefined);
      return;
    }
    
    const n = Math.min(120, parseInt(v, 10));
    const clean = Number.isNaN(n) ? '' : String(n);
    setAgeStr(clean);
    setError('');
    onChange(Number.isNaN(n) ? undefined : n);
  };

  const handleBlur = () => {
    if (ageStr === '') {
      setError('Enter 0–120');
      return;
    }
    
    const n = parseInt(ageStr, 10);
    if (Number.isNaN(n) || n < 0 || n > 120) {
      setError('Enter 0–120');
      setAgeStr('');
      onChange(undefined);
    } else {
      // Remove leading zeros on blur
      setAgeStr(String(n));
      setError('');
    }
  };

  return (
    <div className="space-y-1">
      <Input
        type="text"
        inputMode="numeric"
        value={ageStr}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="0-120"
        className={className}
      />
      {error && (
        <p className="text-xs text-muted-foreground">{error}</p>
      )}
    </div>
  );
}
