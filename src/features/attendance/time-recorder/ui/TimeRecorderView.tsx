import { type WorkStatus, WorkStatusCodes } from "../lib/common";
import RecorderActionsCard from "./RecorderActionsCard";
import RecorderStatusCard from "./RecorderStatusCard";
import SupplementarySection from "./SupplementarySection";
import TimeElapsedErrorDialog from "./TimeElapsedErrorDialog";

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
  isTimeElapsedError: boolean;
};

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
  isTimeElapsedError,
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
            <RecorderStatusCard
              workStatusText={workStatus.text || "読み込み中..."}
              clockInDisplayText={clockInDisplayText}
              clockOutDisplayText={clockOutDisplayText}
            />

            <RecorderActionsCard
              directMode={directMode}
              hasChangeRequest={hasChangeRequest}
              isBeforeWork={isBeforeWork}
              isWorking={isWorking}
              isResting={isResting}
              onDirectModeChange={onDirectModeChange}
              onClockIn={onClockIn}
              onClockOut={onClockOut}
              onGoDirectly={onGoDirectly}
              onReturnDirectly={onReturnDirectly}
              onRestStart={onRestStart}
              onRestEnd={onRestEnd}
            />

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

            <SupplementarySection
              hasSupplementaryInfo={hasSupplementaryInfo}
              staffId={staffId}
              today={today}
            />
          </section>
        </div>
      </div>
      <TimeElapsedErrorDialog isTimeElapsedError={isTimeElapsedError} />
    </div>
  );
}
