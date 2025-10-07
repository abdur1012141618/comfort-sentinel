export function AgeInput({ value, onChange, disabled, className }: { 
  value?: number | string; 
  onChange: (v?: number | string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const numValue = typeof value === 'string' ? (value === '' ? undefined : Number(value)) : value;
  
  return (
    <input
      className={`border rounded px-3 py-2 w-28 ${className || ''}`}
      placeholder="Age"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) => {
        let s = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
        if (s === "") return onChange(typeof value === 'string' ? "" : undefined);
        let n = Math.max(0, Math.min(120, Number(s)));
        onChange(typeof value === 'string' ? String(n) : n);
      }}
      disabled={disabled}
    />
  );
}
