import { useCallback } from "react";

import ActionCardButton from "./ActionCardButton";
import {
  buildActionCardVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface RestStartButtonProps {
  isWorking: boolean;
  onRestStart: () => void;
  disabled?: boolean;
}

function RestStartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none">
      <path
        d="M12 7v5l3 3M20 12a8 8 0 1 1-8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const RestStartButton = ({
  isWorking,
  onRestStart,
  disabled = false,
}: RestStartButtonProps) => {
  const restButtonVars = buildActionCardVars(
    TIME_RECORDER_BUTTON_PALETTES.rest,
  );
  const { isDisabled, markPending } = useActionButtonState({
    canInteract: isWorking,
    disabled,
  });

  const handleClick = useCallback(() => {
    if (!markPending()) {
      return;
    }

    onRestStart();
  }, [markPending, onRestStart]);

  return (
    <ActionCardButton
      testId="rest-start-button"
      style={restButtonVars}
      size="compact"
      disabled={isDisabled}
      onClick={handleClick}
      label="休憩開始"
      helper={null}
      icon={<RestStartIcon />}
    />
  );
};

export default RestStartButton;
