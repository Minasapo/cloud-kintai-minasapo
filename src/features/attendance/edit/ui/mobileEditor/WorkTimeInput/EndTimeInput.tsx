import { Box, Stack, TextField } from "@mui/material";
import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import dayjs from "dayjs";
import { useContext, useMemo } from "react";
import { UseFormSetValue } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

/**
 * 勤務終了時刻の入力コンポーネント（モバイル用）。
 */
export default function EndTimeInput({
  workDate,
  setValue,
}: {
  workDate: dayjs.Dayjs | null;
  setValue: UseFormSetValue<AttendanceEditInputs>;
}) {
  const { getQuickInputEndTimes } = useContext(AppConfigContext);

  // Derived state: compute quickInputEndTimes from getQuickInputEndTimes
  const quickInputEndTimes = useMemo(() => {
    const quickInputTimes = getQuickInputEndTimes(true);
    if (quickInputTimes.length > 0) {
      return quickInputTimes.map((entry) => ({
        time: entry.time,
        enabled: entry.enabled,
      }));
    }
    return [];
  }, [getQuickInputEndTimes]);

  const { watch, readOnly, isOnBreak } = useContext(AttendanceEditContext);
  if (!workDate) return null;

  const endTime = watch ? watch("endTime") : null;

  return (
    <Stack direction="column" spacing={1}>
      <Stack spacing={1}>
        <TextField
          type="time"
          size="small"
          disabled={!!readOnly || isOnBreak}
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
            disabled={!!readOnly || isOnBreak}
            onSelectTime={(endTime) => {
              if (readOnly || isOnBreak) return;
              setValue("endTime", endTime, { shouldDirty: true });
            }}
          />
        </Box>
      </Stack>
    </Stack>
  );
}
