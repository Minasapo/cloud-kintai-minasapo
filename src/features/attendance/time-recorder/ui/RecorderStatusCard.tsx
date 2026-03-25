import type { ReactNode } from "react";

import Clock from "@/shared/ui/clock/Clock";

type RecorderStatusCardProps = {
  workStatusText: string;
  clockInDisplayText: string | null;
  clockOutDisplayText: string | null;
};

function StatusBadge({
  tone,
  testId,
  children,
}: {
  tone: "success" | "danger";
  testId: string;
  children: ReactNode;
}) {
  const palette =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <p
      className={[
        "m-0 inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm",
        palette,
      ].join(" ")}
      data-testid={testId}
    >
      {children}
    </p>
  );
}

export default function RecorderStatusCard({
  workStatusText,
  clockInDisplayText,
  clockOutDisplayText,
}: RecorderStatusCardProps) {
  return (
    <div className="rounded-[1.5rem] bg-slate-950 px-4 py-4 text-white shadow-[0_28px_52px_-32px_rgba(15,23,42,0.85)] md:rounded-[1.6rem] md:px-5 md:py-4">
      <div className="flex flex-col items-center gap-3 text-center md:gap-4">
        <div className="w-full">
          <h2
            className="m-0 text-[1.1rem] font-semibold leading-none tracking-[-0.03em] text-slate-200 md:text-[1.5rem]"
            data-testid="work-status-text"
          >
            {workStatusText}
          </h2>
        </div>
        <div className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3 md:rounded-[1.4rem] md:px-5 md:py-4">
          <div className="text-[2.1rem] leading-none text-white md:text-[2.6rem]">
            <Clock />
          </div>
        </div>
      </div>

      {(clockInDisplayText || clockOutDisplayText) && (
        <div className="mt-3 flex flex-wrap gap-2 md:mt-5">
          {clockInDisplayText && (
            <StatusBadge tone="success" testId="clock-in-time-text">
              {clockInDisplayText}
            </StatusBadge>
          )}
          {clockOutDisplayText && (
            <StatusBadge tone="danger" testId="clock-out-time-text">
              {clockOutDisplayText}
            </StatusBadge>
          )}
        </div>
      )}
    </div>
  );
}
