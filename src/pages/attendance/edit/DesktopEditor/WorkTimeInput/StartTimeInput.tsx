import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext, useMemo } from "react";
import { Controller } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";

import { AttendanceEditContext } from "../../AttendanceEditProvider";

export default function StartTimeInput({
  dataTestId = "start-time-input",
  highlight = false,
}: {
  dataTestId?: string;
  highlight?: boolean;
} = {}) {
  const { workDate, control, setValue, changeRequests, readOnly } = useContext(
    AttendanceEditContext
  );
  const { getQuickInputStartTimes } = useContext(AppConfigContext);

  // Derived state: compute quickInputStartTimes from getQuickInputStartTimes
  const quickInputStartTimes = useMemo(() => {
    const times = getQuickInputStartTimes(true);
    return times.map((entry) => ({
      time: entry.time,
      enabled: entry.enabled,
    }));
  }, [getQuickInputStartTimes]);

  if (!workDate || !control || !setValue) return null;

  return (
    <Stack spacing={1}>
      <Controller
        key={highlight ? "highlight-on" : "highlight-off"}
        name="startTime"
        control={control}
        render={({ field }) => (
          <TimePicker
            ampm={false}
            value={field.value ? dayjs(field.value) : null}
            disabled={changeRequests.length > 0 || !!readOnly}
            slotProps={{
              textField: {
                size: "small",
                inputProps: { "data-testid": dataTestId },
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
              },
            }}
            onChange={(value) => {
              if (!value) {
                field.onChange(null);
                return;
              }
              if (!value.isValid()) {
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
              disabled={changeRequests.length > 0 || !!readOnly}
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
