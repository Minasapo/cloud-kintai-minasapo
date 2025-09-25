import { Button, styled } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { WorkStatus, WorkStatusCodes } from "../common";

const GoDirectlyButton = styled(Button)(({ theme }) => ({
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

interface GoDirectlyItemProps {
  workStatus: WorkStatus | null;
  onClick: () => void;
}

export default function GoDirectlyItem({
  workStatus,
  onClick,
}: GoDirectlyItemProps) {
  const [isPending, setIsPending] = useState(false);

  const isBeforeWork = useMemo(
    () => workStatus?.code === WorkStatusCodes.BEFORE_WORK,
    [workStatus]
  );
  const disabled = useMemo(
    () => !isBeforeWork || isPending,
    [isBeforeWork, isPending]
  );

  useEffect(() => {
    setIsPending(false);
  }, [isBeforeWork]);

  return (
    <GoDirectlyButton
      data-testid="go-directly-button"
      onClick={() => {
        setIsPending(true);
        onClick();
      }}
      disabled={disabled}
    >
      直行
    </GoDirectlyButton>
  );
}
