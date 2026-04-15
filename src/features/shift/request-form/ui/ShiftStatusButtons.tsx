import { Button, ButtonGroup } from "@mui/material";

import { ShiftRequestDayStatus } from "../model/statusMapping";
import { STATUS_COLOR_MAP, STATUS_LABEL_MAP } from "./constants";

type ShiftStatusButtonsProps = {
  selected?: ShiftRequestDayStatus;
  disabled: boolean;
  isMobile: boolean;
  onSelect: (status: ShiftRequestDayStatus) => void;
};

export function ShiftStatusButtons({
  selected,
  disabled,
  isMobile,
  onSelect,
}: ShiftStatusButtonsProps) {
  return (
    <ButtonGroup
      size="small"
      variant="outlined"
      sx={{ flexWrap: isMobile ? "wrap" : "nowrap" }}
    >
      {(
        ["work", "fixedOff", "requestedOff", "auto"] as ShiftRequestDayStatus[]
      ).map((status) => (
        <Button
          key={status}
          variant={selected === status ? "contained" : "outlined"}
          color={STATUS_COLOR_MAP[status]}
          disabled={disabled}
          onClick={() => onSelect(status)}
        >
          {STATUS_LABEL_MAP[status]}
        </Button>
      ))}
    </ButtonGroup>
  );
}

