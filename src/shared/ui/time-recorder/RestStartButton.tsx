import { useCallback, useMemo, useState } from "react";

import { buildRestButtonVars,REST_BUTTON_CLASS_NAME } from "./buttonStyles";

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
  const [isPending, setIsPending] = useState(false);

  // Derived state: reset isPending when isWorking changes
  const actualIsPending = useMemo(() => {
    return isWorking ? false : isPending;
  }, [isWorking, isPending]);

  const handleClick = useCallback(() => {
    setIsPending(true);
    onRestStart();
  }, [onRestStart]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isWorking || actualIsPending || disabled}
      data-testid="rest-start-button"
      className={`${REST_BUTTON_CLASS_NAME} bg-transparent text-[color:var(--rest-button-color)] hover:border-[var(--rest-button-hover-border)] hover:bg-[var(--rest-button-hover-bg)] hover:text-[color:var(--rest-button-hover-text)]`}
      style={restButtonVars}
    >
      休憩開始
    </button>
  );
};

export default RestStartButton;
