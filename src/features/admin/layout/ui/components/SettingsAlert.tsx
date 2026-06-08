import type { SettingsAlertProps } from "../types";

export function SettingsAlert({
  children,
  variant = "info",
  className,
}: SettingsAlertProps) {
  const toneClassName =
    variant === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : variant === "error"
        ? "border-rose-200 bg-rose-50 text-rose-900"
        : "border-sky-200 bg-sky-50 text-sky-900";

  return (
    <div
      className={[
        "rounded-2xl border px-4 py-3 text-sm leading-6",
        toneClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="alert"
    >
      {children}
    </div>
  );
}