import { LunchRestTimeNotSetWarning } from "@features/attendance/edit/LunchRestTimeNotSetWarning";
import AddAlarmIcon from "@mui/icons-material/AddAlarm";
import { Box, IconButton, Stack, styled, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";

import { AttendanceEditContext } from "../../AttendanceEditProvider";
import NoRestTimeMessage from "./NoRestTimeMessage";
import {
  calcTotalRestTime,
  RestTimeInput,
} from "./RestTimeInput/RestTimeInput";

const Label = styled(Typography)(() => ({
  width: "150px",
  fontWeight: "bold",
}));

export default function RestTimeItem() {
  const { restFields, restAppend, changeRequests, watch, workDate, isOnBreak } =
    useContext(AttendanceEditContext);

  const [visibleRestWarning, setVisibleRestWarning] = useState(false);

  useEffect(() => {
    if (!watch) return;

    const subscription: unknown = watch((data) => {
      if (!data) return;

      const startTime = data.startTime;
      const endTime = data.endTime;

      if (!startTime || !endTime) {
        setVisibleRestWarning(false);
        return;
      }

      const totalWorkTime = dayjs(endTime).diff(dayjs(startTime), "hour", true);

      const totalRestTime =
        data.rests?.reduce((acc, rest) => {
          if (!rest) return acc;
          if (!rest.endTime) return acc;

          const diff = calcTotalRestTime(rest.startTime, rest.endTime);
          return acc + diff;
        }, 0) ?? 0;

      setVisibleRestWarning(totalWorkTime > 6 && totalRestTime === 0);
    });

    // react-hook-form's watch returns an unsubscribe function or an object with unsubscribe
    return () => {
      // subscription can be a function or an object with unsubscribe
      if (typeof subscription === "function") {
        try {
          (subscription as () => void)();
        } catch {
          /* ignore */
        }
        return;
      }

      if (
        subscription &&
        typeof (subscription as { unsubscribe?: unknown }).unsubscribe ===
          "function"
      ) {
        try {
          (subscription as { unsubscribe: () => void }).unsubscribe();
        } catch {
          /* ignore */
        }
      }
    };
  }, [watch]);

  if (!restAppend) {
    return null;
  }

  return (
    <Stack direction="row">
      <Label variant="body1" sx={{ fontWeight: "bold", width: "150px" }}>
        休憩時間
      </Label>
      <Stack spacing={1} sx={{ flexGrow: 2 }}>
        <NoRestTimeMessage restFields={restFields} />
        {restFields.length === 0 && visibleRestWarning && (
          <Box>
            <LunchRestTimeNotSetWarning
              targetWorkDate={workDate ? workDate.toISOString() : undefined}
            />
          </Box>
        )}
        {restFields.map((rest, index) => (
          <RestTimeInput key={index} rest={rest} index={index} />
        ))}
        <Box>
          <IconButton
            aria-label="staff-search"
            data-testid="add-rest-time"
            disabled={changeRequests.length > 0 || isOnBreak}
            onClick={() =>
              restAppend({
                startTime: null,
                endTime: null,
              })
            }
          >
            <AddAlarmIcon />
          </IconButton>
        </Box>
      </Stack>
    </Stack>
  );
}
