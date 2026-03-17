import { useMemo, useState } from "react";

import {
  ACTION_BUTTON_CLASS_NAME,
  buildActionButtonVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";

export interface ReturnDirectlyButtonProps {
  isWorking: boolean;
  onReturnDirectly: () => void;
}

const ReturnDirectlyButton = ({
  isWorking,
  onReturnDirectly,
}: ReturnDirectlyButtonProps) => {
  const actionButtonVars = buildActionButtonVars(
    TIME_RECORDER_BUTTON_PALETTES.clockOut,
  );
  const [isClicking, setIsClicking] = useState(false);

  // Derived state: button is disabled when not working or user clicked
  const disabled = useMemo(() => {
    return !isWorking || isClicking;
  }, [isWorking, isClicking]);

  return (
    <button
      type="button"
      data-testid="return-directly-button"
      onClick={() => {
        setIsClicking(true);
        onReturnDirectly();
      }}
      disabled={disabled}
      className={`${ACTION_BUTTON_CLASS_NAME} border-[var(--action-border)] bg-[var(--action-bg)] text-[color:var(--action-text)] hover:border-[var(--action-hover-border)] hover:bg-[var(--action-hover-bg)] hover:text-[color:var(--action-hover-text)]`}
      style={actionButtonVars}
    >
      直帰
    </button>
  );
};

export default ReturnDirectlyButton;
