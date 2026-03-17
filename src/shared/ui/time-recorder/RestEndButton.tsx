import { useCallback, useMemo, useState } from "react";

import { buildRestButtonVars,REST_BUTTON_CLASS_NAME } from "./buttonStyles";

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
  const [isProcessing, setIsProcessing] = useState(false);

  // Derived state: reset isProcessing when isResting changes
  const actualIsProcessing = useMemo(() => {
    return isResting ? false : isProcessing;
  }, [isResting, isProcessing]);

  const handleClick = useCallback(() => {
    setIsProcessing(true);
    onRestEnd();
  }, [onRestEnd]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isResting || actualIsProcessing || disabled}
      data-testid="rest-end-button"
      className={`${REST_BUTTON_CLASS_NAME} bg-transparent text-[color:var(--rest-button-color)] hover:border-[var(--rest-button-hover-border)] hover:bg-[var(--rest-button-hover-bg)] hover:text-[color:var(--rest-button-hover-text)]`}
      style={restButtonVars}
    >
      休憩終了
    </button>
  );
};

export default RestEndButton;
