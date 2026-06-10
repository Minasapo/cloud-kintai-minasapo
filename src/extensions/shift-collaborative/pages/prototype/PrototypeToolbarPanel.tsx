import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { AppButton } from "@shared/ui/button";
import { ProgressBar } from "@shared/ui/feedback";
import type { Dayjs } from "dayjs";

interface PrototypeToolbarPanelProps {
  monthStart: Dayjs;
  progress: {
    confirmed: number;
    needsAdjustment: number;
    empty: number;
    percentage: number;
  };
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function PrototypeToolbarPanel({
  monthStart,
  progress,
  onPrevMonth,
  onNextMonth,
}: PrototypeToolbarPanelProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AppButton variant="outline" size="sm" onClick={onPrevMonth}>
            前月
          </AppButton>
          <Chip
            label={monthStart.format("YYYY年 M月")}
            sx={{ minWidth: 120 }}
          />
          <AppButton variant="outline" size="sm" onClick={onNextMonth}>
            翌月
          </AppButton>
        </Box>

        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              📊 {monthStart.format("YYYY年M月")} シフト状況
            </Typography>
            <Typography variant="body2" color="text.secondary">
              進捗: {progress.percentage}%
            </Typography>
          </Box>
          <ProgressBar
            data-testid="shift-progress-bar"
            aria-label="Shift progress"
          />
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="caption">
              ✓ 確定済み: {progress.confirmed}日
            </Typography>
            <Typography variant="caption" color="warning.main">
              ⚠ 要調整: {progress.needsAdjustment}日
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ○ 未入力: {progress.empty}日
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}