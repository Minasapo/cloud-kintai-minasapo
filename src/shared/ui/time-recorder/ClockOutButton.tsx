import { Button, styled, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useMemo, useState } from "react";

import { designTokenVar } from "@/shared/designSystem";

const ACTION_BUTTON_SIZE = designTokenVar(
  "component.timeRecorder.actionButton.size",
  "120px"
);
const ACTION_BUTTON_SIZE_SM = designTokenVar(
  "component.timeRecorder.actionButton.sizeSm",
  "96px"
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

const StyledClockOutButton = styled(Button)(({ theme }) => ({
  color: theme.palette.clock_out.contrastText,
  backgroundColor: theme.palette.clock_out.main,
  border: `${ACTION_BORDER_WIDTH} solid ${theme.palette.clock_out.main}`,
  width: ACTION_BUTTON_SIZE,
  height: ACTION_BUTTON_SIZE,
  borderRadius: ACTION_BUTTON_RADIUS,
  [theme.breakpoints.down("sm")]: {
    width: ACTION_BUTTON_SIZE_SM,
    height: ACTION_BUTTON_SIZE_SM,
    fontSize: "0.95rem",
  },
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

export interface ClockOutButtonProps {
  isWorking: boolean;
  onClockOut: () => void;
  disabled?: boolean;
}

const ClockOutButton = ({
  isWorking,
  onClockOut,
  disabled = false,
}: ClockOutButtonProps) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [isClicked, setIsClicked] = useState(false);

  // Derived state: button is disabled when not working or user clicked
  const isDisabled = useMemo(() => {
    return !isWorking || isClicked || disabled;
  }, [isWorking, isClicked, disabled]);

  const handleClick = useCallback(() => {
    if (isDisabled) return;

    setIsClicked(true);
    onClockOut();
  }, [isDisabled, onClockOut]);

  return (
    <StyledClockOutButton
      data-testid="clock-out-button"
      disabled={isDisabled}
      onClick={handleClick}
      size="large"
      variant={isWorking ? "outlined" : "contained"}
      className={isSmallScreen ? "whitespace-pre-line leading-[1.2]" : undefined}
    >
      {isSmallScreen ? "勤務\n終了" : "勤務終了"}
    </StyledClockOutButton>
  );
};

export default ClockOutButton;
