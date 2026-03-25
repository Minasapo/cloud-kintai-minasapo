import DirectModeHeader from "./DirectModeHeader";
import RecorderActionButtons from "./RecorderActionButtons";

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
      <DirectModeHeader
        directMode={directMode}
        onDirectModeChange={onDirectModeChange}
      />

      <RecorderActionButtons
        directMode={directMode}
        hasChangeRequest={hasChangeRequest}
        isBeforeWork={isBeforeWork}
        isWorking={isWorking}
        isResting={isResting}
        onClockIn={onClockIn}
        onClockOut={onClockOut}
        onGoDirectly={onGoDirectly}
        onReturnDirectly={onReturnDirectly}
        onRestStart={onRestStart}
        onRestEnd={onRestEnd}
      />
    </section>
  );
}
