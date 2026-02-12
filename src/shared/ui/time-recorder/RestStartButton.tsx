import { Button, styled } from "@mui/material";
import { useCallback, useMemo, useState } from "react";

import { designTokenVar } from "@/shared/designSystem";

const REST_DISABLED_BACKGROUND = designTokenVar(
  "component.timeRecorder.restButton.disabledBackground",
  "#D9E2DD"
);
const REST_BUTTON_MAX_WIDTH = designTokenVar(
  "component.timeRecorder.restButton.maxWidth",
  "220px"
);

const StyledRestStartButton = styled(Button)(({ theme }) => ({
  color: theme.palette.rest.main,
  width: "100%",
  maxWidth: REST_BUTTON_MAX_WIDTH,
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
  disabled?: boolean;
}

const RestStartButton = ({
  isWorking,
  onRestStart,
  disabled = false,
}: RestStartButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  // Derived state: reset isPending when isWorking changes
  const actualIsPending = useMemo(() => {
    return isWorking ? false : isPending;
  }, [isWorking, isPending]);

  const handleClick = useCallback(() => {
    setIsPending(true);
    onRestStart();
  }, [onRestStart]);

  return (
    <StyledRestStartButton
      fullWidth
      onClick={handleClick}
      disabled={!isWorking || actualIsPending || disabled}
      data-testid="rest-start-button"
    >
      休憩開始
    </StyledRestStartButton>
  );
};

export default RestStartButton;
