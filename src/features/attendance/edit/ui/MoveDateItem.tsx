import "@/shared/lib/dayjs-locale";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, IconButton, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";

export default function MoveDateItem({
  staffId,
  workDate,
}: {
  staffId?: string;
  workDate: dayjs.Dayjs | null;
}) {
  const navigate = useNavigate();
  const today = dayjs();

  if (!workDate) {
    return null;
  }

  const isAdmin = Boolean(staffId);
  const format = isAdmin
    ? AttendanceDate.DatePickerFormat
    : AttendanceDate.DisplayFormat;
  const buildPath = (date: dayjs.Dayjs) => {
    const formatted = date.format(AttendanceDate.QueryParamFormat);
    return isAdmin
      ? `/admin/attendances/edit/${formatted}/${staffId}`
      : `/attendance/${formatted}/edit`;
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box>
        <IconButton
          onClick={() => {
            const prevDate = workDate.add(-1, "day");
            navigate(buildPath(prevDate));
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
      <DatePicker
        value={workDate}
        format={format}
        slotProps={{
          textField: { size: "small" },
        }}
        onChange={(date) => {
          if (date) {
            navigate(buildPath(date));
          }
        }}
      />
      <Box>
        <IconButton
          disabled={!isAdmin && workDate.isSame(today, "day")}
          onClick={() => {
            const nextDate = workDate.add(1, "day");
            navigate(buildPath(nextDate));
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Stack>
  );
}
