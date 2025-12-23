import { Button, styled } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

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

const StyledClockInButton = styled(Button)(({ theme }) => ({
  color: theme.palette.clock_in.contrastText,
  backgroundColor: theme.palette.clock_in.main,
  border: `${ACTION_BORDER_WIDTH} solid ${theme.palette.clock_in.main}`,
  width: ACTION_BUTTON_SIZE,
  height: ACTION_BUTTON_SIZE,
  borderRadius: ACTION_BUTTON_RADIUS,
  "&:hover": {
    color: theme.palette.clock_in.main,
    backgroundColor: theme.palette.clock_in.contrastText,
  },
  "&:disabled": {
    border: `${ACTION_BORDER_WIDTH} solid ${ACTION_DISABLED_BORDER}`,
    backgroundColor: ACTION_DISABLED_BACKGROUND,
  },
}));

export interface ClockInButtonProps {
  isBeforeWork: boolean;
  onClockIn: () => void;
}

const ClockInButton = ({ isBeforeWork, onClockIn }: ClockInButtonProps) => {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (isBeforeWork) {
      setClicked(false);
    }
  }, [isBeforeWork]);

  const handleClick = useCallback(() => {
    setClicked(true);
    onClockIn();
  }, [onClockIn]);

  return (
    <StyledClockInButton
      data-testid="clock-in-button"
      onClick={handleClick}
      disabled={!isBeforeWork || clicked}
    >
      勤務開始
    </StyledClockInButton>
  );
};

export default ClockInButton;
