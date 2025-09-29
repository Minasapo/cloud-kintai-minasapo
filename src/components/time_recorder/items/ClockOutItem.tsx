import { Button, styled } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import { WorkStatus, WorkStatusCodes } from "../common";

const ClockOutButton = styled(Button)(({ theme }) => ({
  color: theme.palette.clock_out.contrastText,
  backgroundColor: theme.palette.clock_out.main,
  border: `3px solid ${theme.palette.clock_out.main}`,
  width: 120,
  height: 120,
  borderRadius: 100,
  "&:hover": {
    color: theme.palette.clock_out.main,
    backgroundColor: theme.palette.clock_out.contrastText,
    border: `3px solid ${theme.palette.clock_out.main}`,
  },
  "&:disabled": {
    border: "3px solid #E0E0E0",
    backgroundColor: "#E0E0E0",
  },
}));

type ClockOutItemProps = {
  workStatus: WorkStatus | null;
  onClick: () => void;
};

export default function ClockOutItem({
  workStatus,
  onClick,
}: ClockOutItemProps) {
  const isWorking = useMemo(
    () => workStatus?.code === WorkStatusCodes.WORKING,
    [workStatus]
  );
  const [isDisabled, setIsDisabled] = useState(!isWorking);

  useEffect(() => {
    setIsDisabled(!isWorking);
  }, [isWorking]);

  const handleClick = useCallback(() => {
    if (isDisabled) return;

    setIsDisabled(true);
    onClick();
  }, [isDisabled, onClick]);

  return (
    <ClockOutButton
      data-testid="clock-out-button"
      disabled={isDisabled}
      onClick={handleClick}
      size="large"
      variant={isWorking ? "outlined" : "contained"}
    >
      勤務終了
    </ClockOutButton>
  );
}
