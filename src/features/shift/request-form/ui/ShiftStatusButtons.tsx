import { Box } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { AppButton } from "@shared/ui/button";

import { ShiftRequestDayStatus } from "../model/statusMapping";
import { STATUS_LABEL_MAP } from "./constants";

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
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: isMobile ? "wrap" : "nowrap",
        gap: 1,
      }}
    >
      {(
        ["work", "fixedOff", "requestedOff", "auto"] as ShiftRequestDayStatus[]
      ).map((status) => {
        const palette = {
          work: theme.palette.success,
          fixedOff: theme.palette.error,
          requestedOff: theme.palette.warning,
          auto: theme.palette.info,
        }[status];
        const isSelected = selected === status;

        return (
          <AppButton
            key={status}
            variant={isSelected ? "solid" : "outline"}
            tone="neutral"
            size="sm"
            disabled={disabled}
            onClick={() => onSelect(status)}
            sx={
              isSelected
                ? {
                    backgroundColor: `${palette.main} !important`,
                    borderColor: `${palette.dark ?? palette.main} !important`,
                    color: `${palette.contrastText} !important`,
                    "&:hover": {
                      backgroundColor: `${palette.dark ?? palette.main} !important`,
                      boxShadow:
                        "inset 0 -2px 0 rgba(0,0,0,0.12), 0 12px 24px -18px rgba(0,0,0,0.25)",
                    },
                  }
                : {
                    backgroundColor: `${theme.palette.background.paper} !important`,
                    borderColor: `${palette.main} !important`,
                    color: `${(palette as { dark?: string }).dark ?? palette.main} !important`,
                    "&:hover": {
                      backgroundColor: `${alpha(palette.main, 0.12)} !important`,
                      boxShadow: "none",
                    },
                  }
            }
          >
            {STATUS_LABEL_MAP[status]}
          </AppButton>
        );
      })}
    </Box>
  );
}
