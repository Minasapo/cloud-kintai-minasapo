import { Autocomplete } from "@mui/material";
import { AppTextField } from "@shared/ui/form";

import { SettingsSelectProps } from "../types";
import { fieldContainerClassName, fieldLabelClassName } from "../utils";
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
      <Autocomplete
        {...props}
        id={selectId}
        disabled={disabled}
        value={options.find((option) => option.value === value) ?? null}
        onChange={(_, data) => {
          onChange(data?.value ?? "");
        }}
        options={options}
        getOptionLabel={(option) => option.label}
        renderInput={(params) => (
          <AppTextField
            {...params}
            size="small"
            sx={{ width: "100%", maxWidth: { xs: "100%", sm: 400 } }}
            className={inputClassName}
          />
        )}
        className={inputClassName}
      />
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
