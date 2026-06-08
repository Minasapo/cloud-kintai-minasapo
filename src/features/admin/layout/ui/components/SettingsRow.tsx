import type { SettingsRowProps } from "../types";

export function SettingsRow({
  label,
  description,
  children,
  className,
}: SettingsRowProps) {
  return (
    <div
      className={[
        "flex flex-row flex-wrap items-start justify-between gap-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-1 flex-1 min-w-[280px] max-w-[640px]">
        <span className="text-base font-semibold text-slate-800">{label}</span>
        {description ? (
          <p className="m-0 text-sm text-slate-500">{description}</p>
        ) : null}
      </div >
      <div className="min-w-[140px]">{children}</div >
    </div >
  );
}