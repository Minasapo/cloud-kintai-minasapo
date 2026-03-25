import ClockInButton from "@/shared/ui/time-recorder/ClockInButton";
import ClockOutButton from "@/shared/ui/time-recorder/ClockOutButton";
import GoDirectlyButton from "@/shared/ui/time-recorder/GoDirectlyButton";
import RestEndButton from "@/shared/ui/time-recorder/RestEndButton";
import RestStartButton from "@/shared/ui/time-recorder/RestStartButton";
import ReturnDirectlyButton from "@/shared/ui/time-recorder/ReturnDirectlyButton";

export type RecorderActionButtonsProps = {
  directMode: boolean;
  hasChangeRequest: boolean;
  isBeforeWork: boolean;
  isWorking: boolean;
  isResting: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
  onGoDirectly: () => void;
  onReturnDirectly: () => void;
  onRestStart: () => void;
  onRestEnd: () => void;
};

export default function RecorderActionButtons({
  directMode,
  hasChangeRequest,
  isBeforeWork,
  isWorking,
  isResting,
  onClockIn,
  onClockOut,
  onGoDirectly,
  onReturnDirectly,
  onRestStart,
  onRestEnd,
}: RecorderActionButtonsProps) {
  return (
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
  );
}
