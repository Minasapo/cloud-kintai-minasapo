import { useCallback } from "react";

import { buildRestButtonVars, REST_BUTTON_CLASS_NAME } from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface RestEndButtonProps {
  isResting: boolean;
  onRestEnd: () => void;
  disabled?: boolean;
}

const RestEndButton = ({
  isResting,
  onRestEnd,
  disabled = false,
}: RestEndButtonProps) => {
  const restButtonVars = buildRestButtonVars();
  const { isDisabled, markPending } = useActionButtonState({
    canInteract: isResting,
    disabled,
  });

  const handleClick = useCallback(() => {
    if (!markPending()) {
      return;
    }

    onRestEnd();
  }, [markPending, onRestEnd]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      data-testid="rest-end-button"
      className={`${REST_BUTTON_CLASS_NAME} bg-transparent text-[color:var(--rest-button-color)] hover:border-[var(--rest-button-hover-border)] hover:bg-[var(--rest-button-hover-bg)] hover:text-[color:var(--rest-button-hover-text)]`}
      style={restButtonVars}
    >
      休憩終了
    </button>
  );
};

export default RestEndButton;
