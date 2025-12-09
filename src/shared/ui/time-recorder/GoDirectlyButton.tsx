import { Button, styled } from "@mui/material";
import { useEffect, useState } from "react";

const StyledGoDirectlyButton = styled(Button)(({ theme }) => ({
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

export interface GoDirectlyButtonProps {
  isBeforeWork: boolean;
  onGoDirectly: () => void;
}

const GoDirectlyButton = ({
  isBeforeWork,
  onGoDirectly,
}: GoDirectlyButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(false);
  }, [isBeforeWork]);

  return (
    <StyledGoDirectlyButton
      data-testid="go-directly-button"
      onClick={() => {
        setIsPending(true);
        onGoDirectly();
      }}
      disabled={!isBeforeWork || isPending}
    >
      直行
    </StyledGoDirectlyButton>
  );
};

export default GoDirectlyButton;
