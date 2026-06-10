import type { SettingsSwitchProps } from "../types";
import { SettingsCheckbox } from "./SettingsCheckbox";

export function SettingsSwitch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
  ariaLabel,
}: SettingsSwitchProps) {
  return (
    <SettingsCheckbox
      checked={checked}
      onChange={onChange}
      label={label}
      description={description}
      disabled={disabled}
      className={className}
      ariaLabel={ariaLabel}
    />
  );
}