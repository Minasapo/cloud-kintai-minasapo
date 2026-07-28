import LockIcon from "@mui/icons-material/Lock";
import { Box, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import dayjs from "dayjs";

import { PendingLockAction } from "../../hooks/useVirtualizedShiftTableState";

interface ShiftTableHeaderProps {
  days: dayjs.Dayjs[];
  isAdmin?: boolean;
  isAllMonthLocked: boolean;
  calculateDailyCount: (day: dayjs.Dayjs) => {
    work: number;
    fixedOff: number;
    requestedOff: number;
    plannedCapacity: number;
  };
  isWeekend: (day: dayjs.Dayjs) => boolean;
  onPendingAction: (action: PendingLockAction) => void;
}

const ShiftTableHeader = ({
  days,
  isAdmin,
  isAllMonthLocked,
  calculateDailyCount,
  isWeekend,
  onPendingAction,
}: ShiftTableHeaderProps) => (
  <TableHead>
    <TableRow>
      <TableCell
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 3,
          bgcolor: "background.paper",
          whiteSpace: "nowrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          スタッフ名
          {isAdmin && (
            <AppButton
              size="sm"
              variant="outline"
              tone="neutral"
              startIcon={<LockIcon fontSize="inherit" />}
              onClick={() => onPendingAction({ kind: "lockMonth" })}
              disabled={isAllMonthLocked}
              sx={{
                fontSize: "0.7rem",
                py: 0.25,
                px: 1,
                color: "primary.main",
                borderColor: "primary.main",
              }}
            >
              全員確定
            </AppButton>
          )}
        </Box>
      </TableCell>
      {days.map((day) => {
        const dayKey = day.format("DD");
        const count = calculateDailyCount(day);
        return (
          <TableCell
            key={dayKey}
            align="center"
            sx={{
              bgcolor: isWeekend(day)
                ? "rgba(244, 67, 54, 0.05)"
                : "background.paper",
              minWidth: 50,
            }}
          >
            <Typography variant="caption" display="block">
              {day.format("M/D")}
            </Typography>
            <Typography variant="caption" display="block">
              ({day.format("ddd")})
            </Typography>
            <Typography
              variant="caption"
              color={
                count.work !== count.plannedCapacity
                  ? "warning.main"
                  : "text.secondary"
              }
            >
              {count.work}人
            </Typography>
          </TableCell>
        );
      })}
    </TableRow>
  </TableHead>
);

export default ShiftTableHeader;
