import { useCallback } from "react";

import ActionCardButton from "./ActionCardButton";
import {
  buildActionCardVars,
  TIME_RECORDER_BUTTON_PALETTES,
} from "./buttonStyles";
import { useActionButtonState } from "./useActionButtonState";

export interface GoDirectlyButtonProps {
  isBeforeWork: boolean;
  onGoDirectly: () => void;
  disabled?: boolean;
}

function GoDirectlyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none">
      <path
        d="M5 12h10M11 6l6 6-6 6M5 6v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const GoDirectlyButton = ({
  isBeforeWork,
  onGoDirectly,
  disabled = false,
}: GoDirectlyButtonProps) => {
  const actionButtonVars = buildActionCardVars(
    TIME_RECORDER_BUTTON_PALETTES.subtle,
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
    <ActionCardButton
      testId="go-directly-button"
      style={actionButtonVars}
      disabled={isDisabled}
      onClick={handleClick}
      label="直行"
      helper={null}
      icon={<GoDirectlyIcon />}
    />
  );
};

export default GoDirectlyButton;
