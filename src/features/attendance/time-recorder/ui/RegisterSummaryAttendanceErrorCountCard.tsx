type RegisterSummaryAttendanceErrorCountCardProps = {
  attendanceErrorCount: number;
  hasAttendanceError: boolean;
};

export default function RegisterSummaryAttendanceErrorCountCard({
  attendanceErrorCount,
  hasAttendanceError,
}: RegisterSummaryAttendanceErrorCountCardProps) {
  const attendanceErrorInfoLabel =
    "打刻エラー件数について: 退勤漏れや重複打刻など、修正が必要な打刻エラー件数を表示しています";
  const infoIconClassName =
    "peer inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600";

  return (
    <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-3">
      <div className="flex items-center gap-1.5">
        <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
          打刻エラー件数
        </p>
        <span className="relative inline-flex">
          <button
            type="button"
            data-testid="register-dashboard-attendance-error-info"
            aria-label={attendanceErrorInfoLabel}
            className={infoIconClassName}
          >
            i
          </button>
          <span className="pointer-events-none absolute right-0 top-7 z-10 w-max max-w-[220px] rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium leading-tight text-white opacity-0 shadow-md transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100">
            {attendanceErrorInfoLabel}
          </span>
        </span>
      </div>
      <p
        data-testid="register-dashboard-attendance-error-count"
        className={`m-0 mt-1.5 text-2xl font-extrabold leading-none tracking-[-0.03em] ${
          hasAttendanceError ? "text-rose-600" : "text-slate-950"
        }`}
      >
        {attendanceErrorCount}件
      </p>
    </div>
  );
}
