import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
  fromYear?: number;
  toYear?: number;
};

export default function DatePickerWithManual({
  value,
  onChange,
  disabled,
  className,
  fromYear = 1900,
  toYear,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(value ? fmt(value) : "");
  const thisYear = toYear ?? new Date().getFullYear();

  React.useEffect(() => setText(value ? fmt(value) : ""), [value]);

  function parseAndCommit() {
    const cleaned = text.trim();
    if (!cleaned) {
      onChange(undefined);
      return;
    }
    const s = cleaned.replace(/\//g, "-");
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return;
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
    const y = d.getFullYear();
    const future = d.getTime() > Date.now();
    if (!isNaN(d.valueOf()) && y >= fromYear && y <= thisYear && !future) {
      onChange(d);
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="w-full">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={parseAndCommit}
              placeholder="YYYY-MM-DD"
              disabled={disabled}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              if (!d) return;
              const y = d.getFullYear();
              if (y < fromYear || y > thisYear || d.getTime() > Date.now()) return;
              onChange(d);
              setText(fmt(d));
              setOpen(false);
            }}
            captionLayout="dropdown"
            fromYear={fromYear}
            toYear={thisYear}
            disabled={(d: Date) => d.getTime() > Date.now()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function fmt(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
