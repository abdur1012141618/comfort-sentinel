import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface DatePickerWithManualProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
}

export function DatePickerWithManual({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  disableFuture = false,
  disablePast = false,
}: DatePickerWithManualProps) {
  const [manualInput, setManualInput] = useState('');
  const [manualError, setManualError] = useState('');

  const handleManualBlur = () => {
    if (!manualInput.trim()) {
      setManualError('');
      return;
    }

    // Try multiple date formats
    const formats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy'];
    let parsedDate: Date | null = null;

    for (const fmt of formats) {
      try {
        const d = parse(manualInput, fmt, new Date());
        if (isValid(d)) {
          parsedDate = d;
          break;
        }
      } catch {
        // Continue to next format
      }
    }

    if (parsedDate && isValid(parsedDate)) {
      onChange(parsedDate);
      setManualInput('');
      setManualError('');
    } else {
      setManualError('Invalid date');
    }
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) => {
              if (disableFuture && date > new Date()) return true;
              if (disablePast && date < new Date()) return true;
              return date < new Date("1900-01-01");
            }}
            captionLayout="dropdown"
            fromYear={2000}
            toYear={2035}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Manual (YYYY-MM-DD)</Label>
        <Input
          type="text"
          placeholder="2024-01-15"
          value={manualInput}
          onChange={(e) => {
            setManualInput(e.target.value);
            setManualError('');
          }}
          onBlur={handleManualBlur}
          disabled={disabled}
          className={manualError ? 'border-destructive' : ''}
        />
        {manualError && (
          <p className="text-xs text-destructive">{manualError}</p>
        )}
      </div>
    </div>
  );
}
