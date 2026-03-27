import type { ReactNode } from "react";

const cx = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");

const spinnerSizeClassName = {
  sm: "workflow-spinner--sm",
  md: "workflow-spinner--md",
} as const;

const infoCardToneClassName = {
  info: "workflow-info-card--info",
  error: "workflow-info-card--error",
} as const;

export function Surface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("workflow-surface", className)}>{children}</div>;
}

export function Spinner({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={cx("workflow-spinner", spinnerSizeClassName[size])}
      aria-hidden="true"
    />
  );
}

export function InfoCard({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: ReactNode;
}) {
  return (
    <div className={cx("workflow-info-card", infoCardToneClassName[tone])}>
      {children}
    </div>
  );
}
