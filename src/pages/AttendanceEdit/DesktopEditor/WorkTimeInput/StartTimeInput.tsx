import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { Controller } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";

import { AttendanceEditContext } from "../../AttendanceEditProvider";

export default function StartTimeInput({
  dataTestId = "start-time-input",
}: {
  dataTestId?: string;
} = {}) {
  const { workDate, control, setValue, changeRequests } = useContext(
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

  if (!workDate || !control || !setValue) return null;

  return (
    <Stack spacing={1}>
      <Controller
        name="startTime"
        control={control}
        render={({ field }) => (
          <TimePicker
            ampm={false}
            value={field.value ? dayjs(field.value) : null}
            disabled={changeRequests.length > 0}
            slotProps={{
              textField: {
                size: "small",
                inputProps: { "data-testid": dataTestId },
              },
            }}
            onChange={(value) => {
              if (!value || !value.isValid()) {
                return;
              }

              const formattedStartTime = value
                .year(workDate.year())
                .month(workDate.month())
                .date(workDate.date())
                .second(0)
                .millisecond(0)
                .toISOString();
              field.onChange(formattedStartTime);
            }}
          />
        )}
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
