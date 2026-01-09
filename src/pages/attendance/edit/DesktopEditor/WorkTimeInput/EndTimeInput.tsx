import { Box, Stack } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import dayjs from "dayjs";
import { useContext, useMemo } from "react";
import { Controller } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";

import { AttendanceEditContext } from "../../AttendanceEditProvider";

export default function EndTimeInput({
  dataTestId = "end-time-input",
  highlight = false,
}: { dataTestId?: string; highlight?: boolean } = {}) {
  const { getQuickInputEndTimes } = useContext(AppConfigContext);
  const { workDate, control, setValue, changeRequests, readOnly, isOnBreak } =
    useContext(AttendanceEditContext);

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

  if (!workDate || !control || !setValue) return null;

  return (
    <Stack direction="row" spacing={1}>
      <Stack spacing={1}>
        <Controller
          key={highlight ? "highlight-on" : "highlight-off"}
          name="endTime"
          control={control}
          render={({ field }) => (
            <TimePicker
              value={field.value ? dayjs(field.value) : null}
              ampm={false}
              disabled={changeRequests.length > 0 || !!readOnly || isOnBreak}
              slotProps={{
                textField: {
                  size: "small",
                  sx: highlight
                    ? {
                        "& .MuiOutlinedInput-root": {
                          animation: "highlightPulse 2.5s ease-in-out",
                          "@keyframes highlightPulse": {
                            "0%, 100%": {
                              backgroundColor: "transparent",
                              borderColor: "rgba(0, 0, 0, 0.23)",
                            },
                            "15%, 50%": {
                              backgroundColor: "#FFE082",
                              borderColor: "#FFC107",
                              boxShadow: "0 0 12px rgba(255, 193, 7, 0.6)",
                            },
                            "85%": {
                              backgroundColor: "#FFF9C4",
                              borderColor: "#FFC107",
                              boxShadow: "0 0 8px rgba(255, 193, 7, 0.4)",
                            },
                          },
                        },
                      }
                    : undefined,
                  inputProps: { "data-testid": dataTestId },
                },
              }}
              onChange={(value) => {
                if (!value) {
                  field.onChange(null);
                  return;
                }
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
            disabled={changeRequests.length > 0 || !!readOnly || isOnBreak}
            onSelectTime={(endTime) =>
              setValue("endTime", endTime, { shouldDirty: true })
            }
          />
        </Box>
      </Stack>
    </Stack>
  );
}
