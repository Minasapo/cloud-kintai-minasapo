import { Button, styled } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import { WorkStatus, WorkStatusCodes } from "../common";

const RestStartButton = styled(Button)(({ theme }) => ({
  color: theme.palette.rest.main,
  "&:hover": {
    color: theme.palette.rest.contrastText,
    backgroundColor: theme.palette.rest.main,
  },
  "&:disabled": {
    backgroundColor: "#E0E0E0",
  },
}));

type RestStartItemProps = {
  workStatus: WorkStatus | null;
  onClick: () => void;
};

export default function RestStartItem({
  workStatus,
  onClick,
}: RestStartItemProps) {
  const isWorking = useMemo(
    () => workStatus?.code === WorkStatusCodes.WORKING,
    [workStatus?.code]
  );
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (isWorking) {
      setIsPending(false);
    }
  }, [isWorking]);

  const handleClick = useCallback(() => {
    setIsPending(true);
    onClick();
  }, [onClick]);

  return (
    <RestStartButton
      fullWidth
      onClick={handleClick}
      disabled={!isWorking || isPending}
      data-testid="rest-start-button"
    >
      休憩開始
    </RestStartButton>
  );
}
