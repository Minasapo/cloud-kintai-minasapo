import { useCallback } from "react";

import ActionCardButton from "./ActionCardButton";
import {
  buildActionCardVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface ClockOutButtonProps {
  isWorking: boolean;
  onClockOut: () => void;
  disabled?: boolean;
}

function ClockOutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none">
      <path
        d="M10 4h6.5A1.5 1.5 0 0 1 18 5.5v13a1.5 1.5 0 0 1-1.5 1.5H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 12H6M9 8l-4 4 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ClockOutButton = ({
  isWorking,
  onClockOut,
  disabled = false,
}: ClockOutButtonProps) => {
  const actionButtonVars = buildActionCardVars(
    TIME_RECORDER_BUTTON_PALETTES.clockOut,
  );
  const { isDisabled, markPending } = useActionButtonState({
    canInteract: isWorking,
    disabled,
  });

  const handleClick = useCallback(() => {
    if (!markPending()) {
      return;
    }

    onClockOut();
  }, [markPending, onClockOut]);

  return (
    <ActionCardButton
      testId="clock-out-button"
      style={actionButtonVars}
      disabled={isDisabled}
      onClick={handleClick}
      label={"勤務\n終了"}
      helper={null}
      icon={<ClockOutIcon />}
    />
  );
};

export default ClockOutButton;
