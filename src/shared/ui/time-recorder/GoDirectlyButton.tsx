import { useCallback } from "react";

import {
  ACTION_BUTTON_CLASS_NAME,
  buildActionButtonVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface GoDirectlyButtonProps {
  isBeforeWork: boolean;
  onGoDirectly: () => void;
  disabled?: boolean;
}

const GoDirectlyButton = ({
  isBeforeWork,
  onGoDirectly,
  disabled = false,
}: GoDirectlyButtonProps) => {
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

    onGoDirectly();
  }, [markPending, onGoDirectly]);

  return (
    <button
      type="button"
      data-testid="go-directly-button"
      onClick={handleClick}
      disabled={isDisabled}
      className={`${ACTION_BUTTON_CLASS_NAME} border-[var(--action-border)] bg-[var(--action-bg)] text-[color:var(--action-text)] hover:border-[var(--action-hover-border)] hover:bg-[var(--action-hover-bg)] hover:text-[color:var(--action-hover-text)]`}
      style={actionButtonVars}
    >
      直行
    </button>
  );
};

export default GoDirectlyButton;
