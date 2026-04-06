import InfoIconTooltip from "@/shared/ui/tooltip/InfoIconTooltip";

type RegisterSummaryAttendanceErrorCountCardProps = {
  attendanceErrorCount: number;
  hasAttendanceError: boolean;
};

export default function RegisterSummaryAttendanceErrorCountCard({
  attendanceErrorCount,
  hasAttendanceError,
}: RegisterSummaryAttendanceErrorCountCardProps) {
  const attendanceErrorInfoLabel =
    "打刻エラー件数について: 集計期間内で修正が必要な打刻エラー日数を表示しています";

  return (
    <div className="mt-3 rounded-[4px] border border-slate-200/90 bg-slate-50/70 px-3.5 py-3">
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
    </div>
  );
}
