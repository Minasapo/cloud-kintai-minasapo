import type { SettingsTextAreaFieldProps } from "../types";
import {
  fieldBaseInputClassName,
  fieldContainerClassName,
  fieldLabelClassName,
  getFieldStateClassName,
} from "../utils";
import { FieldMessages } from "./FieldMessages";

export function SettingsTextAreaField({
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
  minRows = 3,
  textAreaProps,
  ...props
}: SettingsTextAreaFieldProps) {
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
      <textarea
        {...textAreaProps}
        {...props}
        rows={minRows}
        disabled={disabled}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[
          fieldBaseInputClassName,
          "resize-y",
          getFieldStateClassName(hasError),
          inputClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <FieldMessages helperText={helperText} errorText={errorText} />
    </div >
  );
}