type WorkDateInputProps = {
  defaultValue: string;
  ariaLabel: string;
  onChange: (value: string) => void;
};

export function WorkDateInput({
  defaultValue,
  ariaLabel,
  onChange,
}: WorkDateInputProps) {
  return (
    <input
      type="date"
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className="w-[8rem] max-w-full rounded-[16px] border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
    />
  );
}
