import { Button, styled } from "@mui/material";
import { useEffect, useState } from "react";

const StyledReturnDirectlyButton = styled(Button)(({ theme }) => ({
  color: theme.palette.clock_out.contrastText,
  backgroundColor: theme.palette.clock_out.main,
  border: `3px solid ${theme.palette.clock_out.main}`,
  width: 120,
  height: 120,
  borderRadius: 100,
  "&:hover": {
    color: theme.palette.clock_out.main,
    backgroundColor: theme.palette.clock_out.contrastText,
    border: `3px solid ${theme.palette.clock_out.main}`,
  },
  "&:disabled": {
    border: "3px solid #E0E0E0",
    backgroundColor: "#E0E0E0",
  },
}));

export interface ReturnDirectlyButtonProps {
  isWorking: boolean;
  onReturnDirectly: () => void;
}

const ReturnDirectlyButton = ({
  isWorking,
  onReturnDirectly,
}: ReturnDirectlyButtonProps) => {
  const [disabled, setDisabled] = useState(!isWorking);

  useEffect(() => {
    setDisabled(!isWorking);
  }, [isWorking]);

  return (
    <StyledReturnDirectlyButton
      data-testid="return-directly-button"
      onClick={() => {
        setDisabled(true);
        onReturnDirectly();
      }}
      disabled={disabled}
    >
      直帰
    </StyledReturnDirectlyButton>
  );
};

export default ReturnDirectlyButton;
