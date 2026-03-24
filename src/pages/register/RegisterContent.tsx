import { Tooltip } from "@mui/material";
import { useState } from "react";

import type { TimeRecorderAnnouncement } from "@/features/attendance/time-recorder/lib/timeRecorderAnnouncement";
import RegisterAttendanceSummaryCard from "@/features/attendance/time-recorder/ui/RegisterAttendanceSummaryCard";
import RegisterDashboardPanel from "@/features/attendance/time-recorder/ui/RegisterDashboardPanel";
import TimeRecorder, {
  type TimeRecorderElapsedWorkInfo,
} from "@/features/attendance/time-recorder/ui/TimeRecorder";
import AdminPendingApprovalSummary from "@/widgets/layout/header/AdminPendingApprovalSummary";

type RegisterContentProps = {
  configId: string | null;
  announcement: TimeRecorderAnnouncement;
};

export default function RegisterContent({
  configId,
  announcement,
}: RegisterContentProps) {
  const [attendanceErrorCount, setAttendanceErrorCount] = useState(0);
  const [elapsedWorkInfo, setElapsedWorkInfo] =
    useState<TimeRecorderElapsedWorkInfo>({
      visible: false,
      workDurationLabel: "00:00",
      restDurationLabel: "00:00",
    });

  return (
    <div className="relative flex h-full flex-col overflow-x-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ecfdf5_52%,#f8fafc_100%)] py-3 md:py-10">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(15,168,94,0.18),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,rgba(15,23,42,0.08),transparent_65%)]" />
      <div className="relative mx-auto w-full max-w-[98rem] px-2 lg:px-4">
        <div className="lg:grid lg:grid-cols-[minmax(0,33rem)_minmax(30rem,38rem)] lg:justify-center lg:gap-6">
          <TimeRecorder
            onAttendanceErrorCountChange={setAttendanceErrorCount}
            onElapsedWorkTimeChange={setElapsedWorkInfo}
          />
          <aside
            data-testid="register-dashboard-slot"
            className="hidden lg:block lg:pt-4"
          >
            <div className="w-full space-y-4">
              <RegisterDashboardPanel
                configId={configId}
                announcement={announcement}
              />
              <AdminPendingApprovalSummary />
              <ElapsedDurationCards elapsedWorkInfo={elapsedWorkInfo} />
              <RegisterAttendanceSummaryCard
                attendanceErrorCount={attendanceErrorCount}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ElapsedDurationCards({
  elapsedWorkInfo,
}: {
  elapsedWorkInfo: TimeRecorderElapsedWorkInfo;
}) {
  if (!elapsedWorkInfo.visible) {
    return null;
  }

  return (
    <div
      data-testid="register-dashboard-elapsed-duration-cards"
      className="grid grid-cols-2 gap-4"
    >
      <section
        data-testid="register-dashboard-current-work-card"
        className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.35)]"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="m-0 text-xs font-semibold tracking-[0.03em] text-slate-700">
            現在の勤務時間
          </p>
          <Tooltip title="休憩時間を差し引いた勤務時間を表示します" arrow>
            <button
              type="button"
              data-testid="register-dashboard-current-work-info"
              aria-label="休憩時間を差し引いた勤務時間を表示します"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600"
            >
              i
            </button>
          </Tooltip>
        </div>
        <div className="mt-2 flex items-end justify-end">
          <p className="m-0 shrink-0 text-3xl font-extrabold leading-none tracking-[-0.03em] text-slate-950">
            {elapsedWorkInfo.workDurationLabel}
          </p>
        </div>
      </section>
      <section
        data-testid="register-dashboard-current-rest-card"
        className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.35)]"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="m-0 text-xs font-semibold tracking-[0.03em] text-slate-700">
            現在の休憩時間
          </p>
          <Tooltip title="休憩中のみカウントします" arrow>
            <button
              type="button"
              data-testid="register-dashboard-current-rest-info"
              aria-label="休憩中のみカウントします"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600"
            >
              i
            </button>
          </Tooltip>
        </div>
        <div className="mt-2 flex items-end justify-end">
          <p className="m-0 shrink-0 text-3xl font-extrabold leading-none tracking-[-0.03em] text-slate-950">
            {elapsedWorkInfo.restDurationLabel}
          </p>
        </div>
      </section>
    </div>
  );
}
