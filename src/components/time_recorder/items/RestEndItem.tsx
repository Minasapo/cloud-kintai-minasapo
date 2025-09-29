import { Button, styled } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import { WorkStatus, WorkStatusCodes } from "../common";

const RestEndButton = styled(Button)(({ theme }) => ({
  color: theme.palette.rest.main,
  "&:hover": {
    color: theme.palette.rest.contrastText,
    backgroundColor: theme.palette.rest.main,
  },
  "&:disabled": {
    backgroundColor: "#E0E0E0",
  },
}));

export default function RestEndItem({
  workStatus,
  onClick,
}: {
  workStatus: WorkStatus | null;
  onClick: () => void;
}) {
  const isResting = useMemo(
    () => workStatus?.code === WorkStatusCodes.RESTING,
    [workStatus]
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsProcessing(false);
  }, [isResting]);

  const handleClick = useCallback(() => {
    setIsProcessing(true);
    onClick();
  }, [onClick]);

  return (
    <RestEndButton
      fullWidth
      onClick={handleClick}
      disabled={!isResting || isProcessing}
      data-testid="rest-end-button"
    >
      休憩終了
    </RestEndButton>
  );
}
