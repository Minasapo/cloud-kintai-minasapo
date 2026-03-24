import { useCallback } from "react";

import ActionCardButton from "./ActionCardButton";
import {
  buildActionCardVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface ReturnDirectlyButtonProps {
  isWorking: boolean;
  onReturnDirectly: () => void;
  disabled?: boolean;
}

function ReturnDirectlyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none">
      <path
        d="M19 12H9M13 6l-6 6 6 6M19 6v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ReturnDirectlyButton = ({
  isWorking,
  onReturnDirectly,
  disabled = false,
}: ReturnDirectlyButtonProps) => {
  const actionButtonVars = buildActionCardVars(
    TIME_RECORDER_BUTTON_PALETTES.subtleDanger,
  );
  const { isDisabled, runWithPending } = useActionButtonState({
    canInteract: isWorking,
    disabled,
  });
  const handleClick = useCallback(() => {
    runWithPending(onReturnDirectly);
  }, [onReturnDirectly, runWithPending]);

  return (
    <ActionCardButton
      testId="return-directly-button"
      style={actionButtonVars}
      disabled={isDisabled}
      onClick={handleClick}
      label="直帰"
      helper={null}
      icon={<ReturnDirectlyIcon />}
    />
  );
};

export default ReturnDirectlyButton;
