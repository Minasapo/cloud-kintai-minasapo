import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack, TextField } from "@mui/material";
import dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";

import { AttendanceEditContext } from "../../AttendanceEditProvider";

export default function StartTimeInputMobile({
  dataTestId = "mobile-start-time-input",
}: {
  dataTestId?: string;
} = {}) {
  const { workDate, setValue, watch, changeRequests } = useContext(
    AttendanceEditContext
  );
  const { getQuickInputStartTimes } = useContext(AppConfigContext);
  const [quickInputStartTimes, setQuickInputStartTimes] = useState<
    { time: string; enabled: boolean }[]
  >([]);

  useEffect(() => {
    const quickInputStartTimes = getQuickInputStartTimes(true);
    setQuickInputStartTimes(
      quickInputStartTimes.map((entry) => ({
        time: entry.time,
        enabled: entry.enabled,
      }))
    );
  }, [getQuickInputStartTimes]);

  if (!workDate || !setValue) return null;

  const startTime = watch ? watch("startTime") : null;

  return (
    <Stack spacing={1}>
      <TextField
        type="time"
        size="small"
        inputProps={{ "data-testid": dataTestId }}
        value={startTime ? dayjs(startTime).format("HH:mm") : ""}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return setValue("startTime", null, { shouldDirty: true });
          const iso = dayjs(workDate.format("YYYY-MM-DD") + " " + v)
            .second(0)
            .millisecond(0)
            .toISOString();
          setValue("startTime", iso, { shouldDirty: true });
        }}
      />
      <Box>
        <Stack direction="row" spacing={1}>
          {quickInputStartTimes.map((entry, index) => (
            <Chip
              key={index}
              label={entry.time}
              color="success"
              variant="outlined"
              icon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
              disabled={changeRequests.length > 0}
              onClick={() => {
                const startTime = dayjs(
                  `${workDate.format("YYYY-MM-DD")} ${entry.time}`
                ).toISOString();
                setValue("startTime", startTime, { shouldDirty: true });
              }}
            />
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
