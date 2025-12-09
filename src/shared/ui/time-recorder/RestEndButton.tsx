import { Button, styled } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

const StyledRestEndButton = styled(Button)(({ theme }) => ({
  color: theme.palette.rest.main,
  "&:hover": {
    color: theme.palette.rest.contrastText,
    backgroundColor: theme.palette.rest.main,
  },
  "&:disabled": {
    backgroundColor: "#E0E0E0",
  },
}));

export interface RestEndButtonProps {
  isResting: boolean;
  onRestEnd: () => void;
}

const RestEndButton = ({ isResting, onRestEnd }: RestEndButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsProcessing(false);
  }, [isResting]);

  const handleClick = useCallback(() => {
    setIsProcessing(true);
    onRestEnd();
  }, [onRestEnd]);

  return (
    <StyledRestEndButton
      fullWidth
      onClick={handleClick}
      disabled={!isResting || isProcessing}
      data-testid="rest-end-button"
    >
      休憩終了
    </StyledRestEndButton>
  );
};

export default RestEndButton;
