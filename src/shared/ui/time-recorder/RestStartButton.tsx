import { Button, styled } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

const StyledRestStartButton = styled(Button)(({ theme }) => ({
  color: theme.palette.rest.main,
  "&:hover": {
    color: theme.palette.rest.contrastText,
    backgroundColor: theme.palette.rest.main,
  },
  "&:disabled": {
    backgroundColor: "#E0E0E0",
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
