import { useCallback } from "react";

import { buildRestButtonVars, REST_BUTTON_CLASS_NAME } from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface RestStartButtonProps {
  isWorking: boolean;
  onRestStart: () => void;
  disabled?: boolean;
}

const RestStartButton = ({
  isWorking,
  onRestStart,
  disabled = false,
}: RestStartButtonProps) => {
  const restButtonVars = buildRestButtonVars();
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
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      data-testid="rest-start-button"
      className={`${REST_BUTTON_CLASS_NAME} bg-transparent text-[color:var(--rest-button-color)] hover:border-[var(--rest-button-hover-border)] hover:bg-[var(--rest-button-hover-bg)] hover:text-[color:var(--rest-button-hover-text)]`}
      style={restButtonVars}
    >
      休憩開始
    </button>
  );
};

export default RestStartButton;
