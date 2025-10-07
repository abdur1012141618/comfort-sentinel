export function AgeInput({ value, onChange }: { value?: number; onChange: (v?: number) => void }) {
  return (
    <input
      className="border rounded px-3 py-2 w-28"
      placeholder="Age"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(e) => {
        let s = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
        if (s === "") return onChange(undefined);
        let n = Math.max(0, Math.min(120, Number(s)));
        onChange(n);
      }}
    />
  );
}
