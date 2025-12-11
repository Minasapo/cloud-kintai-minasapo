import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack, TextField } from "@mui/material";
import dayjs from "dayjs";
import { useContext } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";
import { RestInputs } from "@/pages/attendance/edit/common";

import { AttendanceEditContext } from "../../AttendanceEditProvider";

export default function RestStartTimeInputMobile({
  rest,
  index,
  testIdPrefix = "mobile",
}: {
  rest: RestInputs;
  index: number;
  testIdPrefix?: string;
}) {
  const { workDate, restUpdate, changeRequests } = useContext(
    AttendanceEditContext
  );
  const { getLunchRestStartTime } = useContext(AppConfigContext);

  if (!workDate || !restUpdate) return null;

  const value = rest.startTime ? dayjs(rest.startTime).format("HH:mm") : "";

  return (
    <Stack spacing={1}>
      <TextField
        type="time"
        size="small"
        inputProps={{
          "data-testid": "rest-start-time-input-" + testIdPrefix + "-" + index,
        }}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return restUpdate(index, { ...rest, startTime: null });
          const iso = dayjs(workDate.format("YYYY-MM-DD") + " " + v)
            .second(0)
            .millisecond(0)
            .toISOString();
          restUpdate(index, { ...rest, startTime: iso });
        }}
      />
      <Box>
        <Chip
          label={getLunchRestStartTime().format("HH:mm")}
          variant="outlined"
          color="success"
          icon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
          disabled={changeRequests.length > 0}
          data-testid={`rest-lunch-chip-${index}`}
          onClick={() => {
            const lunchRestStartTime = getLunchRestStartTime().format("HH:mm");
            const startTime = dayjs(
              `${workDate.format("YYYY-MM-DD")} ${lunchRestStartTime}`
            )
              .second(0)
              .millisecond(0)
              .toISOString();
            restUpdate(index, { ...rest, startTime });
          }}
        />
      </Box>
    </Stack>
  );
}
