import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"; // shadcn day-picker
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type Props = {
  value?: Date | null;
  onChange: (d: Date | null) => void;
  fromYear?: number; // default 1900
  toYear?: number; // default current year
};

export function DatePickerWithManual({ value, onChange, fromYear = 1900, toYear = new Date().getFullYear() }: Props) {
  const [text, setText] = React.useState(value ? format(value, "yyyy-MM-dd") : "");

  React.useEffect(() => {
    setText(value ? format(value, "yyyy-MM-dd") : "");
  }, [value]);

  const commit = (s: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return onChange(null);
    const [_, y, mo, d] = m;
    const yr = +y;
    const dt = new Date(`${y}-${mo}-${d}T00:00:00`);
    if (!Number.isFinite(dt.getTime())) return onChange(null);
    if (yr < fromYear || yr > toYear) return onChange(null);
    onChange(dt);
  };

  return (
    <div className="flex gap-2 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-40 justify-start">
            {value ? format(value, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(d) => onChange(d ?? null)}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={toYear}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* manual input */}
      <input
        className="border rounded px-3 py-2 w-40"
        placeholder="YYYY-MM-DD"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => commit(text)}
        inputMode="numeric"
      />
    </div>
  );
}
