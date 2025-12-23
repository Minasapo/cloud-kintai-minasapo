import { Button, styled } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { designTokenVar } from "@/shared/designSystem";

const REST_DISABLED_BACKGROUND = designTokenVar(
  "component.timeRecorder.restButton.disabledBackground",
  "#D9E2DD"
);

const StyledRestStartButton = styled(Button)(({ theme }) => ({
  color: theme.palette.rest.main,
  "&:hover": {
    color: theme.palette.rest.contrastText,
    backgroundColor: theme.palette.rest.main,
  },
  "&:disabled": {
    backgroundColor: REST_DISABLED_BACKGROUND,
  },
}));

export interface RestStartButtonProps {
  isWorking: boolean;
  onRestStart: () => void;
}

const RestStartButton = ({ isWorking, onRestStart }: RestStartButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (isWorking) {
      setIsPending(false);
    }
  }, [isWorking]);

  const handleClick = useCallback(() => {
    setIsPending(true);
    onRestStart();
  }, [onRestStart]);

  return (
    <StyledRestStartButton
      fullWidth
      onClick={handleClick}
      disabled={!isWorking || isPending}
      data-testid="rest-start-button"
    >
      休憩開始
    </StyledRestStartButton>
  );
};

export default RestStartButton;
