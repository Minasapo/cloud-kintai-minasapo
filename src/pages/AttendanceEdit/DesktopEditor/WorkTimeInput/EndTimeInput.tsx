import { Box, Stack } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { Controller } from "react-hook-form";

import QuickInputChips from "@/components/QuickInputChips";
import { AppConfigContext } from "@/context/AppConfigContext";

import { AttendanceEditContext } from "../../AttendanceEditProvider";

export default function EndTimeInput({
  dataTestId = "end-time-input",
}: { dataTestId?: string } = {}) {
  const { getQuickInputEndTimes } = useContext(AppConfigContext);
  const { workDate, control, setValue, changeRequests, readOnly } = useContext(
    AttendanceEditContext
  );

  const [quickInputEndTimes, setQuickInputEndTimes] = useState<
    { time: string; enabled: boolean }[]
  >([]);

  useEffect(() => {
    const quickInputTimes = getQuickInputEndTimes(true);
    if (quickInputTimes.length > 0) {
      setQuickInputEndTimes(
        quickInputTimes.map((entry) => ({
          time: entry.time,
          enabled: entry.enabled,
        }))
      );
    }
  }, [getQuickInputEndTimes]);

  if (!workDate || !control || !setValue) return null;

  return (
    <Stack direction="row" spacing={1}>
      <Stack spacing={1}>
        <Controller
          name="endTime"
          control={control}
          render={({ field }) => (
            <TimePicker
              value={field.value ? dayjs(field.value) : null}
              ampm={false}
              disabled={changeRequests.length > 0 || !!readOnly}
              slotProps={{
                textField: {
                  size: "small",
                  inputProps: { "data-testid": dataTestId },
                },
              }}
              onChange={(value) => {
                if (!value) return null;
                if (!value.isValid()) return;

                const formattedEndTime = value
                  .year(workDate.year())
                  .month(workDate.month())
                  .date(workDate.date())
                  .second(0)
                  .millisecond(0)
                  .toISOString();
                field.onChange(formattedEndTime);
              }}
            />
          )}
        />
        <Box>
          <QuickInputChips
            quickInputTimes={quickInputEndTimes}
            workDate={workDate}
            disabled={changeRequests.length > 0 || !!readOnly}
            onSelectTime={(endTime) =>
              setValue("endTime", endTime, { shouldDirty: true })
            }
          />
        </Box>
      </Stack>
    </Stack>
  );
}
