import { Button, styled } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import { WorkStatus, WorkStatusCodes } from "../common";

const ClockInButton = styled(Button)(({ theme }) => ({
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

type ClockInItemProps = {
  workStatus: WorkStatus;
  onClick: () => void;
};

export default function ClockInItem({ workStatus, onClick }: ClockInItemProps) {
  const isBeforeWork = useMemo(
    () => workStatus.code === WorkStatusCodes.BEFORE_WORK,
    [workStatus.code]
  );
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (isBeforeWork) {
      setClicked(false);
    }
  }, [isBeforeWork]);

  const handleClick = useCallback(() => {
    setClicked(true);
    onClick();
  }, [onClick]);

  return (
    <ClockInButton
      data-testid="clock-in-button"
      onClick={handleClick}
      disabled={!isBeforeWork || clicked}
    >
      勤務開始
    </ClockInButton>
  );
}
