import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

import { formatISOToTime, parseTimeToISO } from "@/shared/lib/time";

type TimeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "size"
> & {
  value: string | null;
  onChange: (isoString: string | null) => void;
  baseDate: string;
  label?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  size?: "small" | "medium";
  sx?: CSSProperties;
};

const inputBaseClassName =
  "w-full rounded-md border bg-white text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const inputSizeClassName = {
  small: "min-h-9 px-3 py-2 text-sm leading-5",
  medium: "min-h-10 px-3 py-2.5 text-base leading-6",
} as const;

export function TimeInput({
  value,
  onChange,
  baseDate,
  label,
  helperText,
  error = false,
  size = "medium",
  sx,
  className,
  style,
  ...inputProps
}: TimeInputProps) {
  const displayValue = value ? formatISOToTime(value) : "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = event.target.value;

    if (!timeValue) {
      onChange(null);
      return;
    }

    const isoString = parseTimeToISO(timeValue, baseDate);
    onChange(isoString);
  };

  const inputClassName = [
    inputBaseClassName,
    inputSizeClassName[size],
    error
      ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
      : "border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-1" style={{ ...sx, ...style }}>
      {label ? (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      ) : null}
      <input
        {...inputProps}
        type="time"
        value={displayValue}
        onChange={handleChange}
        className={inputClassName}
      />
      {helperText ? (
        <p
          className={`m-0 text-xs leading-5 ${error ? "text-rose-600" : "text-slate-500"}`}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
