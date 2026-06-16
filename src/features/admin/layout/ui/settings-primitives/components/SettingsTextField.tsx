import { SettingsTextFieldProps } from "../types";
import {
  fieldBaseInputClassName,
  fieldContainerClassName,
  fieldLabelClassName,
  getFieldStateClassName,
} from "../utils";
import { FieldMessages } from "./FieldMessages";

export function SettingsTextField({
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
  type = "text",
  ...props
}: SettingsTextFieldProps) {
  const hasError = Boolean(errorText);

  return (
    <div
      className={[fieldContainerClassName, className].filter(Boolean).join(" ")}
    >
      {label ? (
        <label
          className={[fieldLabelClassName, labelClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
          {required ? <span className="ml-1 text-rose-600">*</span> : null}
        </label>
      ) : null}
      <input
        {...props}
        disabled={disabled}
        required={required}
        value={value}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        className={[
          fieldBaseInputClassName,
          getFieldStateClassName(hasError),
          inputClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <FieldMessages helperText={helperText} errorText={errorText} />
    </div>
  );
}