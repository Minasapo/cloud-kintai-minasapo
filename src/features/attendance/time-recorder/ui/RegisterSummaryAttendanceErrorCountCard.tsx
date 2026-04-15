import InfoIconTooltip from "@shared/ui/tooltip/InfoIconTooltip";
import { Link as RouterLink } from "react-router-dom";

type RegisterSummaryAttendanceErrorCountCardProps = {
  attendanceErrorCount: number;
  hasAttendanceError: boolean;
  to?: string;
};

export default function RegisterSummaryAttendanceErrorCountCard({
  attendanceErrorCount,
  hasAttendanceError,
  to,
}: RegisterSummaryAttendanceErrorCountCardProps) {
  const attendanceErrorInfoLabel =
    "打刻エラー件数について: 集計期間内で修正が必要な打刻エラー日数を表示しています";
  const cardClassName = `mt-3 rounded-[4px] border border-slate-200/90 bg-slate-50/70 px-3.5 py-3 ${
    to
      ? "block cursor-pointer no-underline transition-colors hover:border-slate-300 hover:bg-slate-100/80 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      : ""
  }`;
  const content = (
    <>
      <div className="flex items-center gap-1.5">
        <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
          打刻エラー件数
        </p>
        <InfoIconTooltip
          testId="register-dashboard-attendance-error-info"
          ariaLabel={attendanceErrorInfoLabel}
          tooltipContent={attendanceErrorInfoLabel}
          tooltipClassName="left-auto right-0 w-[14rem] max-w-[calc(100vw-1rem)] whitespace-normal break-words sm:w-max sm:max-w-[220px]"
        />
      </div>
      <p
        data-testid="register-dashboard-attendance-error-count"
        className={`m-0 mt-1.5 text-2xl font-extrabold leading-none tracking-[-0.03em] ${
          hasAttendanceError ? "text-rose-600" : "text-slate-950"
        }`}
      >
        {attendanceErrorCount}件
      </p>
    </>
  );

  if (to) {
    return (
      <RouterLink
        to={to}
        aria-label={`打刻エラー件数 ${attendanceErrorCount}件。勤怠一覧を開く`}
        data-testid="register-dashboard-attendance-error-card-link"
        className={cardClassName}
      >
        {content}
      </RouterLink>
    );
  }

  return (
    <div className={cardClassName} data-testid="register-dashboard-attendance-error-card">
      {content}
    </div>
  );
}
