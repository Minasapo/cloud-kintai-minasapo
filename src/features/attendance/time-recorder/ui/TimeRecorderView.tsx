import "./styles.scss";

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
    <div className="time-recorder-loading">
      <div className="time-recorder-loading__surface">
        <div className="time-recorder-loading__header" />
        <div className="time-recorder-loading__grid">
          <div className="time-recorder-loading__left">
            <div className="time-recorder-loading__line" />
            <div className="time-recorder-loading__clock" />
            <div className="time-recorder-loading__summary" />
          </div>
          <div className="time-recorder-loading__cards">
            <div className="time-recorder-loading__card" />
            <div className="time-recorder-loading__card" />
            <div className="time-recorder-loading__card" />
            <div className="time-recorder-loading__card" />
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
    <div className="time-recorder-view">
      <div className="time-recorder-view__surface">
        <div className="time-recorder-view__backdrop" />
        <div className="time-recorder-view__body">
          <section className="time-recorder-view__content">
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
                className="time-recorder-view__change-request"
              >
                <p className="time-recorder-view__change-request-text">
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
