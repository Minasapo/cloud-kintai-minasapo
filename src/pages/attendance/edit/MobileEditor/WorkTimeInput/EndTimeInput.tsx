import { Box, Stack, TextField } from "@mui/material";
import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";

import { AttendanceEditContext } from "../../AttendanceEditProvider";
import { AttendanceEditInputs } from "../../common";

/**
 * 勤務終了時刻の入力コンポーネント（モバイル用）。
 */
export default function EndTimeInput({
  workDate,
  control: _control,
  setValue,
}: {
  workDate: dayjs.Dayjs | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  setValue: UseFormSetValue<AttendanceEditInputs>;
}) {
  const { getQuickInputEndTimes } = useContext(AppConfigContext);

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

  const { watch, readOnly } = useContext(AttendanceEditContext);
  if (!workDate) return null;

  const endTime = watch ? watch("endTime") : null;

  return (
    <Stack direction="column" spacing={1}>
      <Stack spacing={1}>
        <TextField
          type="time"
          size="small"
          value={endTime ? dayjs(endTime).format("HH:mm") : ""}
          onChange={(e) => {
            const v = e.target.value;
            setValue(
              "endTime",
              v
                ? dayjs(workDate.format("YYYY-MM-DD") + " " + v)
                    .second(0)
                    .millisecond(0)
                    .toISOString()
                : null,
              { shouldDirty: true }
            );
          }}
        />
        <Box>
          <QuickInputChips
            quickInputTimes={quickInputEndTimes}
            workDate={workDate}
            disabled={!!readOnly}
            onSelectTime={(endTime) => {
              if (readOnly) return;
              setValue("endTime", endTime);
            }}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
