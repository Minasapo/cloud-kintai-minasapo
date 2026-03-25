import type { ReactNode } from "react";

import Clock from "@/shared/ui/clock/Clock";
import ClockInButton from "@/shared/ui/time-recorder/ClockInButton";
import ClockOutButton from "@/shared/ui/time-recorder/ClockOutButton";
import DirectSwitch from "@/shared/ui/time-recorder/DirectSwitch";
import GoDirectlyButton from "@/shared/ui/time-recorder/GoDirectlyButton";
import RestEndButton from "@/shared/ui/time-recorder/RestEndButton";
import RestStartButton from "@/shared/ui/time-recorder/RestStartButton";
import ReturnDirectlyButton from "@/shared/ui/time-recorder/ReturnDirectlyButton";

import { type WorkStatus, WorkStatusCodes } from "../lib/common";
import QuickDailyReportCard from "./QuickDailyReportCard";
import { RestTimeMessage } from "./RestTimeMessage";

type TimeRecorderViewProps = {
  today: string;
  staffId: string | null;
  workStatus: WorkStatus;
  directMode: boolean;
  hasChangeRequest: boolean;
  isAttendanceError: boolean;
  clockInDisplayText: string | null;
  clockOutDisplayText: string | null;
  onDirectModeChange: (checked: boolean) => void;
  onClockIn: () => void;
  onClockOut: () => void;
  onGoDirectly: () => void;
  onReturnDirectly: () => void;
  onRestStart: () => void;
  onRestEnd: () => void;
  timeElapsedErrorDialog: ReactNode;
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

function HelpTooltip({ message }: { message: string }) {
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={message}
        className="group inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-300 bg-white text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="10" cy="10" r="7" />
          <path d="M8.9 7.7a1.6 1.6 0 1 1 2.3 1.4c-.7.3-1.2.8-1.2 1.6" />
          <path d="M10 13.8h.01" />
        </svg>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded-xl bg-slate-950 px-3 py-2 text-left text-xs font-medium leading-5 text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.9)] group-hover:block group-focus-visible:block">
          {message}
        </span>
      </button>
    </span>
  );
}

