import { Button, styled } from "@mui/material";
import { useEffect, useState } from "react";

import { designTokenVar } from "@/shared/designSystem";

const ACTION_BUTTON_SIZE = designTokenVar(
  "component.timeRecorder.actionButton.size",
  "120px"
);
const ACTION_BUTTON_RADIUS = designTokenVar(
  "component.timeRecorder.actionButton.borderRadius",
  "999px"
);
const ACTION_BORDER_WIDTH = designTokenVar(
  "component.timeRecorder.actionButton.borderWidth",
  "3px"
);
const ACTION_DISABLED_BORDER = designTokenVar(
  "component.timeRecorder.actionButton.disabledBorderColor",
  "#C3CFC7"
);
const ACTION_DISABLED_BACKGROUND = designTokenVar(
  "component.timeRecorder.actionButton.disabledBackground",
  "#D9E2DD"
);

const StyledReturnDirectlyButton = styled(Button)(({ theme }) => ({
  color: theme.palette.clock_out.contrastText,
  backgroundColor: theme.palette.clock_out.main,
  border: `${ACTION_BORDER_WIDTH} solid ${theme.palette.clock_out.main}`,
  width: ACTION_BUTTON_SIZE,
  height: ACTION_BUTTON_SIZE,
  borderRadius: ACTION_BUTTON_RADIUS,
  "&:hover": {
    color: theme.palette.clock_out.main,
    backgroundColor: theme.palette.clock_out.contrastText,
    border: `${ACTION_BORDER_WIDTH} solid ${theme.palette.clock_out.main}`,
  },
  "&:disabled": {
    border: `${ACTION_BORDER_WIDTH} solid ${ACTION_DISABLED_BORDER}`,
    backgroundColor: ACTION_DISABLED_BACKGROUND,
  },
}));

export interface ReturnDirectlyButtonProps {
  isWorking: boolean;
  onReturnDirectly: () => void;
}

const ReturnDirectlyButton = ({
  isWorking,
  onReturnDirectly,
}: ReturnDirectlyButtonProps) => {
  const [disabled, setDisabled] = useState(!isWorking);

  useEffect(() => {
    setDisabled(!isWorking);
  }, [isWorking]);

  return (
    <StyledReturnDirectlyButton
      data-testid="return-directly-button"
      onClick={() => {
        setDisabled(true);
        onReturnDirectly();
      }}
      disabled={disabled}
    >
      直帰
    </StyledReturnDirectlyButton>
  );
};

export default ReturnDirectlyButton;
