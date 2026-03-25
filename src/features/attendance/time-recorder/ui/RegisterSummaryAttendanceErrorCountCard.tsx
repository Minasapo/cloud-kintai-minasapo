type RegisterSummaryAttendanceErrorCountCardProps = {
  attendanceErrorCount: number;
  hasAttendanceError: boolean;
};

export default function RegisterSummaryAttendanceErrorCountCard({
  attendanceErrorCount,
  hasAttendanceError,
}: RegisterSummaryAttendanceErrorCountCardProps) {
  return (
    <div className="mt-3 rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-3">
      <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
        打刻エラー件数
      </p>
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