export function TimeRecorderLoadingView() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 md:px-6">
      <div className="overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#14532d_100%)] p-5 text-white shadow-[0_40px_80px_-48px_rgba(15,23,42,0.9)] md:p-8">
        <div className="h-2 w-32 rounded-full bg-white/20" />
        <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <div className="h-10 w-48 rounded-full bg-white/15" />
            <div className="h-16 w-full max-w-md rounded-[1.5rem] bg-white/10" />
            <div className="h-20 w-full rounded-[1.5rem] bg-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-36 rounded-[1.75rem] bg-white/10" />
            <div className="h-36 rounded-[1.75rem] bg-white/10" />
            <div className="h-36 rounded-[1.75rem] bg-white/10" />
            <div className="h-36 rounded-[1.75rem] bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimeRecorderView({
  today,
  staffId,
  workStatus,
  directMode,
  hasChangeRequest,
  isAttendanceError,
  clockInDisplayText,
  clockOutDisplayText,
  onDirectModeChange,
  onClockIn,
  onClockOut,
  onGoDirectly,
  onReturnDirectly,
  onRestStart,
  onRestEnd,
  timeElapsedErrorDialog,
}: TimeRecorderViewProps) {
  const hasSupplementaryInfo =
    hasChangeRequest || isAttendanceError || Boolean(staffId);
  const isBeforeWork = workStatus.code === WorkStatusCodes.BEFORE_WORK;
  const isWorking = workStatus.code === WorkStatusCodes.WORKING;
  const isResting = workStatus.code === WorkStatusCodes.RESTING;

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-3 md:px-4 md:py-4">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/40 bg-[linear-gradient(135deg,#f8fafc_0%,#ecfdf5_42%,#dcfce7_100%)] shadow-[0_32px_72px_-52px_rgba(15,23,42,0.45)] md:rounded-[2rem] md:shadow-[0_40px_80px_-48px_rgba(15,23,42,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,168,94,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.12),transparent_26%)]" />
        <div className="relative space-y-4 p-3 md:space-y-5 md:p-5">
          <section className="space-y-3 md:mx-auto md:max-w-[680px] md:space-y-4">
            <div className="rounded-[1.5rem] bg-slate-950 px-4 py-4 text-white shadow-[0_28px_52px_-32px_rgba(15,23,42,0.85)] md:rounded-[1.6rem] md:px-5 md:py-4">
              <div className="flex flex-col items-center gap-3 text-center md:gap-4">
                <div className="w-full">
                  <h2
                    className="m-0 text-[1.1rem] font-semibold leading-none tracking-[-0.03em] text-slate-200 md:text-[1.5rem]"
                    data-testid="work-status-text"
                  >
                    {workStatus.text || "読み込み中..."}
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

            <section className="rounded-[1.5rem] bg-white/75 p-3 shadow-[0_28px_52px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm md:rounded-[1.6rem] md:p-4">
              <div className="mb-3 rounded-[1.25rem] border border-emerald-200/80 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_100%)] p-3 shadow-[0_20px_40px_-36px_rgba(15,168,94,0.55)] md:mb-4 md:rounded-[1.3rem] md:p-3.5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2">
                    <p className="m-0 text-sm font-semibold text-slate-900 md:text-base">
                      直行 / 直帰
                    </p>
                    <HelpTooltip message="直行や直帰の日だけ切り替えると、対応する打刻ボタンに切り替わります。" />
                  </div>
                  <label className="inline-flex items-center gap-3 self-start rounded-full border border-slate-200 bg-white px-3 py-2.5 md:self-auto md:px-4 md:py-3">
                    <DirectSwitch
                      checked={directMode}
                      onChange={(event) => onDirectModeChange(event.target.checked)}
                      data-testid="direct-mode-switch"
                    />
                    <span className="text-xs font-semibold text-slate-900 md:text-sm">
                      直行/直帰モードを使う
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:mx-auto md:max-w-[620px] md:gap-3">
                <div className="flex">
                  {directMode ? (
                    <GoDirectlyButton
                      key={String(isBeforeWork)}
                      isBeforeWork={isBeforeWork}
                      onGoDirectly={onGoDirectly}
                      disabled={hasChangeRequest}
                    />
                  ) : (
                    <ClockInButton
                      key={String(isBeforeWork)}
                      isBeforeWork={isBeforeWork}
                      onClockIn={onClockIn}
                      disabled={hasChangeRequest}
                    />
                  )}
                </div>
                <div className="flex">
                  {directMode ? (
                    <ReturnDirectlyButton
                      key={String(isWorking)}
                      isWorking={isWorking}
                      onReturnDirectly={onReturnDirectly}
                      disabled={hasChangeRequest}
                    />
                  ) : (
                    <ClockOutButton
                      key={String(isWorking)}
                      isWorking={isWorking}
                      onClockOut={onClockOut}
                      disabled={hasChangeRequest}
                    />
                  )}
                </div>
                <div className="flex">
                  <RestStartButton
                    key={String(isWorking)}
                    isWorking={isWorking}
                    onRestStart={onRestStart}
                    disabled={hasChangeRequest}
                  />
                </div>
                <div className="flex">
                  <RestEndButton
                    key={String(isResting)}
                    isResting={isResting}
                    onRestEnd={onRestEnd}
                    disabled={hasChangeRequest}
                  />
                </div>
              </div>
            </section>

            {hasChangeRequest && (
              <div
                role="alert"
                className="rounded-[1.35rem] border border-amber-200 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] px-4 py-3 text-sm leading-6 text-amber-950 shadow-[0_18px_32px_-30px_rgba(245,158,11,0.65)] md:rounded-[1.5rem] md:px-5 md:py-4"
              >
                <p className="m-0 font-semibold">
                  変更リクエスト申請中です。承認されるまで打刻はできません。
                </p>
              </div>
            )}

            {hasSupplementaryInfo && (
              <div className="space-y-3 md:space-y-4">
                  <QuickDailyReportCard staffId={staffId} date={today} />
                  <RestTimeMessage displayMode="compact" />
              </div>
            )}
          </section>
        </div>
      </div>
      {timeElapsedErrorDialog}
    </div>
  );
}
