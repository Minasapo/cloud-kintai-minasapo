import type { SettingsSelectProps } from "../types";
import {
  fieldBaseInputClassName,
  fieldContainerClassName,
  fieldLabelClassName,
  getFieldStateClassName,
} from "../utils";
import { FieldMessages } from "./FieldMessages";

export function SettingsSelect({
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
  options,
  id,
  ...props
}: SettingsSelectProps) {
  const hasError = Boolean(errorText);
  const selectId =
    id ??
    (typeof label === "string"
      ? `settings-select-${label.replace(/\s+/g, "-")}`
      : undefined);

  return (
    <div
      className={[fieldContainerClassName, className].filter(Boolean).join(" ")}
    >
      {label ? (
        <label
          htmlFor={selectId}
          className={[fieldLabelClassName, labelClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
          {required ? <span className="ml-1 text-rose-600">*</span> : null}
        </label>
      ) : null}
      <select
        {...props}
        id={selectId}
        disabled={disabled}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[
          fieldBaseInputClassName,
          "appearance-none pr-9",
          getFieldStateClassName(hasError),
          inputClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {options.some((option) => option.content) ? (
        <div className="flex flex-wrap gap-2">
          {options
            .filter((option) => option.value === value && option.content)
            .map((option) => (
              <div key={option.value}>{option.content}</div>
            ))}
        </div>
      ) : null}
      <FieldMessages helperText={helperText} errorText={errorText} />
    </div>
  );
}