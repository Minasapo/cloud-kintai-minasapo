import { Tooltip as MuiTooltip } from "@mui/material";

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

  return (
    <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-3">
      <div className="flex items-center gap-1.5">
        <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
          打刻エラー件数
        </p>
        <MuiTooltip title={attendanceErrorInfoLabel} arrow>
          <button
            type="button"
            data-testid="register-dashboard-attendance-error-info"
            aria-label={attendanceErrorInfoLabel}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600"
          >
            i
          </button>
        </MuiTooltip>
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
