import ClockInButton from "@/shared/ui/time-recorder/ClockInButton";
import ClockOutButton from "@/shared/ui/time-recorder/ClockOutButton";
import DirectSwitch from "@/shared/ui/time-recorder/DirectSwitch";
import GoDirectlyButton from "@/shared/ui/time-recorder/GoDirectlyButton";
import RestEndButton from "@/shared/ui/time-recorder/RestEndButton";
import RestStartButton from "@/shared/ui/time-recorder/RestStartButton";
import ReturnDirectlyButton from "@/shared/ui/time-recorder/ReturnDirectlyButton";

type RecorderActionsCardProps = {
  directMode: boolean;
  hasChangeRequest: boolean;
  isBeforeWork: boolean;
  isWorking: boolean;
  isResting: boolean;
  onDirectModeChange: (checked: boolean) => void;
  onClockIn: () => void;
  onClockOut: () => void;
  onGoDirectly: () => void;
  onReturnDirectly: () => void;
  onRestStart: () => void;
  onRestEnd: () => void;
};

function HelpTooltip({ message }: { message: string }) {
  return (
    <span className="recorder-actions-card__tooltip-wrap">
      <button
        type="button"
        aria-label={message}
        className="recorder-actions-card__tooltip-trigger"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="recorder-actions-card__tooltip-icon"
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
        <span className="recorder-actions-card__tooltip">
          {message}
        </span>
      </button>
    </span>
  );
}

export default function RecorderActionsCard({
  directMode,
  hasChangeRequest,
  isBeforeWork,
  isWorking,
  isResting,
  onDirectModeChange,
  onClockIn,
  onClockOut,
  onGoDirectly,
  onReturnDirectly,
  onRestStart,
  onRestEnd,
}: RecorderActionsCardProps) {
  return (
    <section className="recorder-actions-card">
      <div className="recorder-actions-card__header">
        <div className="recorder-actions-card__header-row">
          <div className="recorder-actions-card__title-row">
            <p className="recorder-actions-card__title">
              直行 / 直帰
            </p>
            <HelpTooltip message="直行や直帰の日だけ切り替えると、対応する打刻ボタンに切り替わります。" />
          </div>
          <label className="recorder-actions-card__switch-label">
            <DirectSwitch
              checked={directMode}
              onChange={(event) => onDirectModeChange(event.target.checked)}
              data-testid="direct-mode-switch"
            />
            <span className="recorder-actions-card__switch-text">
              直行/直帰モードを使う
            </span>
          </label>
        </div>
      </div>

      <div className="recorder-actions-card__actions">
        <div className="recorder-actions-card__action">
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
        <div className="recorder-actions-card__action">
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
        <div className="recorder-actions-card__action">
          <RestStartButton
            key={String(isWorking)}
            isWorking={isWorking}
            onRestStart={onRestStart}
            disabled={hasChangeRequest}
          />
        </div>
        <div className="recorder-actions-card__action">
          <RestEndButton
            key={String(isResting)}
            isResting={isResting}
            onRestEnd={onRestEnd}
            disabled={hasChangeRequest}
          />
        </div>
      </div>
    </section>
  );
}
