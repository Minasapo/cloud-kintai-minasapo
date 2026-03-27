import type { ReactNode } from "react";

type InlineAlertProps = {
  children: ReactNode;
  tone: "info" | "warning" | "error";
  icon?: ReactNode;
  className?: string;
  onClose?: () => void;
};

const inlineAlertToneClassName: Record<InlineAlertProps["tone"], string> = {
  info: "border-sky-500/15 bg-sky-50/90 text-sky-950",
  warning: "border-amber-500/20 bg-amber-50/90 text-amber-950",
  error: "border-rose-500/20 bg-rose-50/90 text-rose-950",
};

export const InlineAlert = ({
  children,
  tone,
  icon,
  className,
  onClose,
}: InlineAlertProps) => (
  <div
    className={`flex items-start gap-3 rounded-[18px] border px-4 py-3 ${inlineAlertToneClassName[tone]} ${className ?? ""}`}
  >
    {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
    <div className="min-w-0 flex-1 text-sm leading-6">{children}</div>
    {onClose ? (
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-current/70 transition hover:bg-black/5 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/20"
      >
        閉じる
      </button>
    ) : null}
  </div>
);
