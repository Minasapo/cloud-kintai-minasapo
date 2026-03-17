import { useMemo, useState } from "react";

import {
  ACTION_BUTTON_CLASS_NAME,
  buildActionButtonVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";

export interface GoDirectlyButtonProps {
  isBeforeWork: boolean;
  onGoDirectly: () => void;
}

const GoDirectlyButton = ({
  isBeforeWork,
  onGoDirectly,
}: GoDirectlyButtonProps) => {
  const actionButtonVars = buildActionButtonVars(
    TIME_RECORDER_BUTTON_PALETTES.clockIn,
  );
  const [isPending, setIsPending] = useState(false);

  // Derived state: reset isPending when isBeforeWork changes
  const actualIsPending = useMemo(() => {
    return isBeforeWork ? false : isPending;
  }, [isBeforeWork, isPending]);

  return (
    <button
      type="button"
      data-testid="go-directly-button"
      onClick={() => {
        setIsPending(true);
        onGoDirectly();
      }}
      disabled={!isBeforeWork || actualIsPending}
      className={`${ACTION_BUTTON_CLASS_NAME} border-[var(--action-border)] bg-[var(--action-bg)] text-[color:var(--action-text)] hover:border-[var(--action-hover-border)] hover:bg-[var(--action-hover-bg)] hover:text-[color:var(--action-hover-text)]`}
      style={actionButtonVars}
    >
      直行
    </button>
  );
};

export default GoDirectlyButton;
