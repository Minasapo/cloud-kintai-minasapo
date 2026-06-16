import { AppSwitch } from "@shared/ui/form";

import { SettingsSwitchProps } from "../types";

export function SettingsSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
  ariaLabel,
}: SettingsSwitchProps) {
  const hasDescription = Boolean(description);

  return (
    <label
      className={[
        "inline-flex cursor-pointer gap-2 text-sm text-slate-700",
        hasDescription ? "items-start" : "items-center",
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AppSwitch
        checked={checked}
        onChange={(_, nextChecked) => onChange(nextChecked)}
        disabled={disabled}
        inputProps={ariaLabel ? { "aria-label": ariaLabel } : undefined}
        size="small"
      />
      <span className="flex flex-col gap-1">
        <span>{label}</span>
        {description ? (
          <span className="text-xs text-slate-500">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
