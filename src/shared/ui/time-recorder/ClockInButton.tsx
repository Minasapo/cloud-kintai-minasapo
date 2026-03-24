import { useCallback } from "react";

import ActionCardButton from "./ActionCardButton";
import {
  buildActionCardVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface ClockInButtonProps {
  isBeforeWork: boolean;
  onClockIn: () => void;
  disabled?: boolean;
}

function ClockInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none">
      <path
        d="M14 4H7.5A1.5 1.5 0 0 0 6 5.5v13A1.5 1.5 0 0 0 7.5 20H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12h8M15 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ClockInButton = ({
  isBeforeWork,
  onClockIn,
  disabled = false,
}: ClockInButtonProps) => {
  const actionButtonVars = buildActionCardVars(
    TIME_RECORDER_BUTTON_PALETTES.clockIn,
  );
  const { isDisabled, runWithPending } = useActionButtonState({
    canInteract: isBeforeWork,
    disabled,
  });

  const handleClick = useCallback(() => {
    runWithPending(onClockIn);
  }, [onClockIn, runWithPending]);

  return (
    <ActionCardButton
      testId="clock-in-button"
      style={actionButtonVars}
      disabled={isDisabled}
      onClick={handleClick}
      label={"勤務\n開始"}
      helper={null}
      icon={<ClockInIcon />}
    />
  );
};

export default ClockInButton;
