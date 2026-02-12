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

const StyledRestEndButton = styled(Button)(({ theme }) => ({
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

export interface RestEndButtonProps {
  isResting: boolean;
  onRestEnd: () => void;
  disabled?: boolean;
}

const RestEndButton = ({
  isResting,
  onRestEnd,
  disabled = false,
}: RestEndButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Derived state: reset isProcessing when isResting changes
  const actualIsProcessing = useMemo(() => {
    return isResting ? false : isProcessing;
  }, [isResting, isProcessing]);

  const handleClick = useCallback(() => {
    setIsProcessing(true);
    onRestEnd();
  }, [onRestEnd]);

  return (
    <StyledRestEndButton
      fullWidth
      onClick={handleClick}
      disabled={!isResting || actualIsProcessing || disabled}
      data-testid="rest-end-button"
    >
      休憩終了
    </StyledRestEndButton>
  );
};

export default RestEndButton;
