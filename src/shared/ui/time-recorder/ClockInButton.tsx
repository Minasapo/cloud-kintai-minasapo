import { useCallback } from "react";

import {
  ACTION_BUTTON_CLASS_NAME,
  ACTION_BUTTON_LABEL_CLASS_NAME,
  buildActionButtonVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface ClockInButtonProps {
  isBeforeWork: boolean;
  onClockIn: () => void;
  disabled?: boolean;
}

const ClockInButton = ({
  isBeforeWork,
  onClockIn,
  disabled = false,
}: ClockInButtonProps) => {
  const actionButtonVars = buildActionButtonVars(
    TIME_RECORDER_BUTTON_PALETTES.clockIn,
  );
  const { isDisabled, markPending } = useActionButtonState({
    canInteract: isBeforeWork,
    disabled,
  });

  const handleClick = useCallback(() => {
    if (!markPending()) {
      return;
    }

    onClockIn();
  }, [markPending, onClockIn]);

  return (
    <button
      type="button"
      data-testid="clock-in-button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`${ACTION_BUTTON_CLASS_NAME} border-[var(--action-border)] bg-[var(--action-bg)] text-[color:var(--action-text)] hover:border-[var(--action-hover-border)] hover:bg-[var(--action-hover-bg)] hover:text-[color:var(--action-hover-text)]`}
      style={actionButtonVars}
    >
      <span className={ACTION_BUTTON_LABEL_CLASS_NAME}>{"勤務\n開始"}</span>
    </button>
  );
};

export default ClockInButton;
