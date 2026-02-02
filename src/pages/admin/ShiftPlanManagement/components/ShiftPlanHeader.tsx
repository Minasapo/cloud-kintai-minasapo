import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, IconButton, Stack, Typography } from "@mui/material";

type ShiftPlanHeaderProps = {
  selectedYear: number;
  isBusy: boolean;
  onYearChange: (delta: number) => void;
};

const ShiftPlanHeader: React.FC<ShiftPlanHeaderProps> = ({
  selectedYear,
  isBusy,
  onYearChange,
}: ShiftPlanHeaderProps) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box>
        <Typography component="h1" variant="h4" fontWeight="bold">
          シフト計画管理
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          年ごとのシフト申請期間を管理し、各月の受付開始・締切日を調整できます。
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          aria-label="前の年"
          onClick={() => onYearChange(-1)}
          disabled={isBusy}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5" component="div" fontWeight="bold">
          {selectedYear}年
        </Typography>
        <IconButton
          aria-label="次の年"
          onClick={() => onYearChange(1)}
          disabled={isBusy}
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default ShiftPlanHeader;
