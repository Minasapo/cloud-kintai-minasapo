import { useCallback } from "react";

import {
  ACTION_BUTTON_CLASS_NAME,
  buildActionButtonVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface ReturnDirectlyButtonProps {
  isWorking: boolean;
  onReturnDirectly: () => void;
  disabled?: boolean;
}

const ReturnDirectlyButton = ({
  isWorking,
  onReturnDirectly,
  disabled = false,
}: ReturnDirectlyButtonProps) => {
  const actionButtonVars = buildActionButtonVars(
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

    onReturnDirectly();
  }, [markPending, onReturnDirectly]);

  return (
    <button
      type="button"
      data-testid="return-directly-button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`${ACTION_BUTTON_CLASS_NAME} border-[var(--action-border)] bg-[var(--action-bg)] text-[color:var(--action-text)] hover:border-[var(--action-hover-border)] hover:bg-[var(--action-hover-bg)] hover:text-[color:var(--action-hover-text)]`}
      style={actionButtonVars}
    >
      直帰
    </button>
  );
};

export default ReturnDirectlyButton;
