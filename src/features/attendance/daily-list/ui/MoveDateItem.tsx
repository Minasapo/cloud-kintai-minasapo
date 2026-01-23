import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, IconButton, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";

type MoveDateItemProps = {
  workDate: dayjs.Dayjs;
};

export default function MoveDateItem(props: MoveDateItemProps) {
  const navigate = useNavigate();

  const handlePrevDay = () => {
    const prevDay = props.workDate.subtract(1, "day");
    navigate(
      `/admin/attendances/${prevDay.format(AttendanceDate.QueryParamFormat)}`
    );
  };

  const handleNextDay = () => {
    const nextDay = props.workDate.add(1, "day");
    navigate(
      `/admin/attendances/${nextDay.format(AttendanceDate.QueryParamFormat)}`
    );
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box>
        <IconButton onClick={handlePrevDay}>
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
            navigate(
              `/admin/attendances/${date.format(
                AttendanceDate.QueryParamFormat
              )}`
            );
          }
        }}
      />
      <Box>
        <IconButton onClick={handleNextDay}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Stack>
  );
}
