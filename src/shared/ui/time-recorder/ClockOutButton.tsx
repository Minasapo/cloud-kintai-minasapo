import { useCallback, useMemo, useState } from "react";

import {
  ACTION_BUTTON_CLASS_NAME,
  ACTION_BUTTON_LABEL_CLASS_NAME,
  buildActionButtonVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";

export interface ClockOutButtonProps {
  isWorking: boolean;
  onClockOut: () => void;
  disabled?: boolean;
}

const ClockOutButton = ({
  isWorking,
  onClockOut,
  disabled = false,
}: ClockOutButtonProps) => {
  const actionButtonVars = buildActionButtonVars(
    TIME_RECORDER_BUTTON_PALETTES.clockOut,
  );
  const [isClicked, setIsClicked] = useState(false);

  // Derived state: button is disabled when not working or user clicked
  const isDisabled = useMemo(() => {
    return !isWorking || isClicked || disabled;
  }, [isWorking, isClicked, disabled]);

  const handleClick = useCallback(() => {
    if (isDisabled) return;

    setIsClicked(true);
    onClockOut();
  }, [isDisabled, onClockOut]);

  return (
    <button
      type="button"
      data-testid="clock-out-button"
      disabled={isDisabled}
      onClick={handleClick}
      className={`${ACTION_BUTTON_CLASS_NAME} border-[var(--action-border)] bg-[var(--action-bg)] text-[color:var(--action-text)] hover:border-[var(--action-hover-border)] hover:bg-[var(--action-hover-bg)] hover:text-[color:var(--action-hover-text)]`}
      style={actionButtonVars}
    >
      <span className={ACTION_BUTTON_LABEL_CLASS_NAME}>{"勤務\n終了"}</span>
    </button>
  );
};

export default ClockOutButton;
