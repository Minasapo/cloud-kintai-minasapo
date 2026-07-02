import { formatISOToTime, parseTimeToISO } from "@shared/lib/time";
import { AppTextField } from "@shared/ui/form";
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

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

  return (
    <div className={className} style={{ ...sx, ...style }}>
      <AppTextField
        type="time"
        inputProps={inputProps}
        value={displayValue}
        onChange={handleChange}
        label={label}
        helperText={helperText}
        error={error}
        size={size}
        fullWidth
      />
    </div>
  );
}
