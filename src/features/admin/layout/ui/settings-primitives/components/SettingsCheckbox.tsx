import { SettingsCheckboxProps } from "../types";

export function SettingsCheckbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
  ariaLabel,
}: SettingsCheckboxProps) {
  const hasDescription = Boolean(description);

  return (
    <label
      className={[
        "inline-flex cursor-pointer gap-3 text-sm text-slate-700",
        hasDescription ? "items-start" : "items-center",
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="checkbox"
        className={[
          "h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500",
          hasDescription ? "mt-0.5" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        aria-label={ariaLabel}
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
