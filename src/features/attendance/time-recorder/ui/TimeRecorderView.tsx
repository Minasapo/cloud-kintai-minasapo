import "./styles.scss";

import RecorderActionsCard from "./RecorderActionsCard";
import RecorderStatusCard from "./RecorderStatusCard";
import SupplementarySection from "./SupplementarySection";
import TimeElapsedErrorDialog from "./TimeElapsedErrorDialog";
import { useTimeRecorder } from "./TimeRecorderContext";

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

export function TimeRecorderView() {
  const {
    today,
    staffId,
    workStatus,
    hasChangeRequest,
    isAttendanceError,
    clockInDisplayText,
    clockOutDisplayText,
    isTimeElapsedError,
  } = useTimeRecorder();

  const hasSupplementaryInfo =
    hasChangeRequest || isAttendanceError || Boolean(staffId);

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

            <RecorderActionsCard />

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
