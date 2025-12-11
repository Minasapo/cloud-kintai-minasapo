import { Button, styled } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

const StyledClockInButton = styled(Button)(({ theme }) => ({
  color: theme.palette.clock_in.contrastText,
  backgroundColor: theme.palette.clock_in.main,
  border: `3px solid ${theme.palette.clock_in.main}`,
  width: 120,
  height: 120,
  borderRadius: 100,
  "&:hover": {
    color: theme.palette.clock_in.main,
    backgroundColor: theme.palette.clock_in.contrastText,
  },
  "&:disabled": {
    border: "3px solid #E0E0E0",
    backgroundColor: "#E0E0E0",
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
