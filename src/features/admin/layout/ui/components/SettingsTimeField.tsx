import type { SettingsTimeFieldProps } from "../types";
import { createTimeValue } from "../utils";
import { SettingsTextField } from "./SettingsTextField";

export function SettingsTimeField({
  label,
  helperText,
  errorText,
  className,
  inputClassName,
  labelClassName,
  disabled,
  required,
  value,
  onChange,
  ...props
}: SettingsTimeFieldProps) {
  return (
    <SettingsTextField
      {...props}
      label={label}
      helperText={helperText}
      errorText={errorText}
      className={className}
      inputClassName={inputClassName}
      labelClassName={labelClassName}
      disabled={disabled}
      required={required}
      type="time"
      value={value ? value.format("HH:mm") : ""}
      onChange={(nextValue) => onChange(createTimeValue(nextValue))}
    />
  );
}