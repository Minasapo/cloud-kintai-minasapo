import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, IconButton, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { AttendanceDate } from "@/lib/AttendanceDate";

type MoveDateItemProps = {
  workDate: dayjs.Dayjs;
};

export default function MoveDateItem(props: MoveDateItemProps) {
  const navigate = useNavigate();

  const handlePrevMonth = () => {
    const prevMonth = props.workDate.subtract(1, "month").startOf("month");
    navigate(
      `/admin/attendances/${prevMonth.format(AttendanceDate.QueryParamFormat)}`
    );
  };

  const handleNextMonth = () => {
    const nextMonth = props.workDate.add(1, "month").startOf("month");
    navigate(
      `/admin/attendances/${nextMonth.format(AttendanceDate.QueryParamFormat)}`
    );
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box>
        <IconButton onClick={handlePrevMonth}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <DatePicker
        value={props.workDate}
        format={AttendanceDate.DisplayFormat}
        slotProps={{
          textField: { size: "small" },
        }}
        onChange={(date) => {
          if (date) {
            // 日付選択時は月の最初の日に統一
            const firstDay = date.startOf("month");
            navigate(
              `/admin/attendances/${firstDay.format(
                AttendanceDate.QueryParamFormat
              )}`
            );
          }
        }}
      />
      <Box>
        <IconButton onClick={handleNextMonth}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Stack>
  );
}
