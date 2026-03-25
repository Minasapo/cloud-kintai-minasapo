import DirectSwitch from "@/shared/ui/time-recorder/DirectSwitch";

export type DirectModeHeaderProps = {
  directMode: boolean;
  onDirectModeChange: (checked: boolean) => void;
};

export default function DirectModeHeader({
  directMode,
  onDirectModeChange,
}: DirectModeHeaderProps) {
  return (
    <div className="recorder-actions-card__header">
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
  );
}
